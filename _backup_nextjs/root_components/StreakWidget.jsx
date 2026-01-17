'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, TrendingUp, Calendar, CheckCircle, Zap, Gift } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useGamification } from '../contexts/GamificationContext';
import './StreakWidget.css';

export default function StreakWidget() {
    const { user, checkIn, loading } = useUser();
    const { addXp } = useGamification();

    const [checkedInToday, setCheckedInToday] = useState(false);
    const [showReward, setShowReward] = useState(false);

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date().getDay();
    const adjustedToday = today === 0 ? 6 : today - 1;
    const todayString = new Date().toDateString();

    // Derive streak data from UserContext (single source of truth)
    const streakData = {
        currentStreak: user?.stats?.streakDays || 0,
        longestStreak: user?.stats?.longestStreak || 0,
        lastCheckIn: user?.stats?.lastCheckIn,
        totalCheckIns: user?.stats?.totalCheckIns || 0,
        weeklyCheckIns: user?.stats?.weeklyCheckIns || []
    };

    // Check if already checked in today
    useEffect(() => {
        if (streakData.lastCheckIn) {
            const lastCheckInDate = new Date(streakData.lastCheckIn).toDateString();
            setCheckedInToday(lastCheckInDate === todayString);
        }
    }, [streakData.lastCheckIn, todayString]);

    // Reset weekly check-ins at start of new week
    useEffect(() => {
        if (streakData.lastCheckIn) {
            const lastCheckInDate = new Date(streakData.lastCheckIn);
            const lastDayOfWeek = lastCheckInDate.getDay();
            const currentDayOfWeek = new Date().getDay();
            if (currentDayOfWeek === 1 && lastDayOfWeek !== 1) {
                // It's Monday and last check-in wasn't Monday - week should reset
                // This will be handled by the first check-in of the new week
            }
        }
    }, []);

    const handleCheckIn = () => {
        if (checkedInToday || loading) return;

        // Use centralized check-in from UserContext
        const success = checkIn();

        if (success) {
            // Calculate XP bonus based on new streak
            const newStreak = (user?.stats?.streakDays || 0) + 1;
            let xpReward = 15; // Base XP
            if (newStreak >= 7) xpReward = 25;
            if (newStreak >= 14) xpReward = 35;
            if (newStreak >= 30) xpReward = 50;

            setCheckedInToday(true);
            setShowReward(true);
            addXp(xpReward, `Day ${newStreak} Check-In! 🔥`);

            setTimeout(() => setShowReward(false), 3000);
        }
    };

    if (loading) {
        return (
            <motion.div
                className="streak-widget card-3d"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="streak-header">
                    <div className="streak-icon-wrapper pulse-glow">
                        <Flame size={24} />
                    </div>
                    <div className="streak-info">
                        <span className="streak-label">Loading...</span>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="streak-widget card-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <div className="streak-header">
                <motion.div
                    className="streak-icon-wrapper pulse-glow"
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <Flame size={24} />
                </motion.div>
                <div className="streak-info">
                    <span className="streak-label">Current Streak</span>
                    <div className="streak-count">
                        <motion.span
                            className="streak-number"
                            key={streakData.currentStreak}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {streakData.currentStreak}
                        </motion.span>
                        <span className="streak-unit">days</span>
                    </div>
                </div>
                <motion.div
                    className="streak-trend"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                    title={`Best: ${streakData.longestStreak} days`}
                >
                    <TrendingUp size={16} />
                    <span>{streakData.longestStreak}</span>
                </motion.div>
            </div>

            <div className="streak-days">
                {days.map((day, index) => {
                    const isCompleted = streakData.weeklyCheckIns?.includes(index);
                    const isToday = index === adjustedToday;

                    return (
                        <motion.div
                            key={index}
                            className={`day-indicator ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.05, type: "spring", stiffness: 300 }}
                            whileHover={{ scale: 1.2, y: -3 }}
                        >
                            <motion.div
                                className="day-circle"
                                animate={isToday ? {
                                    boxShadow: [
                                        '0 0 0 3px rgba(245, 158, 11, 0.3)',
                                        '0 0 0 6px rgba(245, 158, 11, 0.1)',
                                        '0 0 0 3px rgba(245, 158, 11, 0.3)'
                                    ]
                                } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                {isCompleted && (
                                    <motion.span
                                        className="check"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 + index * 0.05, type: "spring" }}
                                    >
                                        ✓
                                    </motion.span>
                                )}
                            </motion.div>
                            <span className="day-letter">{day}</span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Check-In Button */}
            <motion.button
                className={`check-in-btn ${checkedInToday ? 'checked' : ''}`}
                onClick={handleCheckIn}
                disabled={checkedInToday}
                whileHover={!checkedInToday ? { scale: 1.03, y: -2 } : {}}
                whileTap={!checkedInToday ? { scale: 0.97 } : {}}
            >
                {checkedInToday ? (
                    <>
                        <CheckCircle size={18} />
                        Checked In Today!
                    </>
                ) : (
                    <>
                        <Zap size={18} />
                        Check In Now (+15 XP)
                    </>
                )}
            </motion.button>

            {/* XP Reward Popup */}
            <AnimatePresence>
                {showReward && (
                    <motion.div
                        className="check-in-reward"
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    >
                        <Gift size={20} />
                        <span>Streak Bonus Earned!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="streak-message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Calendar size={14} />
                <span>
                    {checkedInToday
                        ? "Great job! See you tomorrow 🔥"
                        : "Don't break your streak! Check in now"}
                </span>
            </motion.div>

            {/* Stats Row */}
            <div className="streak-stats-row">
                <div className="mini-stat">
                    <span className="mini-stat-value">{streakData.totalCheckIns}</span>
                    <span className="mini-stat-label">Total</span>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-value">{streakData.longestStreak}</span>
                    <span className="mini-stat-label">Best</span>
                </div>
            </div>
        </motion.div>
    );
}
