import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gamepad2, Brain, Sparkles, Heart, Flower2,
    Palette, Target, Zap, Trophy, Star, Swords, ArrowLeft
} from 'lucide-react';
import FightNightModal from '../components/FightNightModal';
import MemoryGame from '../components/MemoryGame';
import BubblePopper from '../components/BubblePopper';
import GratitudeGame from '../components/GratitudeGame';
import ZenGarden from '../components/ZenGarden';

import { useTranslation } from 'react-i18next';
import { useGamification } from '../contexts/GamificationContext';
import './GamesHub.css';

const GAMES = [
    {
        id: 'memory',
        name: 'Memory Match',
        description: 'Train your brain with this classic card matching game',
        icon: Brain,
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
        xp: 25,
        component: MemoryGame,
        available: true
    },
    {
        id: 'bubbles',
        name: 'Bubble Pop',
        description: 'Relieve stress by popping colorful bubbles',
        icon: Sparkles,
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        xp: 10,
        component: BubblePopper,
        available: true
    },
    {
        id: 'gratitude',
        name: 'Gratitude Garden',
        description: 'Plant seeds of gratitude and watch them grow',
        icon: Flower2,
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
        xp: 30,
        component: GratitudeGame,
        available: true
    },
    {
        id: 'zen',
        name: 'Zen Garden',
        description: 'Create calming patterns in virtual sand',
        icon: Palette,
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        xp: 15,
        component: ZenGarden,
        available: true
    },
    {
        id: 'focus',
        name: 'Focus Timer',
        description: 'Pomodoro-style focus sessions with rewards',
        icon: Target,
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
        xp: 50,
        available: false,
        comingSoon: true
    },
    {
        id: 'affirmations',
        name: 'Daily Affirmations',
        description: 'Build confidence with positive affirmations',
        icon: Heart,
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
        xp: 20,
        available: false,
        comingSoon: true
    },
    {
        id: 'fight-night',
        name: 'Fight Night',
        description: 'Wager your streak against others. High stakes.',
        icon: Swords,
        color: '#DC143C',
        gradient: 'linear-gradient(135deg, #DC143C, #000000)',
        xp: 100,
        available: true
    }
];

function GameCard({ game, index, onClick }) {
    const Icon = game.icon;

    return (
        <motion.div
            className={`game-card glass-panel ${game.comingSoon ? 'coming-soon' : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
            whileHover={game.available ? { y: -8, scale: 1.02, borderColor: game.color } : {}}
            onClick={game.available ? onClick : null}
            style={{ cursor: game.available ? 'pointer' : 'default' }}
        >
            <div className="game-card-glow" style={{ background: game.gradient }} />

            <motion.div
                className="game-icon-wrapper"
                style={{ background: game.gradient }}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
            >
                <Icon size={28} />
            </motion.div>

            <div className="game-info">
                <h3>{game.name}</h3>
                <p>{game.description}</p>
            </div>

            <div className="game-meta">
                <span className="xp-reward">
                    <Zap size={14} />
                    +{game.xp} XP
                </span>
                {game.comingSoon && (
                    <span className="coming-soon-badge">Coming Soon</span>
                )}
            </div>

            {game.available && (
                <motion.div
                    className="play-overlay"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                >
                    <span className="play-text">Play Now</span>
                </motion.div>
            )}
        </motion.div>
    );
}

export default function GamesHub() {
    const { t } = useTranslation();
    const { gameState } = useGamification();
    const [activeGameId, setActiveGameId] = useState(null);

    const activeGame = GAMES.find(g => g.id === activeGameId);
    const ActiveComponent = activeGame?.component;

    const handleBack = () => setActiveGameId(null);

    return (
        <div className="games-hub-page">
            <AnimatePresence mode="wait">
                {activeGameId && activeGameId !== 'fight-night' ? (
                    <motion.div
                        key="game-view"
                        className="game-view-container"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <header className="game-view-header">
                            <button className="back-to-hub-btn" onClick={handleBack}>
                                <ArrowLeft size={20} />
                                Back to Games
                            </button>
                            <h2>{activeGame.name}</h2>
                        </header>
                        <div className="game-content-area flex-center">
                            {ActiveComponent && <ActiveComponent onClose={handleBack} />}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="hub-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <header className="games-header">
                            <div className="header-content">
                                <motion.div
                                    className="header-icon"
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                >
                                    <Gamepad2 size={32} />
                                </motion.div>
                                <div>
                                    <h1 className="font-bebas tracking-wide text-glitch">Wellness Arcade</h1>
                                    <p>{t('games.subtitle', 'Play mindful games to earn XP and boost your mood')}</p>
                                </div>
                            </div>

                            <div className="stats-bar glass-panel">
                                <div className="stat-item">
                                    <Trophy size={18} className="text-yellow-500" />
                                    <span>Level {gameState.level || 1}</span>
                                </div>
                                <div className="stat-item">
                                    <Zap size={18} className="text-purple-500" />
                                    <span>{gameState.xp} XP</span>
                                </div>
                            </div>
                        </header>

                        <div className="games-grid">
                            {GAMES.map((game, index) => (
                                <GameCard
                                    key={game.id}
                                    game={game}
                                    index={index}
                                    onClick={() => setActiveGameId(game.id)}
                                />
                            ))}
                        </div>

                        <motion.section
                            className="tips-section glass-panel"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3>💡 Pro Tips</h3>
                            <ul className="text-muted text-sm">
                                <li><strong>Fight Night</strong> is high risk, high reward. Only enter if you're confident.</li>
                                <li><strong>Zen Garden</strong> is best for calming down after a chaotic day.</li>
                            </ul>
                        </motion.section>
                    </motion.div>
                )}
            </AnimatePresence>

            <FightNightModal
                isOpen={activeGameId === 'fight-night'}
                onClose={() => setActiveGameId(null)}
            />
        </div>
    );
}
