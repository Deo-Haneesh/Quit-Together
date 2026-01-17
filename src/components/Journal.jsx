import React, { useState } from 'react';
import { Save, BookOpen, PenTool, Trash2, AlertTriangle, X } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { useGamification } from '../contexts/GamificationContext';
import './Journal.css';

const MOODS = [
    { value: 1, emoji: '😭' },
    { value: 2, emoji: '😟' },
    { value: 3, emoji: '😐' },
    { value: 4, emoji: '🙂' },
    { value: 5, emoji: '😄' },
];

export default function Journal() {
    const { journalEntries, addJournalEntry, deleteJournalEntry } = useContent();
    const { addXp } = useGamification();
    const [entry, setEntry] = useState('');
    const [selectedMood, setSelectedMood] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // Holds entry id to delete

    const handleSave = () => {
        if (!entry.trim()) return;

        const newEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            content: entry,
            mood: selectedMood,
        };

        addJournalEntry(newEntry);
        addXp(30, "Journaling");
        setEntry('');
        setSelectedMood(null);
    };

    const handleDeleteClick = (entryId) => {
        setDeleteConfirm(entryId);
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm) {
            deleteJournalEntry(deleteConfirm);
            setDeleteConfirm(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirm(null);
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMoodEmoji = (moodValue) => {
        const mood = MOODS.find(m => m.value === moodValue);
        return mood ? mood.emoji : '';
    };

    return (
        <div className="glass-panel">
            <div className="section-header">
                <h3>📖 Personal Journal</h3>
                <span className="subtitle">Reflect on your journey and track your thoughts</span>
            </div>

            <div className="journal-container">
                <div className="journal-editor">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <PenTool size={16} />
                        Write your thoughts for today...
                    </label>

                    {/* Mood Selector */}
                    <div className="mood-selector-mini">
                        <span>How are you feeling?</span>
                        <div className="mood-buttons">
                            {MOODS.map(mood => (
                                <button
                                    key={mood.value}
                                    className={`mood-btn-mini ${selectedMood === mood.value ? 'selected' : ''}`}
                                    onClick={() => setSelectedMood(mood.value)}
                                    title={['Terrible', 'Bad', 'Okay', 'Good', 'Great'][mood.value - 1]}
                                >
                                    {mood.emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <textarea
                        className="journal-textarea"
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="What's on your mind? What are you grateful for today?"
                    />

                    <div className="journal-actions">
                        <button
                            className="save-btn"
                            onClick={handleSave}
                            disabled={!entry.trim()}
                        >
                            <Save size={18} />
                            Save Entry (+30 XP)
                        </button>
                    </div>
                </div>

                <div className="journal-history">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={18} />
                        Past Entries ({journalEntries.length})
                    </h4>

                    {journalEntries.length === 0 ? (
                        <div className="empty-state">
                            No journal entries yet. Start writing today!
                        </div>
                    ) : (
                        journalEntries.map((item) => (
                            <div key={item.id} className="journal-entry-card">
                                <div className="entry-header">
                                    <span className="entry-date">
                                        {item.mood && <span className="entry-mood">{getMoodEmoji(item.mood)}</span>}
                                        {formatDate(item.date)}
                                    </span>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteClick(item.id)}
                                        title="Delete Entry"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="entry-content">
                                    {item.content}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="delete-confirm-overlay" onClick={handleCancelDelete}>
                    <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-confirm-icon">
                            <AlertTriangle size={32} />
                        </div>
                        <h4>Delete Journal Entry?</h4>
                        <p>This action cannot be undone. Your thoughts are valuable!</p>
                        <div className="delete-confirm-buttons">
                            <button className="cancel-delete-btn" onClick={handleCancelDelete}>
                                <X size={16} />
                                Keep It
                            </button>
                            <button className="confirm-delete-btn" onClick={handleConfirmDelete}>
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
