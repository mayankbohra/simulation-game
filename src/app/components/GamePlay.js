'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import CaseHeader from './CaseHeader';
import SuggestionAgent from './SuggestionAgent';
import ToggleSwitch from './ToggleSwitch';

export default function GamePlay({ router }) {
    // Core gameplay states
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [history, setHistory] = useState([]);
    const [investigationProgress, setInvestigationProgress] = useState(50);
    const [timeRemaining, setTimeRemaining] = useState(15 * 60);
    const [timerActive, setTimerActive] = useState(false);
    const [timerExpired, setTimerExpired] = useState(false);

    // UI states
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [storedSuggestions, setStoredSuggestions] = useState([]);
    const [showSuggestionHistory, setShowSuggestionHistory] = useState(false);
    const [showEndCaseHistory, setShowEndCaseHistory] = useState(false);

    const messagesEndRef = useRef(null);
    const timerRef = useRef(null);

    // Memoized case closure check to prevent initialization errors
    const isCaseClosed = useMemo(() => {
        if (messages.length === 0) return false;

        const lastMessage = messages[messages.length - 1];
        return lastMessage.role === 'assistant' && (
            lastMessage.content.includes('This case is now closed') ||
            lastMessage.content.includes('case is now closed') ||
            lastMessage.content.includes("TIME'S UP!") ||
            lastMessage.content.includes("culprit is") ||
            lastMessage.content.includes("murderer is") ||
            lastMessage.content.includes("The murderer was") ||
            lastMessage.content.includes("The culprit was") ||
            lastMessage.content.includes("ANALYSIS OF YOUR DECISION")
        );
    }, [messages]);

    // Auto-scroll to bottom when messages update
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, showSuggestionHistory, showEndCaseHistory]);

    // Start the game automatically when component mounts
    useEffect(() => {
        startGame();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Timer effect
    useEffect(() => {
        if (timerActive && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current);
                        setTimerExpired(true);
                        setTimerActive(false);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else if (timeRemaining <= 0) {
            clearInterval(timerRef.current);
            setTimerExpired(true);
            setTimerActive(false);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timerActive, timeRemaining]);

    // Handle timer expiration
    useEffect(() => {
        if (timerExpired && !isCaseClosed) {
            handleButtonAction("Time's up! End Case");
        }
    }, [timerExpired]);

    // Effect to handle case closure
    useEffect(() => {
        if (isCaseClosed) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            setShowSuggestionHistory(false);
            setShowEndCaseHistory(false);
        }
    }, [isCaseClosed]);

    const startGame = async () => {
        setLoading(true);
        setStoredSuggestions([]);
        setShowSuggestionHistory(false);
        setShowEndCaseHistory(false);
        setInvestigationProgress(50);
        setTimeRemaining(15 * 60);
        setTimerExpired(false);
        setTimerActive(true);

        try {
            const response = await fetch('/api/gpt/game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Start a new murder mystery case', history: [] }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("START GAME: ", data);

            if (data.response) {
                const meterValue = extractMeterValue(data.response);
                if (meterValue !== null) {
                    setInvestigationProgress(meterValue);
                }

                setMessages([{ role: 'assistant', content: data.response }]);
                setHistory([
                    { role: 'user', content: 'Start a new murder mystery case' },
                    { role: 'assistant', content: data.response }
                ]);
            } else if (data.error) {
                // Handle error response from API
                throw new Error(data.details || data.error);
            }
        } catch (error) {
            console.error('Error starting game:', error);

            // Generate a user-friendly error message
            let errorMessage = 'Failed to start the game. Please try again.';

            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                errorMessage = 'The server took too long to respond. Please try again.';
            } else if (error.message?.includes('502') || error.message?.includes('Bad Gateway')) {
                errorMessage = 'Server communication error (502). This is likely a temporary issue with the deployed environment.';
            }

            setMessages([{ role: 'system', content: errorMessage }]);
        } finally {
            setLoading(false);
        }
    };

    const extractMeterValue = (response) => {
        const meterRegex = /\[METER:(\d+)\]/;
        const match = response.match(meterRegex);

        if (match && match[1]) {
            const meterValue = parseInt(match[1], 10);
            return Math.min(Math.max(meterValue, 0), 100);
        }

        return null;
    };

    const cleanMessageContent = (content) => {
        const cleanedContent = content
            .replace(/\[Button:.*?\]/g, '')
            .replace(/\[METER:\d+\]/g, '');

        return cleanedContent
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    };

    const handleButtonAction = async (action) => {
        if (loading) return;

        setLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: action }]);
        const updatedHistory = [...history, { role: 'user', content: action }];

        try {
            console.log("Types of History: ", typeof history);
            console.log("History: ", history);

            console.log("Type of action: ", typeof action);
            console.log("Action: ", action);
            const messageToSend = action;

            const response = await fetch('/api/gpt/game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageToSend,
                    history: history
                }),
            });

            // Check if the response is OK (status in the range 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Attempt to parse the response as JSON
            const data = await response.json();
            console.log("BUTTON ACTION RESPONSE: ", data);

            if (data.response) {
                const meterValue = extractMeterValue(data.response);
                if (meterValue !== null) {
                    setInvestigationProgress(meterValue);
                }

                const finalContent = data.response;
                setMessages(prev => [...prev, { role: 'assistant', content: finalContent }]);
                updatedHistory.push({ role: 'assistant', content: finalContent });
                setHistory(updatedHistory);
            } else if (data.error) {
                // Handle error response from API
                throw new Error(data.details || data.error);
            }
        } catch (error) {
            console.error('Error sending message:', error);

            // Generate a fallback response for better user experience
            let errorMessage = 'Failed to get a response. Please try again.';

            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                errorMessage = 'The request timed out. The server might be busy. Please try again.';
            } else if (error.message?.includes('502') || error.message?.includes('Bad Gateway')) {
                errorMessage = 'Server communication error (502). This is likely a temporary issue with the deployed environment.';
            }

            setMessages(prev => [...prev, {
                role: 'system',
                content: errorMessage
            }]);
        } finally {
            setLoading(false);
        }
    };

    const storeSuggestion = (suggestion) => {
        setStoredSuggestions(prev => [...prev, {
            suggestion,
            timestamp: new Date().toISOString(),
            afterMessageIndex: messages.length - 1
        }]);
    };

    const extractButtons = (content) => {
        const buttonRegex = /\[Button:(.*?)\]/g;
        const matches = [...content.matchAll(buttonRegex)];
        return matches.map(match => match[1].trim());
    };

    const resetGame = () => {
        router.push('/');
    };

    const toggleSuggestions = () => {
        setShowSuggestions(prev => !prev);
    };

    const toggleSuggestionHistory = () => {
        setShowSuggestionHistory(prev => !prev);
    };

    const toggleEndCaseHistory = () => {
        setShowEndCaseHistory(prev => !prev);
    };

    const getFriendlyTimeMessage = (timestamp, index) => {
        const phrases = [
            "at the beginning of the case",
            "early in the investigation",
            "as things were heating up",
            "right in the middle of things",
            "when we were gathering key evidence",
            "as we were closing in",
            "just before the breakthrough",
            "near the end of the investigation"
        ];

        return phrases[index % phrases.length];
    };

    const renderSuggestionHistory = () => {
        if (storedSuggestions.length === 0) return null;

        return (
            <div className="mt-4 md:mt-6 p-3 md:p-4 glass-card">
                <div className="flex justify-between items-center mb-2 md:mb-3">
                    <h3 className="text-base md:text-lg font-semibold text-blue-300">Your Detective Buddy&apos;s Case Notes</h3>
                    {!isCaseClosed ? (
                        <button
                            onClick={toggleSuggestionHistory}
                            className="text-xs text-white/70 hover:text-white/100 bg-blue-900/30 px-2 py-1 rounded"
                        >
                            Close
                        </button>
                    ) : (
                        <button
                            onClick={toggleEndCaseHistory}
                            className="text-xs text-white/70 hover:text-white/100 bg-blue-900/30 px-2 py-1 rounded"
                        >
                            {showEndCaseHistory ? "Hide Notes" : "Show Notes"}
                        </button>
                    )}
                </div>

                {(!isCaseClosed || showEndCaseHistory) && (
                    <div className="space-y-2 md:space-y-3">
                        <p className="text-xs md:text-sm text-white/70 mb-2">
                            Here&apos;s what your detective buddy was thinking throughout the case:
                        </p>
                        {storedSuggestions.map((item, index) => (
                            <div key={index} className="p-2 md:p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
                                <div className="flex items-center mb-1 md:mb-2">
                                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-600/70 flex items-center justify-center mr-2">
                                        <span className="text-xs font-bold">!</span>
                                    </div>
                                    <div className="text-xs md:text-sm text-blue-300 font-medium">
                                        I was thinking {getFriendlyTimeMessage(item.timestamp, index)}...
                                    </div>
                                </div>
                                <p className="text-white/90 text-xs md:text-sm pl-6 md:pl-7">{item.suggestion}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderUrgencyMessage = () => {
        if (timeRemaining <= 60) {
            return (
                <div className="bg-red-600/80 text-white px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm rounded-md animate-shake">
                    <span className="font-bold">URGENT:</span> Time is running out! Make an arrest now!
                </div>
            );
        } else if (timeRemaining <= 180) {
            return (
                <div className="bg-orange-500/80 text-white px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm rounded-md animate-pulse">
                    <span className="font-bold">WARNING:</span> Only 3 minutes remaining to solve the case!
                </div>
            );
        } else if (timeRemaining <= 300) {
            return (
                <div className="bg-yellow-500/70 text-white px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm rounded-md">
                    <span className="font-bold">NOTICE:</span> 5 minutes left - start identifying your prime suspect!
                </div>
            );
        }
        return null;
    };

    const renderCaseEndUI = () => {
        return (
            <div className="p-3 md:p-4 glass border-t text-center">
                <div className="flex flex-col items-center gap-3">
                    <Button
                        onClick={resetGame}
                        text="Return to Home"
                        disabled={loading}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-base py-2 px-6"
                    />
                    {storedSuggestions.length > 0 && (
                        <div className="text-xs md:text-sm">
                            <button
                                onClick={toggleEndCaseHistory}
                                className="text-white/70 hover:text-white underline transition-colors duration-200"
                            >
                                {showEndCaseHistory ? "Hide Detective Notes" : "View Detective Case Notes"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Left sidebar with case info - only show when case is active */}
            {!isCaseClosed && (
                <div className="md:w-1/4 lg:w-1/5 md:min-h-full md:border-r md:border-indigo-900/30">
                    <CaseHeader
                        timeRemaining={timeRemaining}
                        timerActive={timerActive}
                        showSuggestions={showSuggestions}
                        toggleSuggestions={toggleSuggestions}
                        timerExpired={timerExpired}
                        investigationProgress={investigationProgress}
                    />
                </div>
            )}

            {/* Main content area */}
            <div className={`flex flex-col flex-1 ${!isCaseClosed ? 'md:w-3/4 lg:w-4/5' : 'w-full'}`}>
                <div className={`flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 ${timeRemaining <= 60 ? 'bg-red-900/10' : timeRemaining <= 180 ? 'bg-orange-900/5' : ''}`}>
                    {/* Show suggestion history when button is clicked */}
                    {showSuggestionHistory && !isCaseClosed && renderSuggestionHistory()}

                    {messages.map((msg, i) => {
                        // Determine if we should render a suggestion after this message
                        const showSuggestionAfterMessage =
                            msg.role === 'assistant' &&
                            i === messages.length - 1 &&
                            !isCaseClosed;

                        return (
                            <div key={i} className={`mb-1 md:mb-2 ${msg.role === 'assistant' ? 'animate-fade-in' : 'animate-slide-in'}`}>
                                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-5 py-2 sm:py-3 rounded-lg relative ${msg.role === 'user'
                                        ? 'glass-card enhanced-card bg-opacity-30 bg-violet-500/30 rounded-tr-none'
                                        : msg.role === 'system'
                                            ? 'glass-card enhanced-card bg-opacity-30 bg-red-500/30'
                                            : 'glass-card enhanced-card rounded-tl-none'
                                        }`}>
                                        <div className="whitespace-pre-wrap text-sm md:text-base">
                                            {msg.role === 'assistant' ? cleanMessageContent(msg.content) : msg.content}
                                        </div>

                                        {/* Generate buttons for actions */}
                                        {msg.role === 'assistant' && !isCaseClosed && (
                                            <div className="mt-2 md:mt-3 flex flex-wrap gap-1 md:gap-2 justify-start">
                                                {extractButtons(msg.content).map((action, idx) => (
                                                    <Button
                                                        key={idx}
                                                        onClick={() => handleButtonAction(action)}
                                                        text={action}
                                                        disabled={loading}
                                                        className={
                                                            (action.includes('Make Arrest') && timeRemaining <= 180) ?
                                                                `${timeRemaining <= 60 ? 'animate-heartbeat bg-red-600 text-white font-bold' : 'bg-orange-600 font-semibold'}` : ''
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Add suggestion agent after assistant messages */}
                                {showSuggestionAfterMessage && (
                                    <SuggestionAgent
                                        messages={messages}
                                        isVisible={showSuggestions}
                                        storeSuggestion={storeSuggestion}
                                        isUrgent={timeRemaining <= 180}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Show loading spinner */}
                    {loading && (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner size="medium" />
                        </div>
                    )}

                    {/* Show suggestion history at the end of a case */}
                    {isCaseClosed && renderSuggestionHistory()}

                    <div ref={messagesEndRef} />
                </div>

                {/* Show appropriate footer based on case status */}
                {isCaseClosed ? renderCaseEndUI() : (
                    <div className="p-3 md:p-4 glass border-t">
                        <div className="text-center mt-2">
                            {loading ? (
                                <div className="flex items-center justify-center text-sm text-white/80">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Investigating...</span>
                                </div>
                            ) : (
                                <div className={`text-sm ${timeRemaining <= 60 ? 'text-red-300 animate-pulse' : timeRemaining <= 180 ? 'text-orange-300' : 'text-white/70'}`}>
                                    {renderUrgencyMessage() || "Type a question or use the buttons above to continue your investigation."}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
