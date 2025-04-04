﻿'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ui/theme/ThemeSwitcher";
import { ReviewerLoginButton } from '@/features/auth/ReviewerLoginButton';
import { ReviewerProfileDropdown } from '@/features/auth/ReviewerProfileDropdown';
import { Reviewer } from '@/types/types'; // Make sure to import the Reviewer type

// Define the props interface
interface DashboardHeaderProps {
  onExportClick: () => void;
  currentReviewer: Reviewer | null;
  onLoginSuccess: (reviewer: Reviewer) => void;
  onLogout: () => void;
  onAddWordsClick: () => void;
  onReviewWordsClick: () => void;
}

export function DashboardHeader({ 
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
        <ThemeSwitcher showAccentColors={true} />

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
