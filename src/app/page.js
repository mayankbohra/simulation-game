'use client';

import { useRouter } from 'next/navigation';
import Button from './components/Button';

export default function Home() {
  const router = useRouter();

  const startGame = () => {
    router.push('/game');
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br">
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-auto">
          <div className="flex flex-col items-center justify-center h-full space-y-6 md:space-y-8 p-4 md:p-6 w-full">
            <div className="glass-card p-6 md:p-8 max-w-xl w-full text-center mx-auto enhanced-card">
              <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4 md:mb-6">Murder Mystery Detective</h1>
              <div className="relative">
                <p className="text-center mb-6 md:mb-8 text-base md:text-lg text-white/90 max-w-md mx-auto">
                  Solve intricate murder mysteries by examining evidence and interrogating suspects.
                  <span className="block mt-2 md:mt-3">You have just <span className="text-yellow-400 font-bold animate-pulse">15 minutes</span> to catch the killer!</span>
                </p>
              </div>
              <Button
                onClick={startGame}
                text="Start New Case"
                className="text-base md:text-lg py-3 px-6 md:px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
