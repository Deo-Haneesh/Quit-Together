'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Heart, Sparkles, History, TrendingUp, X, Calendar } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';
import './MoodTracker.css';

const moods = [
    { emoji: '😊', label: 'Great', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #34d399)', value: 5 },
    { emoji: '🙂', label: 'Good', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', value: 4 },
    { emoji: '😐', label: 'Okay', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', value: 3 },
    { emoji: '😔', label: 'Low', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', value: 2 },
    { emoji: '😢', label: 'Tough', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #f87171)', value: 1 },
];

export default function MoodTracker() {
    const [selectedMood, setSelectedMood] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [moodHistory, setMoodHistory] = useState(() => {
        const saved = localStorage.getItem('mood_history');
        return saved ? JSON.parse(saved) : [];
    });
    const { addXp } = useGamification();

    // Save to localStorage whenever history changes
    useEffect(() => {
        localStorage.setItem('mood_history', JSON.stringify(moodHistory));
    }, [moodHistory]);

    const handleMoodSelect = (mood) => {
        setSelectedMood(mood);
    };

    const handleSubmit = () => {
        if (selectedMood) {
            // Add to history
            const newEntry = {
                id: Date.now(),
                mood: selectedMood,
                timestamp: new Date().toISOString()
            };
            setMoodHistory(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50 entries

            setIsSubmitted(true);
            addXp(10, "Mood Check-in");
            setTimeout(() => {
                setIsSubmitted(false);
                setSelectedMood(null);
            }, 3000);
        }
    };

    const getAverageMood = () => {
        if (moodHistory.length === 0) return null;
        const last7 = moodHistory.slice(0, 7);
        const avg = last7.reduce((sum, entry) => sum + entry.mood.value, 0) / last7.length;
        return avg.toFixed(1);
    };

    const getMoodTrend = () => {
        if (moodHistory.length < 2) return null;
        const recent = moodHistory.slice(0, 3).reduce((sum, e) => sum + e.mood.value, 0) / Math.min(3, moodHistory.length);
        const older = moodHistory.slice(3, 6).reduce((sum, e) => sum + e.mood.value, 0) / Math.min(3, moodHistory.slice(3, 6).length);
        if (!older) return null;
        return recent > older ? 'up' : recent < older ? 'down' : 'stable';
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const clearHistory = () => {
        if (window.confirm('Clear all mood history? This cannot be undone.')) {
            setMoodHistory([]);
        }
    };

    const avgMood = getAverageMood();
    const trend = getMoodTrend();

    return (
        <motion.div
            className="mood-tracker card-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <AnimatePresence mode="wait">
                {isSubmitted ? (
                    <motion.div
                        key="success"
                        className="mood-success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <motion.div
                            className="success-icon pulse-glow"
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Heart size={28} />
                        </motion.div>
                        <h4>Thanks for sharing!</h4>
                        <p>Remember, every feeling is valid 💜</p>
                        <motion.span
                            className="xp-earned"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                        >
                            +10 XP
                        </motion.span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="mood-header">
                            <motion.div
                                className="mood-icon-wrapper"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                            >
                                <Smile size={20} />
                            </motion.div>
                            <div className="mood-title">
                                <h4>How are you feeling?</h4>
                                <p>Check in with yourself</p>
                            </div>
                            {moodHistory.length > 0 && (
                                <button
                                    className="history-btn"
                                    onClick={() => setShowHistory(true)}
                                    title="View mood history"
                                >
                                    <History size={18} />
                                </button>
                            )}
                        </div>

                        {/* Quick Stats */}
                        {avgMood && (
                            <div className="mood-quick-stats">
                                <div className="quick-stat">
                                    <span className="stat-value">{avgMood}/5</span>
                                    <span className="stat-label">Avg (7d)</span>
                                </div>
                                {trend && (
                                    <div className={`quick-stat trend-${trend}`}>
                                        <TrendingUp size={14} className={trend === 'down' ? 'rotate-180' : ''} />
                                        <span className="stat-label">{trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}</span>
                                    </div>
                                )}
                                <div className="quick-stat">
                                    <span className="stat-value">{moodHistory.length}</span>
                                    <span className="stat-label">Entries</span>
                                </div>
                            </div>
                        )}

                        <div className="mood-options">
                            {moods.map((mood, index) => (
                                <motion.button
                                    key={mood.label}
                                    className={`mood-btn ${selectedMood?.label === mood.label ? 'selected' : ''}`}
                                    onClick={() => handleMoodSelect(mood)}
                                    style={{
                                        '--mood-color': mood.color,
                                        '--mood-gradient': mood.gradient
                                    }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{
                                        scale: 1.1,
                                        y: -5,
                                        transition: { type: "spring", stiffness: 400 }
                                    }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <motion.span
                                        className="mood-emoji"
                                        animate={selectedMood?.label === mood.label ? {
                                            scale: [1, 1.3, 1],
                                            rotate: [0, 10, -10, 0]
                                        } : {}}
                                        transition={{ duration: 0.4 }}
                                    >
                                        {mood.emoji}
                                    </motion.span>
                                    <span className="mood-label">{mood.label}</span>
                                </motion.button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {selectedMood && (
                                <motion.button
                                    className="submit-mood btn-glow"
                                    onClick={handleSubmit}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Sparkles size={16} />
                                    <span>Log Mood</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mood History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        className="mood-history-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowHistory(false)}
                    >
                        <motion.div
                            className="mood-history-modal"
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="history-header">
                                <h3><Calendar size={18} /> Mood History</h3>
                                <button className="close-history-btn" onClick={() => setShowHistory(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="history-list">
                                {moodHistory.length === 0 ? (
                                    <p className="no-history">No mood entries yet. Start tracking!</p>
                                ) : (
                                    moodHistory.map((entry) => (
                                        <div key={entry.id} className="history-item">
                                            <span className="history-emoji">{entry.mood.emoji}</span>
                                            <div className="history-info">
                                                <span className="history-label">{entry.mood.label}</span>
                                                <span className="history-date">{formatDate(entry.timestamp)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {moodHistory.length > 0 && (
                                <button className="clear-history-btn" onClick={clearHistory}>
                                    Clear History
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
