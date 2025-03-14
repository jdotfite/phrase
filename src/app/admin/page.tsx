'use client'

import dynamic from 'next/dynamic';

// Import the clean dashboard component
const CleanDashboard = dynamic(() => import('@/components/admin/CleanDashboard'), {
  ssr: false
});

export default function AdminPage() {
  return <CleanDashboard />;
}