'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const GamificationContext = createContext();

// Temporary user ID until authentication is implemented
const USER_ID = "demo_user";

const LEVELS = [
    { level: 1, xp: 0, title: "Novice" },
    { level: 2, xp: 100, title: "Beginner" },
    { level: 3, xp: 300, title: "Apprentice" },
    { level: 4, xp: 600, title: "Explorer" },
    { level: 5, xp: 1000, title: "Guide" },
    { level: 6, xp: 1500, title: "Mentor" },
    { level: 7, xp: 2200, title: "Master" },
    { level: 8, xp: 3000, title: "Grandmaster" },
    { level: 9, xp: 4000, title: "Legend" },
    { level: 10, xp: 5500, title: "Zen Master" }
];

const DEFAULT_GAME_STATE = {
    xp: 0,
    level: 1,
    title: "Novice",
    badges: []
};

export function GamificationProvider({ children }) {
    const [gameState, setGameState] = useState(DEFAULT_GAME_STATE);
    const [loading, setLoading] = useState(true);
    const [showLevelUp, setShowLevelUp] = useState(false);

    // Load from Firestore on mount
    useEffect(() => {
        const loadGameState = async () => {
            try {
                const docRef = doc(db, "gamification", USER_ID);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setGameState(docSnap.data());
                } else {
                    // Check for localStorage data to migrate
                    const saved = localStorage.getItem('qt_game_data');
                    if (saved) {
                        const localData = JSON.parse(saved);
                        await setDoc(docRef, localData);
                        setGameState(localData);
                    } else {
                        // Initialize with defaults
                        await setDoc(docRef, DEFAULT_GAME_STATE);
                    }
                }
            } catch (error) {
                console.error("Error loading gamification from Firestore:", error);
                // Fallback to localStorage
                const saved = localStorage.getItem('qt_game_data');
                if (saved) {
                    setGameState(JSON.parse(saved));
                }
            }
            setLoading(false);
        };

        loadGameState();
    }, []);

    // Sync to Firestore whenever gameState changes
    useEffect(() => {
        if (loading) return;

        const saveToFirestore = async () => {
            try {
                await setDoc(doc(db, "gamification", USER_ID), gameState);
                // Also keep localStorage as backup
                localStorage.setItem('qt_game_data', JSON.stringify(gameState));
            } catch (error) {
                console.error("Error saving gamification to Firestore:", error);
            }
        };

        saveToFirestore();
    }, [gameState, loading]);

    const addXp = (amount) => {
        setGameState(prev => {
            const newXp = prev.xp + amount;
            let newLevel = prev.level;
            let newTitle = prev.title;

            // Check for level up
            for (let i = LEVELS.length - 1; i >= 0; i--) {
                if (newXp >= LEVELS[i].xp) {
                    newLevel = LEVELS[i].level;
                    newTitle = LEVELS[i].title;
                    break;
                }
            }

            if (newLevel > prev.level) {
                // Trigger Level Up Event
                triggerLevelUp(newLevel);
            }

            return {
                ...prev,
                xp: newXp,
                level: newLevel,
                title: newTitle
            };
        });
    };

    const addBadge = (badge) => {
        setGameState(prev => {
            // Check if badge already exists
            if (prev.badges.some(b => b.id === badge.id)) {
                return prev;
            }
            return {
                ...prev,
                badges: [...prev.badges, { ...badge, earnedAt: new Date().toISOString() }]
            };
        });
    };

    const triggerLevelUp = (level) => {
        setShowLevelUp(true);

        // Fire confetti
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };

    const closeLevelUp = () => setShowLevelUp(false);

    return (
        <GamificationContext.Provider value={{
            gameState,
            addXp,
            addBadge,
            showLevelUp,
            closeLevelUp,
            levels: LEVELS,
            loading
        }}>
            {children}
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    return useContext(GamificationContext);
}
