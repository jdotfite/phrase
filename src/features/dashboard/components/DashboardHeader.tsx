'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { ReviewerLoginButton } from '@/features/auth/ReviewerLoginButton';
import { ReviewerProfileDropdown } from '@/features/auth/ReviewerProfileDropdown';
import type { Reviewer } from '@/types/types';

interface DashboardHeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
  onExportClick: () => void;
  currentReviewer: Reviewer | null;
  onLoginSuccess?: (reviewer: Reviewer) => void;
  onLogout: () => void;
  onAddWordsClick: () => void;
  onReviewWordsClick: () => void;
}

export function DashboardHeader({ 
  theme, 
  setTheme, 
  onExportClick,
  currentReviewer,
  onLoginSuccess,
  onLogout,
  onAddWordsClick,
  onReviewWordsClick
}: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your catch phrases</p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9 rounded-md"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {currentReviewer ? (
          <ReviewerProfileDropdown 
            reviewer={currentReviewer} 
            reviewerIndex={0} 
            onLogout={onLogout}
            onExportClick={onExportClick}
            onAddWordsClick={onAddWordsClick}
            onReviewWordsClick={onReviewWordsClick}
          />
        ) : (
          <ReviewerLoginButton 
            variant="secondary"
            className="text-black bg-white hover:bg-gray-100 rounded-md border-0"
            onLoginSuccess={onLoginSuccess}
          />
        )}
      </div>
    </div>
  );
}