'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/services/supabase';
import PinPad from './PinPad';
import type { Reviewer } from '@/types/types';

interface ReviewerLoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (reviewer: Reviewer) => void;
}

// Avatar icons for reviewers - desaturated colors
const AVATAR_EMOJIS = ['🐙', '🐈', '🐕', '🐒', '🐢', '🐣', '🦊', '🐼'];
const AVATAR_COLORS = [
  'from-orange-400/80 to-amber-400/80', // Desaturated Orange/Gold
  'from-red-500/80 to-red-600/80',      // Desaturated Red
  'from-emerald-400/80 to-teal-400/80', // Desaturated Green
  'from-purple-500/80 to-blue-400/80',  // Desaturated Purple/Blue
  'from-blue-400/80 to-cyan-300/80',    // Desaturated Blue
  'from-rose-400/80 to-pink-400/80',    // Desaturated Pink
  'from-amber-300/80 to-yellow-200/80', // Desaturated Yellow
  'from-slate-500/80 to-slate-700/80',  // Desaturated Gray
];

export function ReviewerLoginModal({
  open,
  onClose,
  onLoginSuccess
}: ReviewerLoginModalProps) {
  const [reviewers, setReviewers] = React.useState<Reviewer[]>([]);
  const [selectedReviewer, setSelectedReviewer] = React.useState<Reviewer | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showPinPad, setShowPinPad] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      fetchReviewers();
      setError(null);
      setSelectedReviewer(null);
      setShowPinPad(false);
    }
  }, [open]);

  async function fetchReviewers() {
    try {
      const { data, error } = await supabase
        .from('reviewers')
        .select('*')
        .order('total_reviews', { ascending: false });
      if (error) throw error;
      if (data) setReviewers(data);
    } catch (err: any) {
      console.error('Error fetching reviewers:', err);
      setError('Failed to load reviewers');
    }
  }

  async function handleSelectReviewer(reviewer: Reviewer) {
    setSelectedReviewer(reviewer);
    setShowPinPad(true);
    setError(null);
  }

  async function handlePinSubmit(pin: string) {
    if (!selectedReviewer) return;
    setError(null);

    const { data, error } = await supabase
      .from('reviewers')
      .select('*')
      .eq('id', selectedReviewer.id)
      .eq('pin', pin)
      .maybeSingle();

    if (error) {
      setError('Database error checking PIN');
      return;
    }
    if (!data) {
      setError('Incorrect PIN');
      return;
    }

    onLoginSuccess(selectedReviewer);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-black border-neutral-800">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-medium text-center text-white">
            {!showPinPad ? "Who's reviewing?" : `Enter PIN for ${selectedReviewer?.name}`}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-6 rounded bg-neutral-900 text-neutral-300 p-3 text-center border border-neutral-700">
            {error}
          </div>
        )}

        {!showPinPad ? (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-8">
              {reviewers.map((rev, index) => (
                <button
                  key={rev.id}
                  onClick={() => handleSelectReviewer(rev)}
                  className="flex flex-col items-center gap-3 transition-transform hover:scale-110 focus:outline-none"
                >
                  <div 
                    className={`w-28 h-28 rounded-md flex items-center justify-center overflow-hidden bg-gradient-to-b ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
                  >
                    <div className="text-[3rem] transform scale-150">
                      {AVATAR_EMOJIS[index % AVATAR_EMOJIS.length]}
                    </div>
                  </div>
                  <span className="text-neutral-300 text-sm">{rev.name}</span>
                </button>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="border-neutral-600 text-neutral-400 hover:bg-neutral-800 hover:text-white mt-4"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <PinPad
              onSubmit={handlePinSubmit}
              onCancel={() => {
                setShowPinPad(false);
                setError(null);
                setSelectedReviewer(null);
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}