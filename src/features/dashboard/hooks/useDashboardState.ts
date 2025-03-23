// features/dashboard/hooks/useDashboardState.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/services/supabase';
import type { Reviewer } from '@/types/types';
import { useToast } from '@/hooks/useToast';

export const useDashboardState = () => {
  const { toast } = useToast();
  
  // Tab and Modal States
  const [activeTab, setActiveTab] = useState<string>('phrases');
  const [showWordCreatorModal, setShowWordCreatorModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  
  // Data States
  const [selectedPhraseId, setSelectedPhraseId] = useState<number | null>(null); 
  const [newIds, setNewIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<number>(30);
  const [currentReviewer, setCurrentReviewer] = useState<Reviewer | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize current reviewer from localStorage
  useEffect(() => {
    const initializeReviewer = () => {
      const savedReviewer = localStorage.getItem('currentReviewer');
      if (savedReviewer) {
        try {
          setCurrentReviewer(JSON.parse(savedReviewer));
        } catch (e) {
          console.error("Error parsing saved reviewer:", e);
          localStorage.removeItem('currentReviewer');
          toast({
            title: "Error",
            description: "Your login session was corrupted and has been reset",
            variant: "destructive"
          });
        }
      }
      
      setIsLoading(false);
    };
    
    initializeReviewer();
  }, []);

  // Function to update date range
  const updateDateRange = useCallback((days: number) => {
    setDateRange(days);
  }, []);
  
  // Login/Logout handlers
  const handleLoginSuccess = useCallback((reviewer: Reviewer) => {
    setCurrentReviewer(reviewer);
    localStorage.setItem('currentReviewer', JSON.stringify(reviewer));
    
    toast({
      title: "Welcome back!",
      description: `You're now logged in as ${reviewer.name}`,
      variant: "success",
    });
  }, [toast]);
  
  const handleLogout = useCallback(() => {
    setCurrentReviewer(null);
    localStorage.removeItem('currentReviewer');
    
    toast({
      title: "Logged out",
      description: "You've been logged out successfully",
      variant: "info",
    });
  }, [toast]);

  // Word Creator handlers
  const handleWordAdded = useCallback((id?: number) => {
    // Only add to newIds if an id is provided
    if (id !== undefined) {
      setNewIds(prev => [...prev, id]);
    }
    
    toast({
      title: "Success",
      description: "New phrase added successfully",
      variant: "success",
    });
  }, [toast]);

  return {
    // Tab and Modal States
    activeTab, 
    setActiveTab,
    showWordCreatorModal, 
    setShowWordCreatorModal,
    showReviewModal, 
    setShowReviewModal,
    showFilterModal, 
    setShowFilterModal,
    showExportModal, 
    setShowExportModal,
    
    // Data States
    selectedPhraseId,
    setSelectedPhraseId,
    newIds, 
    setNewIds,
    dateRange,
    updateDateRange,
    currentReviewer,
    setCurrentReviewer,
    isExporting,
    setIsExporting,
    
    // Loading States
    isLoading,
    error,
    
    // Handlers
    handleLoginSuccess,
    handleLogout,
    handleWordAdded
  };
};