import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Scan {
  id: number;
  profiles_id: string | null;
  scanned_at: string | null;
  scan_data: string | null;
  trashbin_id: string | null;
  location: string | null;
  points_awarded: number | null;
}

export default function ScanHistory() {
  const [scanHistory, setScanHistory] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchScanHistory() {
      setLoading(true);
      try {
        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("You must be logged in to view scan history");
          setLoading(false);
          return;
        }

        console.log("Authenticated user ID:", user.id);
        setUserInfo(user);

        // First, check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", user.id)
          .single();

        console.log("Profile check result:", { profile, error: profileError });

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error checking profile:", profileError);
          setError(`Profile access error: ${profileError.message}`);
          setLoading(false);
          return;
        }

        if (!profile) {
          setError("User profile not found. Please complete your profile setup first.");
          setLoading(false);
          return;
        }

        // Fetch scan history filtered by profiles_id
        const { data, error: scansError } = await supabase
          .from("scan_history")
          .select("*")
          .eq("profiles_id", user.id)
          .order("scanned_at", { ascending: false });

        console.log("Supabase query result:", { data, error: scansError });

        if (scansError) {
          console.error("Error fetching scan history:", scansError);
          setError(`Failed to load scan history: ${scansError.message}`);
          setScanHistory([]);
        } else if (data && data.length > 0) {
          console.log("Scan history loaded:", data);
          setScanHistory(data as Scan[]);
        } else {
          console.log("No scan history found for user");
          setScanHistory([]);
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
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No scans recorded yet.</p>
              {userInfo && (
                <div className="text-sm text-gray-400">
                  <p>User ID: {userInfo.id}</p>
                  <p>Email: {userInfo.email}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {scanHistory.map((scan) => (
                <div
                  key={scan.id}
                  className="p-3 border rounded hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm text-gray-600">
                      Bin ID: {scan.trashbin_id ?? "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date:{" "}
                      {scan.scanned_at
                        ? new Date(scan.scanned_at).toLocaleString()
                        : "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Location: {scan.location ?? "Unknown"}
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
