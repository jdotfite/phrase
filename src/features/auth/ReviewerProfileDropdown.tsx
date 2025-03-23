'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, FileDownIcon, Plus, CheckSquare } from "lucide-react";

// Avatar icons for reviewers (should match those in ReviewerLoginModal)
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

interface ReviewerProfileDropdownProps {
  reviewer: Reviewer;
  reviewerIndex: number; // To determine the emoji and color
  onLogout: () => void;
  onExportClick: () => void;
  onAddWordsClick: () => void;
  onReviewWordsClick: () => void;
}

export function ReviewerProfileDropdown({
  reviewer,
  reviewerIndex = 0,
  onLogout,
  onExportClick,
  onAddWordsClick,
  onReviewWordsClick
}: ReviewerProfileDropdownProps) {
  const avatarEmoji = AVATAR_EMOJIS[reviewerIndex % AVATAR_EMOJIS.length];
  const avatarColor = AVATAR_COLORS[reviewerIndex % AVATAR_COLORS.length];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-b ${avatarColor}`}>
          <div className="text-2xl transform scale-150 translate-y-1">
            {avatarEmoji}
          </div>
        </div>
        <span className="text-sm text-white hidden sm:inline-block">{reviewer.name}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{reviewer.name}</span>
            <span className="text-xs text-muted-foreground">{reviewer.total_reviews || 0} reviews</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={onAddWordsClick}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Add Words</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={onReviewWordsClick}>
          <CheckSquare className="mr-2 h-4 w-4" />
          <span>Review Words</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={onExportClick}>
          <FileDownIcon className="mr-2 h-4 w-4" />
          <span>Export</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}