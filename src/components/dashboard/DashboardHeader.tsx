// src/components/dashboard/DashboardHeader.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sun, Moon, FileDownIcon } from "lucide-react";

interface DashboardHeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
  onReviewClick: () => void;
  onExportClick: () => void;
  onLoginClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  theme, 
  setTheme, 
  onReviewClick, 
  onExportClick, 
  onLoginClick 
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your catch phrases</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9 rounded-md"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button 
          variant="outline" 
          className="rounded-md"
          onClick={onReviewClick}
        >
          Review Words
        </Button>

        <Button 
          variant="outline" 
          className="rounded-md"
          onClick={onExportClick}
        >
          <FileDownIcon className="mr-2 h-4 w-4" />
          Export
        </Button>

        <Button 
          variant="outline" 
          className="rounded-md bg-white text-black"
          onClick={onLoginClick}
        >
          Login
        </Button>
      </div>
    </div>
  );
};