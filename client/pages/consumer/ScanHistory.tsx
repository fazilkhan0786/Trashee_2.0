import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getUserScanHistory } from "@/lib/scanHistoryService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ScanHistory() {
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScanHistory() {
      setLoading(true);
      try {
        // ✅ Get logged-in user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("You must be logged in to view scan history");
          setLoading(false);
          return;
        }

        console.log("🔑 Auth user id:", user.id);

        // ✅ Fetch profile.id (same UUID as auth.user.id)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          console.error("Profile lookup failed:", profileError?.message);
          setError("Profile not found for this user");
          setLoading(false);
          return;
        }

        console.log("🧑 Profile id:", profile.id);

        // ✅ Fetch scan history
        const { success, data, error } = await getUserScanHistory(profile.id);

        console.log("📜 Scan history result:", data);

        if (!success || error) {
          setError("Failed to load scan history. Please try again.");
        } else {
          setScanHistory(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchScanHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : scanHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No scans recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {scanHistory.map((scan) => (
                <div
                  key={scan.id}
                  className="p-3 border rounded hover:bg-gray-50 flex justify-between"
                >
                  <div>
                    <p className="text-sm text-gray-600">
                      Bin ID: {scan.trashbin_id || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date:{" "}
                      {scan.scanned_at
                        ? new Date(scan.scanned_at).toLocaleString()
                        : scan.created_at
                        ? new Date(scan.created_at).toLocaleString()
                        : "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Location: {scan.location || "Unknown"}
                    </p>
                  </div>
                  <p className="font-semibold text-green-600">
                    +{scan.points_awarded ?? 0} points
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
