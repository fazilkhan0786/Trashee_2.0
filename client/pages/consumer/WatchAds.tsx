import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function WatchAds() {
  const [ads, setAds] = useState<any[]>([]);
  const [currentAd, setCurrentAd] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAds() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("advertisements") // ✅ fixed table name
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setAds(data || []);
      } catch (err) {
        console.error("Error loading ads:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAds();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Ads List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Ads</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : ads.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No ads available at the moment.
            </p>
          ) : (
            <div className="space-y-2">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className="p-3 border rounded flex justify-between items-center hover:bg-gray-50"
                >
                  <span>{ad.title}</span>
                  <Button onClick={() => setCurrentAd(ad)}>Watch</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Ad Player */}
      {currentAd ? (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <CardHeader className="pb-3">
            <CardTitle>{currentAd.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              src={currentAd.video_url}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
            <Button
              onClick={() => setCurrentAd(null)}
              className="mt-4 w-full"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
