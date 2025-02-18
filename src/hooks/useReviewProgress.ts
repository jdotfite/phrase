import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Reviewer } from "@/types/types";

interface ReviewProgress {
  reviewed: number;
  remaining: number;
  streak: number;
}

export const useReviewProgress = (
  reviewer: Reviewer | null,
  totalPhrases: number
): ReviewProgress => {
  const [progress, setProgress] = useState<ReviewProgress>({
    reviewed: 0,
    remaining: 0,
    streak: 0,
  });

  useEffect(() => {
    if (!reviewer) return;

    const fetchProgress = async () => {
      try {
        // Get count of reviewed phrases
        const { count: reviewedCount } = await supabase
          .from("votes")
          .select("phrase_id", { count: "exact", distinct: true })
          .eq("reviewer_id", reviewer.id);

        setProgress({
          reviewed: reviewedCount || 0,
          remaining: totalPhrases - (reviewedCount || 0),
          streak: reviewer.current_streak || 0,
        });
      } catch (error) {
        console.error("Error fetching review progress:", error);
        // Keep the current progress state on error
      }
    };

    fetchProgress();
  }, [reviewer, totalPhrases]);

  return progress;
};
