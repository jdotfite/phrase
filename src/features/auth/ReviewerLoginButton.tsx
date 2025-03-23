'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ReviewerLoginModal } from './ReviewerLoginModal';


interface ReviewerLoginButtonProps {
  onLoginSuccess?: (reviewer: Reviewer) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export function ReviewerLoginButton({ 
  onLoginSuccess, 
  variant = 'outline',
  className = '' 
}: ReviewerLoginButtonProps) {
  const [open, setOpen] = React.useState(false);

  const handleLoginSuccess = (reviewer: Reviewer) => {
    setOpen(false);
    if (onLoginSuccess) {
      onLoginSuccess(reviewer);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant={variant} 
        className={className}
      >
        Login
      </Button>
      <ReviewerLoginModal
        open={open}
        onClose={() => setOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}