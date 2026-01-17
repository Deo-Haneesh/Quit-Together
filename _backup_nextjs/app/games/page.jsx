'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Gamepad2, Brain, Sparkles, Heart, Flower2,
    Palette, Target, Zap, Trophy, Star, Swords, X
} from 'lucide-react';
import FightNightModal from '@/components/FightNightModal';
import MemoryGame from '@/components/MemoryGame';
import BubblePopper from '@/components/BubblePopper';
import GratitudeGame from '@/components/GratitudeGame';
import ZenGarden from '@/components/ZenGarden';
import { useTranslation } from 'react-i18next';
import { useGamification } from '@/contexts/GamificationContext';
import '@/pages/GamesHub.css';

const GAMES = [
    {
        id: 'memory',
        name: 'Memory Match',
        description: 'Train your brain with this classic card matching game',
        icon: Brain,
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
        xp: 25,
        component: 'MemoryGame',
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
        component: 'BubblePopper',
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
        component: 'GratitudeGame',
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
        component: 'ZenGarden',
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
        component: 'FocusTimer',
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
        component: 'Affirmations',
    },
    {
        id: 'fight-night',
        name: 'Fight Night',
        description: 'Wager your streak against others. High stakes.',
        icon: Swords,
        color: '#DC143C',
        gradient: 'linear-gradient(135deg, #DC143C, #000000)',
        xp: 100,
        component: 'FightNight',
        available: true
    }
];

// Game Modal Component
function GameModal({ gameId, gameName, onClose }) {
    if (!gameId) return null;

    const renderGame = () => {
        switch (gameId) {
            case 'memory':
                return <MemoryGame />;
            case 'bubbles':
                return <BubblePopper />;
            case 'gratitude':
                return <GratitudeGame />;
            case 'zen':
                return <ZenGarden />;
            default:
                return <div>Game coming soon!</div>;
        }
    };

    return (
        <motion.div
            className="game-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '2rem'
            }}
        >
            <motion.div
                className="game-modal-content glass-panel"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--glass)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    position: 'relative'
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <h2 style={{ margin: 0 }}>{gameName}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>
                {renderGame()}
            </motion.div>
        </motion.div>
    );
}

function GameCard({ game, index }) {
    const Icon = game.icon;

    return (
        <motion.div
            className={`game-card glass-panel ${game.comingSoon ? 'coming-soon' : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
            whileHover={game.available ? { y: -8, scale: 1.02 } : {}}
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

    return (
        <div className="games-hub-page">
            <motion.header
                className="games-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="header-content">
                    <motion.div
                        className="header-icon"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                    >
                        <Gamepad2 size={32} />
                    </motion.div>
                    <div>
                        <h1>{t('games.title', 'Wellness Games')}</h1>
                        <p>{t('games.subtitle', 'Play mindful games to earn XP and boost your mood')}</p>
                    </div>
                </div>

                <div className="stats-bar glass-panel">
                    <div className="stat-item">
                        <Trophy size={18} />
                        <span>Level {gameState.level}</span>
                    </div>
                    <div className="stat-item">
                        <Zap size={18} />
                        <span>{gameState.xp} XP</span>
                    </div>
                    <div className="stat-item">
                        <Star size={18} />
                        <span>{gameState.title}</span>
                    </div>
                </div>
            </motion.header>

            <div className="games-grid">
                {GAMES.map((game, index) => (
                    <div
                        key={game.id}
                        onClick={() => game.available && setActiveGameId(game.id)}
                        style={{ cursor: game.available ? 'pointer' : 'default' }}
                    >
                        <GameCard game={game} index={index} />
                    </div>
                ))}
            </div>

            <FightNightModal
                isOpen={activeGameId === 'fight-night'}
                onClose={() => setActiveGameId(null)}
            />

            <AnimatePresence>
                {activeGameId && activeGameId !== 'fight-night' && (
                    <GameModal
                        gameId={activeGameId}
                        gameName={GAMES.find(g => g.id === activeGameId)?.name || 'Game'}
                        onClose={() => setActiveGameId(null)}
                    />
                )}
            </AnimatePresence>

            <motion.section
                className="tips-section glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h3>💡 Quick Tips</h3>
                <ul>
                    <li>Play games during stressful moments to calm your mind</li>
                    <li>Complete daily games to maintain your streak</li>
                    <li>Earn XP to unlock new titles and achievements</li>
                </ul>
            </motion.section>
        </div>
    );
}
