import { supabase } from "@/lib/supabase";

export async function getUserScanHistory(profileId: string) {
  try {
    const { data, error } = await supabase
      .from("scan_history")
      .select("id, profiles_id, trashbin_id, scanned_at, location, points_awarded")
      .eq("profiles_id", profileId)
      .order("scanned_at", { ascending: false });

    if (error) {
      console.error("Error fetching scan history:", error.message);
      return { success: false, error: error.message, data: [] };
    }

    console.log("✅ Scan history fetched:", data); // 👈 add this
    return { success: true, data, error: null };
  } catch (err) {
    console.error("Unexpected error fetching scan history:", err);
    return { success: false, error: "Unexpected error occurred", data: [] };
  }
}
