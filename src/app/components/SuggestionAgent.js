'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function SuggestionAgent({ messages, isVisible, storeSuggestion, isUrgent = false }) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
  const suggestionRef = useRef(null);

  // Auto-scroll when suggestion appears
  useEffect(() => {
    if (isVisible && suggestion && suggestionRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        suggestionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 100);
    }
  }, [isVisible, suggestion]);

  // Memoize suggestion generation to prevent unnecessary re-renders
  const generateSuggestion = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/claude/suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      const data = await response.json();
      if (data.suggestion) {
        setSuggestion(data.suggestion);
        // Store the suggestion in parent component (even if not visible)
        if (storeSuggestion) {
          storeSuggestion(data.suggestion);
        }
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
    } finally {
      setLoading(false);
    }
  }, [messages, storeSuggestion]);

  // Use useEffect to trigger suggestion generation
  useEffect(() => {
    // Only generate suggestions if there are messages and the last message is from the assistant
    // AND we haven't already generated a suggestion for this message
    if (
      messages.length > 0 &&
      messages[messages.length - 1].role === 'assistant' &&
      lastMessageId !== messages.length
    ) {
      generateSuggestion();
      // Track that we've generated a suggestion for this message
      setLastMessageId(messages.length);
    }
  }, [messages, lastMessageId, generateSuggestion]);

  // Memoize urgency styling
  const urgencyStyling = useMemo(() => {
    return isUrgent
      ? "border-orange-500/40 from-orange-900/40 to-red-900/30"
      : "border-indigo-600/20 from-blue-900/30 to-indigo-900/30";
  }, [isUrgent]);

  // Early return if not visible or no suggestion
  if (!isVisible || !suggestion) {
    return null;
  }

  return (
    <div
      ref={suggestionRef}
      className={`suggestion-agent my-4 rounded-xl overflow-hidden shadow-lg animate-fade-in ${isUrgent ? 'shadow-orange-500/20' : 'shadow-indigo-500/20'}`}
      id="suggestion-agent"
    >
      <div className={`px-4 md:px-6 py-3 md:py-4 glass-card border-l-4 ${urgencyStyling} bg-gradient-to-r backdrop-blur-md`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-8 h-8 rounded-full ${isUrgent ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gradient-to-br from-blue-400 to-indigo-600'} flex items-center justify-center shadow-inner`}>
            <span className="text-white font-bold text-sm">{isUrgent ? '!' : '👁️'}</span>
          </div>
          <div>
            <h3 className={`text-sm md:text-base font-semibold ${isUrgent ? 'text-orange-300' : 'text-blue-300'}`}>
              {isUrgent ? "Detective's Urgent Advice" : "Detective's Intuition"}
            </h3>
            <div className="flex items-center text-xs text-white/50">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              {isUrgent ? "Time-sensitive insight" : "Helpful suggestion"}
            </div>
          </div>
        </div>

        <p className={`${isUrgent ? 'text-orange-100 font-medium' : 'text-white/90'} text-sm md:text-base pl-11 italic leading-relaxed ${isUrgent ? 'animate-pulse' : ''}`}>
          {suggestion}
        </p>

        {loading && (
          <div className="flex items-center mt-2 text-xs text-white/50">
            <LoadingSpinner size="small" />
            <span className="ml-2">Analyzing evidence...</span>
          </div>
        )}
      </div>
    </div>
  );
}
