'use client';

import { useState, useEffect } from 'react';
import ToggleSwitch from './ToggleSwitch';
import InvestigationMeter from './InvestigationMeter';

export default function CaseHeader({
    timeRemaining = 0,
    timerActive = false,
    showSuggestions = true,
    toggleSuggestions = () => { },
    timerExpired = false,
    investigationProgress = 50,
}) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Format the timer display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get timer styling based on time remaining
    const getTimerClasses = () => {
        if (timerExpired) return 'text-red-500 font-bold';
        if (timeRemaining <= 60) return 'text-red-400 font-bold animate-pulse';
        if (timeRemaining <= 180) return 'text-yellow-400 font-bold';
        return 'text-green-400 font-medium';
    };

    return (
        <div className="glass p-3 md:p-4 rounded-md shadow-lg border-l-4 border-indigo-600 sticky top-0 left-0 z-10 transform transition-all duration-300 hover:shadow-purple-500/20">
            <div className="flex flex-col">
                <div className="flex items-center mb-2">
                    <div className="bg-indigo-800/50 w-8 h-8 rounded-full flex items-center justify-center mr-3 border border-indigo-500/30 shadow-inner">
                        <span className="text-base">🔍</span>
                    </div>
                    <h2 className="text-base md:text-lg font-bold gradient-text">
                        Detective&apos;s Dashboard
                    </h2>
                </div>

                <div className="pl-11 space-y-2">
                    <div className="flex items-center text-xs text-white/80">
                        <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></span>
                        <span>Case Active</span>
                    </div>

                    {/* Case Timer (active only when the game is started) */}
                    {timerActive && (
                        <div className={`text-sm font-mono flex items-center ${getTimerClasses()}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            {formatTime(timeRemaining)}
                        </div>
                    )}

                    {/* Investigation Progress Meter */}
                    {timerActive && <InvestigationMeter progress={investigationProgress} />}

                    {/* Detective's Intuition Toggle */}
                    <div className="mt-1">
                        <ToggleSwitch isOn={showSuggestions} handleToggle={toggleSuggestions} label="Detective&apos;s Intuition" />
                    </div>

                    <div className="text-xs text-white/80 mt-2 bg-indigo-900/30 p-2 rounded-md border border-indigo-800/30">
                        <p className="font-medium text-indigo-300 mb-1">Detective&apos;s Protocol:</p>
                        <ul className="list-disc list-inside space-y-1 text-[10px] md:text-xs">
                            <li>Examine evidence carefully</li>
                            <li>Question inconsistencies</li>
                            <li>Trust your intuition</li>
                            <li>Watch the clock - time is limited</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
