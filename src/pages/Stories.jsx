import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ChevronLeft, ChevronRight, Plus, Sparkles, Send, Trash2 } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem, TiltCard } from '../components/Animations';
import { useContent } from '../contexts/ContentContext';
import { useUser } from '../contexts/UserContext';
import './Stories.css';

const CATEGORY_COLORS = {
    addiction: 'from-red-500 to-orange-500',
    anxiety: 'from-blue-400 to-cyan-300',
    depression: 'from-purple-500 to-pink-500',
    wellness: 'from-green-500 to-emerald-400',
    stress: 'from-yellow-500 to-orange-400'
};

export default function Stories() {
    const { stories, addStory, toggleStoryLike, deleteStory } = useContent();
    const { user } = useUser();

    // Sort stories: user's stories first, then by time
    const sortedStories = [...stories].sort((a, b) => {
        if (a.author === user.name) return -1;
        if (b.author === user.name) return 1;
        return new Date(b.time) - new Date(a.time);
    });

    const [activeStoryIndex, setActiveStoryIndex] = useState(null);
    const [progress, setProgress] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newStory, setNewStory] = useState({
        quote: '',
        story: '',
        tag: 'wellness'
    });

    const timerRef = useRef(null);
    const storiesLengthRef = useRef(sortedStories.length);

    const isViewerOpen = activeStoryIndex !== null;
    const activeStory = isViewerOpen ? sortedStories[activeStoryIndex] : null;

    // Update stories length ref
    useEffect(() => {
        storiesLengthRef.current = sortedStories.length;
    }, [sortedStories.length]);

    const closeViewer = useCallback(() => {
        setActiveStoryIndex(null);
        setProgress(0);
    }, []);

    const handleNext = useCallback(() => {
        setActiveStoryIndex(prev => {
            if (prev === null) return null;
            if (prev < storiesLengthRef.current - 1) {
                setProgress(0);
                return prev + 1;
            } else {
                // Close viewer when at end
                setProgress(0);
                return null;
            }
        });
    }, []);

    const handlePrev = useCallback(() => {
        setActiveStoryIndex(prev => {
            if (prev === null || prev <= 0) return prev;
            setProgress(0);
            return prev - 1;
        });
    }, []);

    // Auto-advance logic with proper cleanup
    useEffect(() => {
        if (!isViewerOpen) {
            setProgress(0);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        const duration = 5000;
        const interval = 100; // Less frequent updates for performance
        const step = 100 / (duration / interval);

        timerRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [activeStoryIndex, isViewerOpen, handleNext]);

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
    };

    const handleCreateStory = (e) => {
        e.preventDefault();
        if (!newStory.quote.trim() || !newStory.story.trim()) return;

        const storyData = {
            author: user.name,
            initial: getInitials(user.name),
            tag: newStory.tag,
            daysClean: user.stats.streakDays,
            quote: newStory.quote,
            excerpt: newStory.story,
            color: CATEGORY_COLORS[newStory.tag] || CATEGORY_COLORS.wellness,
            isNew: true
        };

        addStory(storyData);
        setNewStory({ quote: '', story: '', tag: 'wellness' });
        setShowCreateModal(false);
    };

    const handleDelete = (e, storyId) => {
        e.stopPropagation();
        if (window.confirm("Delete this story?")) {
            if (activeStoryIndex !== null) closeViewer();
            deleteStory(storyId);
        }
    };

    return (
        <div className="stories-page">
            <FadeIn direction="down">
                <header className="stories-header">
                    <h2>Voices of Victory</h2>
                    <p>Tap a story to experience their journey.</p>
                </header>
            </FadeIn>

            {/* Grid View */}
            <StaggerContainer className="stories-grid">
                {/* Create Story Card */}
                <StaggerItem>
                    <TiltCard>
                        <motion.div
                            className="story-card create-story-card glass-panel"
                            onClick={() => setShowCreateModal(true)}
                            whileHover={{ scale: 1.05, y: -8 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="create-story-icon">
                                <Plus size={24} />
                            </div>
                            <div className="story-preview">
                                <h4>Share Your Story</h4>
                                <span className="create-hint">Inspire others</span>
                            </div>
                        </motion.div>
                    </TiltCard>
                </StaggerItem>

                {sortedStories.map((story, index) => (
                    <motion.div
                        key={story.id}
                        className={`story-card glass-panel ${story.isNew ? 'new-story' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveStoryIndex(index);
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={`story-ring-container ${story.tag}`}>
                            <div className="story-avatar">{story.initial}</div>
                        </div>
                        <div className="story-preview">
                            <h4>{story.author} {story.author === user.name && '(You)'}</h4>
                            <span className="days-badge">{story.daysClean}d</span>
                            {story.author === user.name && (
                                <button className="delete-story-btn-mini" onClick={(e) => handleDelete(e, story.id)}>
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                        {story.isNew && <span className="new-badge">New</span>}
                    </motion.div>
                ))}
            </StaggerContainer>

            {/* Create Story Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        className="story-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            className="create-story-modal glass-panel"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="create-modal-header">
                                <div className="modal-title-row">
                                    <Sparkles size={24} className="modal-icon" />
                                    <h3>Share Your Victory</h3>
                                </div>
                                <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateStory} className="create-story-form">
                                <div className="form-group">
                                    <label>Your Quote (Headline)</label>
                                    <input
                                        type="text"
                                        placeholder="What's your victory message?"
                                        value={newStory.quote}
                                        onChange={(e) => setNewStory(prev => ({ ...prev, quote: e.target.value }))}
                                        maxLength={100}
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Your Story</label>
                                    <textarea
                                        placeholder="Share your journey... What helped you? What would you tell others?"
                                        value={newStory.story}
                                        onChange={(e) => setNewStory(prev => ({ ...prev, story: e.target.value }))}
                                        maxLength={300}
                                        rows={4}
                                    />
                                    <span className="char-count">{newStory.story.length}/300</span>
                                </div>

                                <div className="form-group">
                                    <label>Journey Type</label>
                                    <div className="tag-options">
                                        {['addiction', 'anxiety', 'depression', 'wellness', 'stress'].map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                className={`tag-option ${newStory.tag === tag ? 'selected' : ''} ${tag}`}
                                                onClick={() => setNewStory(prev => ({ ...prev, tag }))}
                                            >
                                                {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-glow"
                                        disabled={!newStory.quote.trim() || !newStory.story.trim()}
                                    >
                                        <Send size={18} /> Share Story
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Immersive Viewer Overlay */}
            <AnimatePresence>
                {isViewerOpen && activeStory && (
                    <motion.div
                        className="story-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="story-backdrop"
                            onClick={closeViewer}
                            initial={{ backdropFilter: 'blur(0px)' }}
                            animate={{ backdropFilter: 'blur(10px)' }}
                        />

                        <motion.div
                            className="story-viewer-modal"
                            initial={{ scale: 0.8, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, y: 50, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            {/* Progress Bars */}
                            <div className="story-progress-container">
                                {sortedStories.map((_, idx) => (
                                    <div key={idx} className="progress-bg">
                                        <motion.div
                                            className="progress-fill"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: idx < activeStoryIndex ? '100%' :
                                                    idx === activeStoryIndex ? `${progress}%` : '0%'
                                            }}
                                            transition={{ duration: 0.05 }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Content */}
                            <motion.div
                                className={`story-slide slide-${activeStory.tag}`}
                                key={activeStoryIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                            >
                                <div className="slide-header">
                                    <motion.div
                                        className="slide-avatar"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.1 }}
                                    >
                                        {activeStory.initial}
                                    </motion.div>
                                    <div className="slide-meta">
                                        <h4>{activeStory.author}</h4>
                                        <span>{activeStory.daysClean} Days Clean • {activeStory.tag}</span>
                                    </div>
                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                        {activeStory.author === user.name && (
                                            <button
                                                className="close-btn"
                                                onClick={(e) => handleDelete(e, activeStory.id)}
                                                title="Delete Story"
                                            >
                                                <Trash2 size={24} />
                                            </button>
                                        )}
                                        <motion.button
                                            className="close-btn"
                                            onClick={closeViewer}
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <X size={24} />
                                        </motion.button>
                                    </div>
                                </div>

                                <motion.div
                                    className="slide-body"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <blockquote className="slide-quote">"{activeStory.quote}"</blockquote>
                                    <p className="slide-excerpt">{activeStory.excerpt}</p>
                                </motion.div>

                                <motion.div
                                    className="slide-footer"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="reaction-buttons" style={{ justifyContent: 'center', width: '100%' }}>
                                        {[
                                            { emoji: '❤️', key: 'heart' },
                                            { emoji: '🔥', key: 'fire' },
                                            { emoji: '💪', key: 'strong' },
                                            { emoji: '👏', key: 'clap' }
                                        ].map((reaction) => (
                                            <motion.button
                                                key={reaction.key}
                                                className={`reaction-btn`}
                                                onClick={() => toggleStoryLike(activeStory.id)}
                                                whileHover={{ scale: 1.3, y: -5 }}
                                                whileTap={{ scale: 0.8 }}
                                            >
                                                <motion.span>
                                                    {reaction.emoji}
                                                </motion.span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Navigation Arrows */}
                            {activeStoryIndex > 0 && (
                                <motion.button
                                    className="story-nav-btn prev"
                                    onClick={handlePrev}
                                    whileHover={{ scale: 1.1, x: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ChevronLeft size={32} />
                                </motion.button>
                            )}
                            {activeStoryIndex < sortedStories.length - 1 && (
                                <motion.button
                                    className="story-nav-btn next"
                                    onClick={handleNext}
                                    whileHover={{ scale: 1.1, x: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ChevronRight size={32} />
                                </motion.button>
                            )}

                            {/* Tap Navigation Zones */}
                            <div className="tap-zone left" onClick={handlePrev}></div>
                            <div className="tap-zone right" onClick={handleNext}></div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
