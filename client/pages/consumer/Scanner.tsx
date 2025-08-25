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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { QrReader } from "react-qr-reader"; // ✅ correct import for v3+

export default function ConsumerScanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<any>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [noQrMessage, setNoQrMessage] = useState(false);

  // Fetch scan history on load
  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("scan_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error) {
      setScanHistory(data || []);
    } else {
      console.error("Error fetching scan history:", error);
    }
  };

  // Handle cooldown countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle QR scan success
  const handleScan = async (data: string) => {
    if (data && isScanning && cooldownTime === 0) {
      setIsScanning(false); // stop scanning after success
      setNoQrMessage(false);
      console.log("QR Code Detected:", data);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user logged in");
        return;
      }

      // Assign random points
      const points = Math.floor(Math.random() * 20) + 10; // 10–30 points
      const location =
        ["Green Park", "Metro Station", "Shopping Mall", "City Center"][
          Math.floor(Math.random() * 4)
        ];

      // Save scan in Supabase
      const { error: insertError } = await supabase.from("scan_history").insert({
        user_id: user.id,
        bin_id: data,
        location,
        points,
        scan_type: "general",
        status: "completed",
      });

      if (insertError) {
        console.error("Error saving scan:", insertError);
      }

      // Update user_points table
      const { data: existingPoints, error: fetchError } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching user points:", fetchError);
      }

      if (existingPoints) {
        await supabase
          .from("user_points")
          .update({ points: existingPoints.points + points })
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("user_points")
          .insert({ user_id: user.id, points });
      }

      // Update UI
      const newScan = {
        id: data,
        location,
        timestamp: new Date().toLocaleString("en-IN"),
        points,
      };

      setLastScan(newScan);
      setCooldownTime(300); // 5 min cooldown
      fetchScanHistory();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">QR Scanner</h1>
            <p className="text-sm text-gray-500">
              Scan trash bins to earn points
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Scanner Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-600" />
              Camera Scanner
            </CardTitle>
            <CardDescription>
              Point your camera at a trash bin QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scan Button */}
            <Button
              variant="default"
              onClick={() => {
                setIsScanning(true);
                setNoQrMessage(false);
              }}
              disabled={cooldownTime > 0 || isScanning}
            >
              {cooldownTime > 0
                ? `Wait ${formatCooldownTime(cooldownTime)}`
                : "Scan QR Code"}
            </Button>

            {/* QR Reader visible only when scanning */}
            {isScanning && (
              <div style={{ width: "100%", marginTop: "10px" }}>
              <QrReader
                constraints={{ facingMode: "environment" }}
                onResult={(result, error) => {
                if (!!result) {
                  handleScan(result.getText());
             }
             if (!!error) {
                setNoQrMessage(true);
               console.error("QR Scan Error:", error);
      }
    }}
  />
</div>

            )}

            {/* No QR feedback */}
            {isScanning && noQrMessage && (
              <p className="text-red-500 text-sm mt-2">
                No QR code detected. Please try again.
              </p>
            )}

            {/* Cooldown info */}
            {cooldownTime > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                <div className="flex items-center gap-2 text-orange-800">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Next scan available in {formatCooldownTime(cooldownTime)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Scan Result */}
        {lastScan && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {lastScan.error ? (
                  <X className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                Scan Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="font-bold text-green-700">
                  You earned {lastScan.points} points!
                </p>
                <p>
                  Bin ID: <Badge>{lastScan.id}</Badge>
                </p>
                <p>Location: {lastScan.location}</p>
                <p>{lastScan.timestamp}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scan History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>Your latest successful scans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanHistory.length > 0 ? (
                scanHistory.map((scan, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{scan.bin_id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(scan.created_at).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-500">{scan.location}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200"
                    >
                      +{scan.points}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No scans yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
