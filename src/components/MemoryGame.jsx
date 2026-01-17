import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RotateCcw, Trophy, Zap } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';
import './MemoryGame.css';

const emojis = ['🌟', '🎯', '💎', '🔥', '🌈', '⚡', '🎨', '🎭'];

export default function MemoryGame() {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const { addXp } = useGamification();

    const initGame = () => {
        const shuffled = [...emojis, ...emojis]
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({ id: index, emoji }));
        setCards(shuffled);
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setIsWon(false);
        setIsLocked(false);
    };

    useEffect(() => {
        initGame();
    }, []);

    useEffect(() => {
        if (matched.length === emojis.length * 2 && matched.length > 0) {
            setIsWon(true);
            addXp(25, "Memory Master!");
        }
    }, [matched, addXp]);

    const handleCardClick = (id) => {
        if (isLocked) return;
        if (flipped.includes(id)) return;
        if (matched.includes(id)) return;

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setIsLocked(true);
            setMoves(m => m + 1);
            const [first, second] = newFlipped;

            if (cards[first].emoji === cards[second].emoji) {
                // Match found!
                setTimeout(() => {
                    setMatched(prev => [...prev, first, second]);
                    setFlipped([]);
                    setIsLocked(false);
                }, 500);
            } else {
                // No match - flip back after delay
                setTimeout(() => {
                    setFlipped([]);
                    setIsLocked(false);
                }, 1000);
            }
        }
    };

    const isCardFlipped = (id) => flipped.includes(id) || matched.includes(id);

    return (
        <motion.div
            className="memory-game card-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="game-header">
                <motion.div
                    className="game-icon"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                >
                    <Brain size={18} />
                </motion.div>
                <div className="game-title">
                    <h4>Memory Match</h4>
                    <p>Train your brain</p>
                </div>
            </div>

            <div className="game-stats">
                <div className="stat">
                    <Zap size={14} />
                    <span>{moves} moves</span>
                </div>
                <div className="stat">
                    <Trophy size={14} />
                    <span>{matched.length / 2}/{emojis.length}</span>
                </div>
                <motion.button
                    className="reset-btn"
                    onClick={initGame}
                    title="New Game"
                    whileHover={{ rotate: -180, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <RotateCcw size={14} />
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                {isWon ? (
                    <motion.div
                        className="win-state"
                        key="win"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <motion.div
                            className="win-icon"
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            🎉
                        </motion.div>
                        <h4>Amazing!</h4>
                        <p>Completed in {moves} moves</p>
                        <motion.span
                            className="xp-earned"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                        >
                            +25 XP
                        </motion.span>
                        <motion.button
                            className="play-again-btn btn-glow"
                            onClick={initGame}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Play Again
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        className="cards-grid"
                        key="game"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {cards.map((card, index) => (
                            <motion.button
                                key={card.id}
                                className={`memory-card ${isCardFlipped(card.id) ? 'flipped' : ''} ${matched.includes(card.id) ? 'matched' : ''}`}
                                onClick={() => handleCardClick(card.id)}
                                disabled={matched.includes(card.id)}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    delay: index * 0.03,
                                    duration: 0.3,
                                    type: "spring",
                                    stiffness: 200
                                }}
                                whileHover={!isCardFlipped(card.id) ? { scale: 1.05 } : {}}
                                whileTap={!isCardFlipped(card.id) ? { scale: 0.95 } : {}}
                            >
                                <div className="memory-card-inner">
                                    <div className="memory-card-front">?</div>
                                    <div className="memory-card-back">{card.emoji}</div>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
