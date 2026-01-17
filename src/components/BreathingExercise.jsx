import React, { useState, useEffect, useRef } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import { Award, Clock, Zap } from 'lucide-react';
import './BreathingExercise.css';

const PATTERNS = {
    '4-7-8': [
        { phase: 'inhale', duration: 4, text: 'Breathe in' },
        { phase: 'hold', duration: 7, text: 'Hold' },
        { phase: 'exhale', duration: 8, text: 'Breathe out' },
    ],
    'box': [
        { phase: 'inhale', duration: 4, text: 'Breathe in' },
        { phase: 'hold', duration: 4, text: 'Hold' },
        { phase: 'exhale', duration: 4, text: 'Breathe out' },
        { phase: 'hold', duration: 4, text: 'Hold' },
    ],
};

export default function BreathingExercise() {
    const { addXp } = useGamification();
    const [pattern, setPattern] = useState('4-7-8');
    const [isActive, setIsActive] = useState(false);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [cyclesCompleted, setCyclesCompleted] = useState(0);
    const [totalSessionTime, setTotalSessionTime] = useState(0);
    const [showReward, setShowReward] = useState(false);
    const [sessionStats, setSessionStats] = useState(() => {
        const saved = localStorage.getItem('breathing_stats');
        return saved ? JSON.parse(saved) : { totalCycles: 0, totalMinutes: 0, sessionsToday: 0 };
    });
    const intervalRef = useRef(null);
    const sessionTimerRef = useRef(null);

    const currentPattern = PATTERNS[pattern];
    const currentPhase = currentPattern[currentPhaseIndex];

    // Save stats to localStorage
    useEffect(() => {
        localStorage.setItem('breathing_stats', JSON.stringify(sessionStats));
    }, [sessionStats]);

    useEffect(() => {
        if (isActive) {
            setCountdown(currentPhase.duration);

            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        const nextPhaseIndex = (currentPhaseIndex + 1) % currentPattern.length;

                        // Check if we completed a full cycle
                        if (nextPhaseIndex === 0) {
                            setCyclesCompleted(c => {
                                const newCount = c + 1;
                                // Award XP every 3 cycles
                                if (newCount % 3 === 0) {
                                    addXp(15, "Deep Breathing");
                                    setShowReward(true);
                                    setTimeout(() => setShowReward(false), 2000);
                                }
                                return newCount;
                            });
                        }

                        setCurrentPhaseIndex(nextPhaseIndex);
                        return currentPattern[nextPhaseIndex].duration;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Session timer
            sessionTimerRef.current = setInterval(() => {
                setTotalSessionTime(t => t + 1);
            }, 1000);

            intervalRef.current = timer;
            return () => {
                clearInterval(timer);
                clearInterval(sessionTimerRef.current);
            };
        }
    }, [isActive, currentPhaseIndex, currentPattern, currentPhase.duration, addXp]);

    const startBreathing = () => {
        setIsActive(true);
        setCurrentPhaseIndex(0);
        setCountdown(currentPattern[0].duration);
        setCyclesCompleted(0);
        setTotalSessionTime(0);
    };

    const stopBreathing = () => {
        setIsActive(false);
        setCurrentPhaseIndex(0);
        setCountdown(0);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (sessionTimerRef.current) {
            clearInterval(sessionTimerRef.current);
        }

        // Award XP based on session length
        if (totalSessionTime >= 60) {
            const minutesCompleted = Math.floor(totalSessionTime / 60);
            const xpEarned = minutesCompleted * 10;
            addXp(xpEarned, `${minutesCompleted}min Breathing Session`);

            // Update lifetime stats
            setSessionStats(prev => ({
                totalCycles: prev.totalCycles + cyclesCompleted,
                totalMinutes: prev.totalMinutes + minutesCompleted,
                sessionsToday: prev.sessionsToday + 1
            }));

            setShowReward(true);
            setTimeout(() => setShowReward(false), 3000);
        }
    };

    const changePattern = (newPattern) => {
        if (isActive) stopBreathing();
        setPattern(newPattern);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="glass-panel breathing-exercise">
            <h2>🫁 Guided Breathing</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Follow the circle to calm your mind and body
            </p>

            {/* Session Stats Bar */}
            <div className="breathing-stats-bar">
                <div className="stat-item">
                    <Award size={14} />
                    <span>{sessionStats.totalCycles} total cycles</span>
                </div>
                <div className="stat-item">
                    <Clock size={14} />
                    <span>{sessionStats.totalMinutes}m lifetime</span>
                </div>
                {isActive && (
                    <div className="stat-item active-timer">
                        <Zap size={14} />
                        <span>{formatTime(totalSessionTime)}</span>
                    </div>
                )}
            </div>

            <div className="pattern-selector">
                <button
                    className={`pattern-btn ${pattern === '4-7-8' ? 'active' : ''}`}
                    onClick={() => changePattern('4-7-8')}
                >
                    4-7-8 Breathing
                </button>
                <button
                    className={`pattern-btn ${pattern === 'box' ? 'active' : ''}`}
                    onClick={() => changePattern('box')}
                >
                    Box Breathing
                </button>
            </div>

            <div className="breathing-circle-container">
                {/* Tech Rings Overlay */}
                <div className="tech-ring outer-ring"></div>
                <div className="tech-ring inner-ring"></div>

                <div className={`breathing-circle ${isActive ? currentPhase.phase : ''}`}>
                    <div className="circle-content-wrapper">
                        {isActive && (
                            <>
                                <div className="breathing-text glitch-text-small">{currentPhase.text}</div>
                                <div className="breathing-count font-mono">{Math.ceil(countdown)}</div>
                                <div className="cycle-counter">Cycle {cyclesCompleted + 1}</div>
                            </>
                        )}
                        {!isActive && (
                            <div className="breathing-text">SYSTEM READY</div>
                        )}
                    </div>
                </div>

                {/* XP Reward Animation */}
                {showReward && (
                    <div className="xp-reward-popup">
                        <Zap size={16} />
                        <span className="font-mono">XP_ACQUIRED</span>
                    </div>
                )}
            </div>

            <div className="breathing-controls">
                {!isActive ? (
                    <button className="start-btn" onClick={startBreathing}>
                        Start Breathing
                    </button>
                ) : (
                    <button className="stop-btn" onClick={stopBreathing}>
                        Stop & Earn XP ({formatTime(totalSessionTime)})
                    </button>
                )}
            </div>

            {/* XP Info */}
            <p className="xp-info">
                🎁 Earn +15 XP every 3 cycles • +10 XP per minute completed
            </p>
        </div>
    );
}
