'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ChevronLeft, ChevronRight, Plus, Sparkles, Send, Trash2 } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import { useUser } from '@/contexts/UserContext';
import { useGamification } from '@/contexts/GamificationContext';
import ReportModal from '@/components/ReportModal';
import '@/pages/Stories.css';

const CATEGORY_COLORS = {
    addiction: 'from-red-500 to-orange-500',
    anxiety: 'from-blue-400 to-cyan-300',
    depression: 'from-purple-500 to-pink-500',
    wellness: 'from-green-500 to-emerald-400',
    stress: 'from-yellow-500 to-orange-400'
};

export default function Stories() {
    const [activeStory, setActiveStory] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newStory, setNewStory] = useState({ title: '', excerpt: '', category: 'wellness' });
    const timerRef = useRef(null);

    const { stories, addStory, deleteStory, toggleStoryReaction, loading } = useContent();
    const { user } = useUser();
    const { addXp, gameState } = useGamification();

    // Story viewer timer
    useEffect(() => {
        if (activeStory && !isPaused) {
            timerRef.current = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        const currentIndex = stories.findIndex(s => s.id === activeStory.id);
                        if (currentIndex < stories.length - 1) {
                            setActiveStory(stories[currentIndex + 1]);
                            return 0;
                        } else {
                            setActiveStory(null);
                            return 0;
                        }
                    }
                    return prev + 2;
                });
            }, 100);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [activeStory, isPaused, stories]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!activeStory) return;
            if (e.key === 'ArrowRight') nextStory();
            if (e.key === 'ArrowLeft') prevStory();
            if (e.key === 'Escape') setActiveStory(null);
            if (e.key === ' ') setIsPaused(p => !p);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeStory, stories]);

    const nextStory = useCallback(() => {
        if (!activeStory || !stories.length) return;
        const currentIndex = stories.findIndex(s => s.id === activeStory.id);
        if (currentIndex < stories.length - 1) {
            setActiveStory(stories[currentIndex + 1]);
            setProgress(0);
        } else {
            setActiveStory(null);
        }
    }, [activeStory, stories]);

    const prevStory = useCallback(() => {
        if (!activeStory || !stories.length) return;
        const currentIndex = stories.findIndex(s => s.id === activeStory.id);
        if (currentIndex > 0) {
            setActiveStory(stories[currentIndex - 1]);
            setProgress(0);
        }
    }, [activeStory, stories]);

    const handleReaction = (type) => {
        if (activeStory) {
            toggleStoryReaction(activeStory.id, type);
        }
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    };

    const handleCreateStory = async (e) => {
        e.preventDefault();
        if (!newStory.title.trim() || !newStory.excerpt.trim()) return;

        const story = {
            id: Date.now(),
            author: user.name,
            avatar: user.avatar,
            title: newStory.title,
            excerpt: newStory.excerpt,
            category: newStory.category,
            reactions: { fire: 0, heart: 0, clap: 0, support: 0 },
            comments: [],
            time: new Date().toISOString()
        };

        await addStory(story);
        addXp(30, "Shared Story");
        setNewStory({ title: '', excerpt: '', category: 'wellness' });
        setShowCreate(false);
    };

    const handleDelete = async (e, storyId) => {
        e.stopPropagation();
        if (window.confirm("Delete this story?")) {
            await deleteStory(storyId);
        }
    };

    if (loading) {
        return (
            <div className="stories-page loading">
                <motion.div
                    className="loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <p>Loading stories...</p>
            </div>
        );
    }

    return (
        <div className="stories-page">
            <header className="page-header">
                <div className="header-content">
                    <h2 className="page-title">
                        <span className="text-gradient-aurora">Stories</span>
                    </h2>
                    <p className="page-subtitle">Share your journey, inspire others</p>
                </div>
                <motion.button
                    className="create-story-btn btn-glow"
                    onClick={() => setShowCreate(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus size={20} />
                    <span>Share Your Story</span>
                </motion.button>
            </header>

            {/* Story Grid */}
            <div className="stories-grid">
                {stories.map((story, index) => (
                    <motion.article
                        key={story.id}
                        className={`story-card glass-panel category-${story.category}`}
                        onClick={() => {
                            setActiveStory(story);
                            setProgress(0);
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.2)' }}
                    >
                        <div className="story-header">
                            <div className="author-avatar">{story.avatar || getInitials(story.author)}</div>
                            <div className="author-info">
                                <span className="author-name">{story.author}</span>
                                <span className="story-category">{story.category}</span>
                            </div>
                            <button
                                className="delete-btn"
                                onClick={(e) => handleDelete(e, story.id)}
                                title="Delete story"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <h3 className="story-title">{story.title}</h3>
                        <p className="story-excerpt">{story.excerpt}</p>
                        <div className="story-stats">
                            <span>🔥 {story.reactions?.fire || 0}</span>
                            <span>❤️ {story.reactions?.heart || 0}</span>
                            <span>👏 {story.reactions?.clap || 0}</span>
                        </div>
                    </motion.article>
                ))}
            </div>

            {/* Story Viewer Overlay */}
            <AnimatePresence>
                {activeStory && (
                    <motion.div
                        className="story-viewer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveStory(null)}
                    >
                        <motion.div
                            className="story-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Progress Bar */}
                            <div className="progress-bar">
                                <motion.div
                                    className="progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {/* Header */}
                            <div className="viewer-header">
                                <div className="author-info">
                                    <div className="author-avatar">{activeStory.avatar || getInitials(activeStory.author)}</div>
                                    <div>
                                        <h4>{activeStory.author}</h4>
                                        <span className="story-time">{new Date(activeStory.time).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="viewer-controls">
                                    <motion.button
                                        onClick={() => setIsPaused(p => !p)}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {isPaused ? '▶️' : '⏸️'}
                                    </motion.button>
                                    <motion.button onClick={() => setActiveStory(null)} whileTap={{ scale: 0.9 }}>
                                        <X size={24} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Navigation */}
                            <button className="nav-btn prev" onClick={prevStory}>
                                <ChevronLeft size={32} />
                            </button>
                            <button className="nav-btn next" onClick={nextStory}>
                                <ChevronRight size={32} />
                            </button>

                            {/* Story Content */}
                            <div className="story-body">
                                <span className={`category-badge ${activeStory.category}`}>
                                    {activeStory.category}
                                </span>
                                <h2>{activeStory.title}</h2>
                                <p>{activeStory.excerpt}</p>
                            </div>

                            {/* Reactions */}
                            <div className="reactions-bar">
                                {[
                                    { type: 'fire', emoji: '🔥' },
                                    { type: 'heart', emoji: '❤️' },
                                    { type: 'clap', emoji: '👏' },
                                    { type: 'support', emoji: '🤝' }
                                ].map(({ type, emoji }) => (
                                    <motion.button
                                        key={type}
                                        className="reaction-btn"
                                        onClick={() => handleReaction(type)}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <span className="emoji">{emoji}</span>
                                        <span className="count">{activeStory.reactions?.[type] || 0}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Story Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        className="create-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreate(false)}
                    >
                        <motion.div
                            className="create-modal glass-panel"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3><Sparkles size={20} /> Share Your Story</h3>
                                <button onClick={() => setShowCreate(false)}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleCreateStory}>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        placeholder="Give your story a title..."
                                        value={newStory.title}
                                        onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                                        maxLength={100}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Your Story</label>
                                    <textarea
                                        placeholder="Share your experience, what you've learned, or how you're feeling..."
                                        value={newStory.excerpt}
                                        onChange={(e) => setNewStory({ ...newStory, excerpt: e.target.value })}
                                        rows={5}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={newStory.category}
                                        onChange={(e) => setNewStory({ ...newStory, category: e.target.value })}
                                    >
                                        <option value="wellness">Wellness</option>
                                        <option value="addiction">Addiction Recovery</option>
                                        <option value="anxiety">Anxiety</option>
                                        <option value="depression">Depression</option>
                                        <option value="stress">Stress Management</option>
                                    </select>
                                </div>
                                <motion.button
                                    type="submit"
                                    className="submit-btn btn-glow"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Send size={18} />
                                    <span>Share Story</span>
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
