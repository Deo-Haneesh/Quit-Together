import React, { useState, useEffect } from 'react';
import { Flame, Trash2, Clock, AlertTriangle } from 'lucide-react';

export default function BurnBook() {
    const [entry, setEntry] = useState('');
    const [savedEntries, setSavedEntries] = useState(() => {
        const saved = localStorage.getItem('burn_book_entries');
        return saved ? JSON.parse(saved) : [];
    });
    const [burningId, setBurningId] = useState(null);

    // Auto-delete entries older than 24h
    useEffect(() => {
        const cleanUp = () => {
            const now = Date.now();
            const valid = savedEntries.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000);
            if (valid.length !== savedEntries.length) {
                setSavedEntries(valid);
                localStorage.setItem('burn_book_entries', JSON.stringify(valid));
            }
        };
        cleanUp();
        const interval = setInterval(cleanUp, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [savedEntries]);

    const handleBurn = () => {
        if (!entry.trim()) return;

        const newEntry = {
            id: Date.now(),
            text: entry,
            timestamp: Date.now()
        };

        const updated = [newEntry, ...savedEntries];
        setSavedEntries(updated);
        localStorage.setItem('burn_book_entries', JSON.stringify(updated));
        setEntry('');
    };

    const handleDelete = (id) => {
        setBurningId(id); // Trigger animation (conceptually)
        setTimeout(() => {
            const updated = savedEntries.filter(e => e.id !== id);
            setSavedEntries(updated);
            localStorage.setItem('burn_book_entries', JSON.stringify(updated));
            setBurningId(null);
        }, 800); // Wait for animation
    };

    const getTimeLeft = (timestamp) => {
        const now = Date.now();
        const expires = timestamp + (24 * 60 * 60 * 1000);
        const diff = expires - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="burn-book-container" style={{ padding: 'var(--space-md)' }}>
            <div className="burn-header" style={{
                marginBottom: 'var(--space-xl)',
                textAlign: 'center',
                borderBottom: '2px solid var(--primary)',
                paddingBottom: 'var(--space-md)'
            }}>
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--primary)',
                    fontSize: '2.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                }}>The Burn Book</h2>
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    "It's only after we've lost everything that we're free to do anything." <br />
                    Entries self-destruct in 24 hours. Let it go.
                </p>
            </div>

            <div className="burn-input-area" style={{ marginBottom: 'var(--space-2xl)' }}>
                <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="Write what hurts. Write your cravings. Write your hate. Then burn it."
                    style={{
                        width: '100%',
                        minHeight: '150px',
                        background: '#1a1a1a',
                        border: '1px solid var(--text-muted)',
                        color: 'var(--text-primary)',
                        padding: 'var(--space-md)',
                        fontFamily: 'var(--font-typewriter)',
                        fontSize: '1.1rem',
                        resize: 'vertical',
                        marginBottom: 'var(--space-md)'
                    }}
                />
                <button
                    onClick={handleBurn}
                    className="burn-btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '12px',
                        background: 'var(--primary-dark)',
                        color: 'white',
                        border: 'none',
                        fontSize: '1.2rem',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textTransform: 'uppercase'
                    }}
                >
                    <Flame size={24} /> IGNITE ENTRY
                </button>
            </div>

            <div className="burned-entries">
                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text-muted)',
                    marginBottom: 'var(--space-lg)',
                    fontSize: '1.5rem',
                    borderBottom: '1px dashed var(--text-muted)',
                    display: 'inline-block'
                }}>Ashes ({savedEntries.length})</h3>

                <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                    {savedEntries.map(e => (
                        <div key={e.id} style={{
                            position: 'relative',
                            padding: 'var(--space-lg)',
                            background: '#000',
                            border: '1px solid #333',
                            borderLeft: '4px solid var(--primary)',
                            transition: 'opacity 0.8s ease',
                            opacity: burningId === e.id ? 0 : 1,
                            transform: burningId === e.id ? 'scale(0.9)' : 'scale(1)'
                        }}>
                            <p style={{
                                fontFamily: 'var(--font-typewriter)',
                                color: '#ccc',
                                whiteSpace: 'pre-wrap',
                                marginBottom: 'var(--space-md)'
                            }}>{e.text}</p>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={14} /> Vanishes in {getTimeLeft(e.timestamp)}
                                </span>
                                <button
                                    onClick={() => handleDelete(e.id)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Trash2 size={14} /> Force Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {savedEntries.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', border: '1px dashed #333' }}>
                            <p>No ashes yet. The fire is waiting.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
