// src/app/admin/page.tsx
'use client'

import dynamic from 'next/dynamic';
import { PhrasesListContainer } from '@/features/phrases/components/PhrasesList';

// If you're currently using this pattern:
const Dashboard = dynamic(() => import('@/features/dashboard/Dashboard'), {
  ssr: false
});

export default function AdminPage() {
  // If you have a tab system in your Dashboard component,
  // you'll need to pass the PhrasesListContainer to it
  return <Dashboard />;
}