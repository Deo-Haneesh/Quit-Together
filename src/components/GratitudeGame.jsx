import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower2, Sparkles, Send, RotateCcw, Heart } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';
import './GratitudeGame.css';

const PROMPTS = [
    "What made you smile today?",
    "Who are you grateful for?",
    "What's a small thing that brought you joy?",
    "What ability or skill are you thankful for?",
    "What's something beautiful you noticed today?",
    "What challenge helped you grow?",
    "What comfort are you grateful for?",
    "Who made a positive difference in your life?",
    "What opportunity are you thankful for?",
    "What memory makes you feel grateful?"
];

const PLANT_STAGES = ['🌱', '🌿', '🌻', '🌸', '🌺'];

export default function GratitudeGame() {
    const [entries, setEntries] = useState([]);
    const [currentEntry, setCurrentEntry] = useState('');
    const [currentPrompt, setCurrentPrompt] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const { addXp } = useGamification();

    const plantStage = Math.min(entries.length, PLANT_STAGES.length - 1);

    const getRandomPrompt = () => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * PROMPTS.length);
        } while (newIndex === currentPrompt && PROMPTS.length > 1);
        setCurrentPrompt(newIndex);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!currentEntry.trim()) return;

        const newEntry = {
            id: Date.now(),
            text: currentEntry.trim(),
            prompt: PROMPTS[currentPrompt],
            timestamp: new Date()
        };

        setEntries(prev => [...prev, newEntry]);
        setCurrentEntry('');
        getRandomPrompt();

        // Check if complete (3 gratitudes)
        if (entries.length + 1 >= 3) {
            setIsComplete(true);
            setShowCelebration(true);
            addXp(30, "Gratitude Garden Complete! 🌸");
            setTimeout(() => setShowCelebration(false), 3000);
        }
    };

    const resetGame = () => {
        setEntries([]);
        setCurrentEntry('');
        setIsComplete(false);
        getRandomPrompt();
    };

    return (
        <motion.div
            className="gratitude-game card-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="game-header">
                <motion.div
                    className="game-icon"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <Flower2 size={18} />
                </motion.div>
                <div className="game-title">
                    <h4>Gratitude Garden</h4>
                    <p>Plant 3 seeds of gratitude</p>
                </div>
                <motion.button
                    className="reset-btn"
                    onClick={resetGame}
                    whileHover={{ rotate: -180 }}
                    whileTap={{ scale: 0.9 }}
                    title="Start over"
                >
                    <RotateCcw size={14} />
                </motion.button>
            </div>

            {/* Plant visualization */}
            <div className="plant-container">
                <motion.div
                    className="plant"
                    key={plantStage}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    {PLANT_STAGES[plantStage]}
                </motion.div>
                <div className="progress-dots">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className={`dot ${i < entries.length ? 'filled' : ''}`}
                            animate={i < entries.length ? { scale: [1, 1.2, 1] } : {}}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!isComplete ? (
                    <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        className="gratitude-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.p
                            className="prompt"
                            key={currentPrompt}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {PROMPTS[currentPrompt]}
                        </motion.p>
                        <div className="input-row">
                            <input
                                type="text"
                                value={currentEntry}
                                onChange={(e) => setCurrentEntry(e.target.value)}
                                placeholder="Type your gratitude..."
                                maxLength={100}
                            />
                            <motion.button
                                type="submit"
                                className="submit-btn"
                                disabled={!currentEntry.trim()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Send size={16} />
                            </motion.button>
                        </div>
                    </motion.form>
                ) : (
                    <motion.div
                        key="complete"
                        className="complete-state"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <motion.div
                            className="celebration-emoji"
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            🌸
                        </motion.div>
                        <h4>Garden Complete!</h4>
                        <p>You've planted 3 seeds of gratitude today</p>
                        <motion.span
                            className="xp-earned"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            +30 XP
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Entries list */}
            {entries.length > 0 && !isComplete && (
                <div className="entries-list">
                    {entries.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            className="entry-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Heart size={12} className="entry-icon" />
                            <span>{entry.text}</span>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Celebration particles */}
            <AnimatePresence>
                {showCelebration && (
                    <div className="celebration-container">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="particle"
                                initial={{
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                    scale: 1
                                }}
                                animate={{
                                    opacity: 0,
                                    x: (Math.random() - 0.5) * 200,
                                    y: Math.random() * -150 - 50,
                                    scale: 0
                                }}
                                transition={{ duration: 1.5, delay: i * 0.05 }}
                            >
                                {['✨', '🌸', '💫', '🌺', '⭐'][i % 5]}
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
