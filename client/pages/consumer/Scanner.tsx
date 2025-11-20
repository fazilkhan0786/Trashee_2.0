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

export default function ConsumerScanner() {
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-emerald-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-emerald-100"
          >
            <ArrowLeft className="w-5 h-5 text-emerald-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-emerald-800">QR Scanner</h1>
            <p className="text-sm text-emerald-600/80">
              Scan trash bins to earn points
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Scanner Interface */}
        <Card className="bg-white rounded-2xl shadow-lg border border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-800">Camera Scanner</span>
            </CardTitle>
            <CardDescription className="text-emerald-600/80">
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
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:opacity-90 text-white shadow-md transition-all duration-200"
            >
              {isScanning ? "Scanning..." : (cooldownTime > 0 ? `Wait ${formatCooldownTime(cooldownTime)}` : "Scan QR Code")}
            </Button>

            {isScanning && (
              <div className="relative aspect-video border-2 border-emerald-200 rounded-xl overflow-hidden shadow-inner bg-gray-900">
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
          <Card className="bg-white rounded-2xl shadow-lg border border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {lastScan.error ? (
                  <X className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                )}
                <span className="text-emerald-800">
                  {lastScan.error ? "Scan Failed" : "Scan Successful!"}
                </span>
              </CardTitle>
            </CardHeader>
            {!lastScan.error && (
              <CardContent className="space-y-3">
                <p className="font-bold text-2xl text-emerald-700">
                  You earned {lastScan.points} points!
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-emerald-600/80">Bin ID</p>
                    <p className="font-medium">{lastScan.trashbin_id}</p>
                  </div>
                  <div>
                    <p className="text-emerald-600/80">Location</p>
                    <p className="font-medium">{lastScan.location}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-emerald-600/80">Timestamp</p>
                    <p className="font-medium">{lastScan.timestamp}</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Scan History */}
        <Card className="bg-white rounded-2xl shadow-lg border border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-800">Recent Scans</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanHistory.length > 0 ? (
                scanHistory.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-3 border border-emerald-100 rounded-lg">
                    <div>
                      <p className="font-medium text-emerald-800">
                        Bin: {scan.trashbin_id}
                      </p>
                      <p className="text-xs text-emerald-600/80">
                        {new Date(scan.scanned_at).toLocaleString("en-IN", { dateStyle: 'short', timeStyle: 'short'})}
                      </p>
                    </div>
                    {/* ✅ FIX: Use 'points_awarded' to display points */ }
                    <Badge className="text-emerald-700 border-emerald-200 bg-emerald-100 font-semibold">
                      +{scan.points_awarded} Points
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-emerald-600/70 text-sm text-center py-4">No recent scans</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}