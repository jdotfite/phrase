'use client';

import dynamic from 'next/dynamic';

// Dynamically import the game component with no SSR
const CatchPhraseGame = dynamic(() => import('@/features/game/components/CatchPhraseGame'), {
  ssr: false,
});

export default function GamePage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-100">
      <CatchPhraseGame />
    </main>
  );
}
