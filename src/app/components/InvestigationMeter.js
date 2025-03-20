'use client';

import { useEffect, useState } from 'react';

export default function InvestigationMeter({ progress = 50 }) {
  const [prevProgress, setPrevProgress] = useState(progress);
  const [isChanging, setIsChanging] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Detect changes in the progress to trigger animations and feedback
  useEffect(() => {
    if (progress !== prevProgress) {
      setIsChanging(true);

      // Generate appropriate feedback message
      if (progress > prevProgress) {
        if (progress >= 80) {
          setFeedbackMessage("You're very close to identifying the culprit!");
        } else if (progress >= 60) {
          setFeedbackMessage("You're on the right track!");
        } else {
          setFeedbackMessage("Getting warmer");
        }
      } else if (progress < prevProgress) {
        if (progress <= 20) {
          setFeedbackMessage("You're following a completely wrong lead");
        } else {
          setFeedbackMessage("You're getting off track");
        }
      }

      const timer = setTimeout(() => {
        setIsChanging(false);
        setPrevProgress(progress);
        // Clear feedback message after 3 seconds
        setTimeout(() => setFeedbackMessage(''), 3000);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [progress, prevProgress]);

  // Calculate color based on progress
  const getColorClass = () => {
    if (progress < 30) return "from-red-500 to-red-600";
    if (progress < 60) return "from-yellow-400 to-orange-500";
    if (progress < 80) return "from-green-400 to-green-500";
    return "from-emerald-400 to-teal-500";
  };

  // Get message based on progress
  const getProgressMessage = () => {
    if (progress < 30) return "Off Track";
    if (progress < 60) return "Getting Closer";
    if (progress < 80) return "Hot Trail";
    return "Very Close!";
  };

  // Show a directional indicator if the progress is changing
  const getDirectionIndicator = () => {
    if (!isChanging) return null;

    if (progress > prevProgress) {
      return <span className="text-green-400 text-xs animate-pulse">↑ Getting Warmer</span>;
    } else if (progress < prevProgress) {
      return <span className="text-red-400 text-xs animate-pulse">↓ Getting Colder</span>;
    }
    return null;
  };

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-white/80">Investigation Direction</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${
            progress < 30 ? 'text-red-400' :
            progress < 60 ? 'text-yellow-400' :
            progress < 80 ? 'text-green-400' :
            'text-emerald-400 font-bold'
          }`}>
            {getProgressMessage()}
          </span>
          {getDirectionIndicator()}
        </div>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColorClass()} transition-all duration-500 ease-in-out ${isChanging ? 'animate-pulse' : ''}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Feedback message display */}
      {feedbackMessage && (
        <div className={`mt-1 text-xs text-center py-1 rounded-sm ${
          progress > prevProgress ? 'text-green-300 bg-green-900/30' : 'text-red-300 bg-red-900/30'
        } animate-fade-in`}>
          {feedbackMessage}
        </div>
      )}
    </div>
  );
}
