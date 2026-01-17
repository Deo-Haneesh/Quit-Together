'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

// Temporary user ID until authentication is implemented
const USER_ID = "demo_user";

const DEFAULT_USER = {
    name: "S.Deo Haneesh",
    handle: "@haneesh",
    avatar: "SD",
    bio: "On a journey to find peace and balance. 🌿",
    location: "Start City",
    interests: ["Meditation", "Journaling"],
    joinedDate: new Date().toISOString(),
    stats: {
        streakDays: 0,
        longestStreak: 0,
        lastCheckIn: null,
        totalCheckIns: 0,
        weeklyCheckIns: [],
        moodHistory: []
    }
};

export function UserProvider({ children }) {
    const [user, setUser] = useState(DEFAULT_USER);
    const [loading, setLoading] = useState(true);

    // Load from Firestore on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const docRef = doc(db, "users", USER_ID);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUser(docSnap.data());
                } else {
                    // Check for localStorage data to migrate
                    const savedUser = localStorage.getItem('qt_user_data');
                    const savedStreak = localStorage.getItem('streak_data');

                    let userData = DEFAULT_USER;

                    if (savedUser) {
                        const localUser = JSON.parse(savedUser);
                        userData = { ...userData, ...localUser };
                    }

                    // Merge streak data if exists
                    if (savedStreak) {
                        const localStreak = JSON.parse(savedStreak);
                        userData.stats = {
                            ...userData.stats,
                            streakDays: localStreak.currentStreak || 0,
                            longestStreak: localStreak.longestStreak || 0,
                            lastCheckIn: localStreak.lastCheckIn || null,
                            totalCheckIns: localStreak.totalCheckIns || 0,
                            weeklyCheckIns: localStreak.weeklyCheckIns || []
                        };
                    }

                    // Save migrated data to Firestore
                    await setDoc(docRef, userData);
                    setUser(userData);
                }
            } catch (error) {
                console.error("Error loading user from Firestore:", error);
                // Fallback to localStorage
                const saved = localStorage.getItem('qt_user_data');
                if (saved) {
                    setUser(JSON.parse(saved));
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    // Sync to Firestore whenever user changes (debounced)
    useEffect(() => {
        if (loading) return;

        const saveToFirestore = async () => {
            try {
                await setDoc(doc(db, "users", USER_ID), user);
                // Also keep localStorage as backup
                localStorage.setItem('qt_user_data', JSON.stringify(user));
            } catch (error) {
                console.error("Error saving user to Firestore:", error);
            }
        };

        saveToFirestore();
    }, [user, loading]);

    const updateProfile = (updates) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    const updateStats = (updates) => {
        setUser(prev => ({
            ...prev,
            stats: { ...prev.stats, ...updates }
        }));
    };

    const checkIn = () => {
        const now = new Date();
        const today = now.toDateString();
        const lastCheckInDate = user.stats.lastCheckIn ? new Date(user.stats.lastCheckIn) : null;
        const last = lastCheckInDate ? lastCheckInDate.toDateString() : null;

        if (today === last) return false; // Already checked in today

        // Calculate days difference properly
        let newStreak = 1; // Default to 1 for first check-in or after break

        if (lastCheckInDate) {
            // Calculate the difference in calendar days
            const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastMidnight = new Date(lastCheckInDate.getFullYear(), lastCheckInDate.getMonth(), lastCheckInDate.getDate());
            const daysDiff = Math.round((todayMidnight - lastMidnight) / 86400000);

            if (daysDiff === 1) {
                // Consecutive day - continue streak
                newStreak = user.stats.streakDays + 1;
            } else if (daysDiff === 0) {
                // Same day (shouldn't reach here due to early return, but just in case)
                newStreak = user.stats.streakDays;
            }
            // If daysDiff > 1, streak resets to 1 (already set as default)
        }

        // Calculate today's day index for weekly check-ins (Monday = 0, Sunday = 6)
        const dayOfWeek = now.getDay();
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        // Check if we need to reset weekly check-ins (new week started)
        let newWeeklyCheckIns = [...(user.stats.weeklyCheckIns || [])];

        if (lastCheckInDate) {
            const lastDayOfWeek = lastCheckInDate.getDay();
            const lastAdjustedDay = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;

            // If today is earlier in the week than last check-in, it's a new week
            // Or if more than 7 days have passed
            const daysSinceLastCheckIn = Math.round((now - lastCheckInDate) / 86400000);
            if (adjustedDay < lastAdjustedDay || daysSinceLastCheckIn >= 7) {
                newWeeklyCheckIns = []; // Reset for new week
            }
        }

        if (!newWeeklyCheckIns.includes(adjustedDay)) {
            newWeeklyCheckIns.push(adjustedDay);
        }

        setUser(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                streakDays: newStreak,
                longestStreak: Math.max(prev.stats.longestStreak || 0, newStreak),
                lastCheckIn: now.toISOString(),
                totalCheckIns: prev.stats.totalCheckIns + 1,
                weeklyCheckIns: newWeeklyCheckIns
            }
        }));

        return true;
    };

    return (
        <UserContext.Provider value={{ user, updateProfile, updateStats, checkIn, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
