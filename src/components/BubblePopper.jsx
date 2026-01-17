import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Trophy } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';
import './BubblePopper.css';

export default function BubblePopper() {
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [popEffects, setPopEffects] = useState([]);
    const { addXp } = useGamification();
    const containerRef = useRef(null);

    const colors = [
        'linear-gradient(135deg, #8b5cf6, #6366f1)',
        'linear-gradient(135deg, #06b6d4, #3b82f6)',
        'linear-gradient(135deg, #10b981, #06b6d4)',
        'linear-gradient(135deg, #f59e0b, #ef4444)',
        'linear-gradient(135deg, #ec4899, #8b5cf6)',
    ];

    const spawnBubble = useCallback(() => {
        const id = Date.now() + Math.random();
        const size = Math.random() * 30 + 30;
        const x = Math.random() * 70 + 15; // Keep bubbles more centered
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 3 + 4;

        setBubbles(prev => [...prev, { id, size, x, color, duration }]);

        // Remove bubble after duration
        setTimeout(() => {
            setBubbles(prev => prev.filter(b => b.id !== id));
        }, duration * 1000);
    }, []);

    useEffect(() => {
        // Spawn initial bubbles
        spawnBubble();
        spawnBubble();

        const interval = setInterval(spawnBubble, 1500);
        return () => clearInterval(interval);
    }, [spawnBubble]);

    const popBubble = (id, e) => {
        e.stopPropagation();
        const bubble = bubbles.find(b => b.id === id);
        if (!bubble) return;

        // Create pop effect
        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
            const popX = rect.left - containerRect.left + rect.width / 2;
            const popY = rect.top - containerRect.top + rect.height / 2;

            const effectId = Date.now();
            setPopEffects(prev => [...prev, { id: effectId, x: popX, y: popY, color: bubble.color }]);
            setTimeout(() => {
                setPopEffects(prev => prev.filter(p => p.id !== effectId));
            }, 500);
        }

        // Remove bubble immediately
        setBubbles(prev => prev.filter(b => b.id !== id));

        const newScore = score + 10;
        setScore(newScore);

        if (newScore > highScore) {
            setHighScore(newScore);
        }

        if (newScore % 50 === 0) {
            addXp(5, "Bubble Master!");
        }
    };

    const resetScore = () => {
        setScore(0);
    };

    return (
        <motion.div
            className="bubble-popper card-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="popper-header">
                <motion.div
                    className="popper-icon"
                    animate={{
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 3 }}
                >
                    <Sparkles size={18} />
                </motion.div>
                <div className="popper-title">
                    <h4>Bubble Pop</h4>
                    <p>Relax & focus</p>
                </div>
            </div>

            <div className="score-row">
                <div className="score-item">
                    <span className="score-label">Score</span>
                    <motion.span
                        className="score-value"
                        key={score}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {score}
                    </motion.span>
                </div>
                <div className="score-divider"></div>
                <div className="score-item">
                    <Trophy size={14} className="trophy-icon" />
                    <span className="score-value high">{highScore}</span>
                </div>
                <motion.button
                    className="reset-btn"
                    onClick={resetScore}
                    title="Reset Score"
                    whileHover={{ rotate: -180, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <RotateCcw size={14} />
                </motion.button>
            </div>

            <div className="bubble-container" ref={containerRef}>
                <AnimatePresence>
                    {bubbles.map(bubble => (
                        <motion.button
                            key={bubble.id}
                            className="bubble"
                            style={{
                                width: bubble.size,
                                height: bubble.size,
                                left: `${bubble.x}%`,
                                background: bubble.color,
                            }}
                            initial={{
                                bottom: -60,
                                opacity: 0,
                                scale: 0.5
                            }}
                            animate={{
                                bottom: 180, // Move to top of container
                                opacity: 1,
                                scale: 1,
                            }}
                            exit={{
                                scale: 1.5,
                                opacity: 0,
                                transition: { duration: 0.15 }
                            }}
                            transition={{
                                duration: bubble.duration,
                                ease: "linear",
                                opacity: { duration: 0.5 }
                            }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => popBubble(bubble.id, e)}
                        >
                            <span className="bubble-shine"></span>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {/* Pop effects */}
                <AnimatePresence>
                    {popEffects.map(effect => (
                        <motion.div
                            key={effect.id}
                            className="pop-effect"
                            style={{
                                left: effect.x,
                                top: effect.y,
                            }}
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {[...Array(6)].map((_, i) => (
                                <motion.span
                                    key={i}
                                    className="pop-particle"
                                    style={{ background: effect.color }}
                                    initial={{ x: 0, y: 0, opacity: 1 }}
                                    animate={{
                                        x: Math.cos(i * 60 * Math.PI / 180) * 30,
                                        y: Math.sin(i * 60 * Math.PI / 180) * 30,
                                        opacity: 0
                                    }}
                                    transition={{ duration: 0.4 }}
                                />
                            ))}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
