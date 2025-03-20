'use client';

import { useRouter } from 'next/navigation';
import GamePlay from '../components/GamePlay';

export default function GamePage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br">
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-auto">
          <GamePlay router={router} />
        </div>
      </div>
    </main>
  );
}
