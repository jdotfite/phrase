import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';
import ReviewerCard from './ReviewerCard';
import Leaderboard from './Leaderboard';
import PinPad from './PinPad';
import { supabase } from '@/lib/supabase';
import type { Reviewer } from '@/types/types';

const AVATARS = ['🦁', '🐯', '🐮', '🐷', '🐸', '🐙', '🦊', '🐨', '🐰', '🐼'];

interface ReviewerSelectionProps {
  onSelectReviewer: (reviewer: Reviewer) => void;
  onClose: () => void;
}

const ReviewerSelection: React.FC<ReviewerSelectionProps> = ({ 
  onSelectReviewer, 
  onClose 
}) => {
  const [selectedReviewer, setSelectedReviewer] = useState<Reviewer | null>(null);
  const [showPinPad, setShowPinPad] = useState<boolean>(false);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviewers = async () => {
      const { data, error } = await supabase
        .from('reviewers')
        .select('*')
        .order('total_reviews', { ascending: false });
      
      if (error) {
        console.error('Error fetching reviewers:', error);
        return;
      }
      
      if (data) {
        setReviewers(data);
      }
    };

    fetchReviewers();
  }, []);

  const handlePinSubmit = async (pin: string) => {
    if (!selectedReviewer) return;

    const { data, error } = await supabase
      .from('reviewers')
      .select('id')
      .match({ id: selectedReviewer.id, pin })
      .single();

    if (data) {
      // Handle successful login
      const now = new Date();
      const lastReview = selectedReviewer.last_review_at ? new Date(selectedReviewer.last_review_at) : null;
      
      // Calculate if streak should continue or reset
      const streakContinues = lastReview && 
        (now.getTime() - lastReview.getTime()) < (24 * 60 * 60 * 1000);
      
      const current_streak = streakContinues ? selectedReviewer.current_streak : 0;

      // Update reviewer stats
      const { error: updateError } = await supabase
        .from('reviewers')
        .update({ current_streak })
        .eq('id', selectedReviewer.id);

      if (updateError) {
        console.error('Error updating reviewer streak:', updateError);
      }

      onSelectReviewer({
        ...selectedReviewer,
        current_streak
      });
    } else {
      setError('Incorrect PIN');
      setShowPinPad(false);
      setSelectedReviewer(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <AnimatePresence>
          {showPinPad ? (
            <PinPad
              onSubmit={handlePinSubmit}
              onCancel={() => {
                setShowPinPad(false);
                setSelectedReviewer(null);
                setError(null);
              }}
            />
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-8">Who's reviewing?</h2>
              
              {error && (
                <div className="bg-red-900 text-red-100 p-4 rounded-lg mb-8">
                  {error}
                </div>
              )}

              <div
                className="grid gap-6 justify-items-center"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
              >
                {reviewers.map((reviewer, index) => (
                  <ReviewerCard
                    key={reviewer.id}
                    reviewer={reviewer}
                    avatar={AVATARS[index % AVATARS.length]}
                    onClick={() => {
                      setSelectedReviewer(reviewer);
                      setShowPinPad(true);
                      setError(null);
                    }}
                  />
                ))}
              </div>
              
              <Leaderboard reviewers={reviewers} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewerSelection;