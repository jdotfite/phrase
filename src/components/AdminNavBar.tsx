import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import type { Session } from '@supabase/supabase-js';

interface AdminNavBarProps {
  session: Session | null;
  setShowLoginModal: (show: boolean) => void;
}

const AdminNavBar: React.FC<AdminNavBarProps> = ({ 
  session, 
  setShowLoginModal 
}) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin';
  };

  return (
    <div className="max-w-[1920px] mx-auto">
    <nav className="bg-gray-800 p-6 rounded-lg shadow mb-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-white text-xl font-bold">Admin Dashboard</div>
    
          {session?.user && (
            <span className="text-gray-400 text-sm">
              {session.user.email}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="hover:bg-red-700"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowLoginModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
    </div>
  );
};

export default AdminNavBar;