"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Segment = {
  label: string;
  color: string;
  type: "points" | "tryAgain";
  value?: number;
};

const segments: Segment[] = [
  { label: "100 Points", color: "#22c55e", type: "points", value: 100 },
  { label: "Better Luck", color: "#ef4444", type: "tryAgain" },
  { label: "50 Points", color: "#3b82f6", type: "points", value: 50 },
  { label: "Better Luck", color: "#f97316", type: "tryAgain" },
  { label: "200 Points", color: "#a855f7", type: "points", value: 200 },
  { label: "Better Luck", color: "#eab308", type: "tryAgain" },
  { label: "500 Points", color: "#ec4899", type: "points", value: 500 },
  { label: "Better Luck", color: "#14b8a6", type: "tryAgain" },
];

export default function WheelOfLuck() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<{ segment: Segment; claimed: boolean } | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [points, setPoints] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Fetch user and points
  useEffect(() => {
    const fetchUserAndPoints = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", user.id)
        .single();

      setPoints(data?.points || 0);
    };

    fetchUserAndPoints();
  }, []);

  // ✅ Spin logic
  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    const randomSpin = 2000 + Math.random() * 2000;
    const newRotation = rotation + randomSpin;

    setRotation(newRotation);

    setTimeout(() => {
      const normalizedRotation = newRotation % 360;
      const segmentAngle = 360 / segments.length;
      const winningIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % segments.length;
      const winningSegment = segments[winningIndex];

      setSpinResult({ segment: winningSegment, claimed: false });
      setShowResultDialog(true);
      setSpinning(false);
    }, 4000);
  };

  // ✅ Claim prize → update user_points
  const claimPrize = async () => {
    if (!spinResult || !userId) return;

    if (spinResult.segment.type === "points" && spinResult.segment.value) {
      const newPoints = points + spinResult.segment.value;

      await supabase
        .from("user_points")
        .update({ points: newPoints })
        .eq("user_id", userId);

      setPoints(newPoints);
    }

    setSpinResult((prev) => (prev ? { ...prev, claimed: true } : null));
    setShowResultDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-emerald-700 mb-2">🎡 Wheel of Luck</h1>
      <p className="mb-6 text-gray-700">Your Points: {points}</p>

      {/* Wheel */}
      <div className="relative w-72 h-72 mb-8">
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: "easeOut" }}
          className="w-full h-full rounded-full overflow-hidden shadow-lg"
          style={{ transformOrigin: "center center" }}
        >
          {segments.map((segment, index) => {
            const segmentAngle = 360 / segments.length;
            return (
              <div
                key={index}
                className="absolute w-1/2 h-1/2 origin-bottom-right"
                style={{
                  transform: `rotate(${index * segmentAngle}deg) skewY(-${90 - segmentAngle}deg)`,
                  backgroundColor: segment.color,
                }}
              >
                <div
                  className="absolute w-full h-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ transform: "skewY(" + (90 - segmentAngle) + "deg) rotate(" + segmentAngle / 2 + "deg)" }}
                >
                  {segment.label}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-0 h-0 border-l-8 border-r-8 border-b-16 border-b-red-500 border-l-transparent border-r-transparent"></div>
      </div>

      <Button
        onClick={spin}
        disabled={spinning}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg disabled:opacity-50"
      >
        {spinning ? "Spinning..." : "Spin Now"}
      </Button>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="bg-white rounded-xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">🎁 Result</DialogTitle>
          </DialogHeader>
          {spinResult && (
            <div className="text-center">
              <p className="text-lg mb-4">
                {spinResult.segment.type === "points"
                  ? `You won ${spinResult.segment.value} points! 🎉`
                  : "Better luck next time! 😢"}
              </p>
              {spinResult.segment.type === "points" && !spinResult.claimed && (
                <Button onClick={claimPrize} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Claim Reward
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
