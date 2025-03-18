'use client'

import dynamic from 'next/dynamic';

// Import the refactored dashboard component
const Dashboard = dynamic(() => import('@/features/dashboard/Dashboard'), {
  ssr: false
});

export default function AdminPage() {
  return <Dashboard />;
}