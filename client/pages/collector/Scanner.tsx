import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Camera,
  Clock,
  CheckCircle,
  X,
  QrCode,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { QrReader } from "react-qr-reader";

export default function CollectorScanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<any>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [noQrMessage, setNoQrMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("scan_history")
      .select("*")
      .eq("profiles_id", user.id)
      .order("scanned_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching scan history:", error);
    } else {
      setScanHistory(data || []);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleScan = async (qrData: string | null) => {
    if (!qrData || !isScanning || cooldownTime > 0) return;

    setIsScanning(false);
    setNoQrMessage(false);
    setError(null);
    console.log("QR Code Detected:", qrData);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to scan.");
      return;
    }

    // --- Core Logic ---
    try {
      const pointsToAdd = Math.floor(Math.random() * 20) + 10; // 10–30 points
      const location = ["Green Park", "Metro Station", "Shopping Mall", "City Center"][Math.floor(Math.random() * 4)];

      // ✅ FIX: Use the correct column names from your SQL schema.
      // Removed 'scan_type' and 'status' as they are not in the table.
      const { data: newScanRecord, error: insertError } = await supabase
        .from("scan_history")
        .insert({
          profiles_id: user.id,
          scan_data: qrData,       // Use the 'scan_data' column for the raw QR text
          trashbin_id: qrData,     // Assuming the QR data is the UUID of the trash bin
          location: location,
          points_awarded: pointsToAdd, // Use the 'points_awarded' column
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 🔥 IMPROVEMENT: Use the atomic RPC function to update points.
      // This is safer and more efficient than reading then writing.
      const { error: pointsError } = await supabase.rpc('increment_user_points', {
        user_id_input: user.id,
        points_to_add: pointsToAdd,
      });

      if (pointsError) throw pointsError;
      
      // Update UI state with successful scan
      setLastScan({
        id: newScanRecord.id,
        trashbin_id: newScanRecord.trashbin_id,
        location: newScanRecord.location,
        timestamp: new Date(newScanRecord.scanned_at).toLocaleString("en-IN"),
        points: newScanRecord.points_awarded,
      });

      setCooldownTime(300); // 5 min cooldown
      fetchScanHistory(); // Refresh the history list

    } catch (err: any) {
      console.error("Error processing scan:", err);
      setError("Failed to process scan. The QR code might be invalid or there was a network issue.");
      setLastScan({ error: true }); // Show an error state in the UI
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white">
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="p-2 text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">QR Scanner</h1>
              <p className="text-blue-100 mt-1">Scan trash bins to earn points</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Scanner Interface */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
              <Camera className="w-5 h-5 text-blue-600" />
              Camera Scanner
            </CardTitle>
            <CardDescription className="text-gray-600">
              Point your camera at a trash bin QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                setIsScanning(true);
                setNoQrMessage(false);
                setError(null);
              }}
              disabled={cooldownTime > 0 || isScanning}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white shadow-md transition-all duration-200"
            >
              {isScanning ? "Scanning..." : (cooldownTime > 0 ? `Wait ${formatCooldownTime(cooldownTime)}` : "Scan QR Code")}
            </Button>

            {isScanning && (
              <div className="relative aspect-video border-2 border-blue-100 rounded-xl overflow-hidden shadow-inner bg-gray-900">
                <QrReader
                  constraints={{ facingMode: "environment" }}
                  onResult={(result, error) => {
                    if (result) {
                      handleScan(result.getText());
                    }
                    if (error && !result) {
                      setNoQrMessage(true);
                    }
                  }}
                  videoStyle={{ objectFit: 'cover' }}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-2/3 max-w-[250px] aspect-square border-4 border-white/50 rounded-lg shadow-[0_0_0_4000px_rgba(0,0,0,0.3)]" />
                </div>
              </div>
            )}
            
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

          </CardContent>
        </Card>

        {/* Last Scan Result */}
        {lastScan && (
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                {lastScan.error ? (
                  <X className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <span className="text-gray-800">
                  {lastScan.error ? "Scan Failed" : "Scan Successful!"}
                </span>
              </CardTitle>
            </CardHeader>
            {!lastScan.error && (
              <CardContent className="space-y-3">
                <p className="font-bold text-2xl text-green-700">
                  You earned {lastScan.points} points!
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Bin ID</p>
                    <p className="font-medium text-gray-800">{lastScan.trashbin_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium text-gray-800">{lastScan.location}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Timestamp</p>
                    <p className="font-medium text-gray-800">{lastScan.timestamp}</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Scan History */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
              <QrCode className="w-5 h-5 text-blue-600" />
              <span className="text-gray-800">Recent Scans</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanHistory.length > 0 ? (
                scanHistory.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-medium text-gray-800">
                        Bin: {scan.trashbin_id}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(scan.scanned_at).toLocaleString("en-IN", { dateStyle: 'short', timeStyle: 'short'})}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold px-3 py-1">
                      +{scan.points_awarded} Points
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent scans</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}