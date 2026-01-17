'use client';

import React, { useState } from 'react';
import { X, Trophy, AlertTriangle, Swords, User, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FightNightModal({ isOpen, onClose, userStreak = 5 }) {
    const [step, setStep] = useState('lobby'); // lobby, searching, match, battle
    const [opponent, setOpponent] = useState(null);

    const MOCK_OPPONENTS = [
        { name: "S. Chaos", streak: 7, title: "Space Monkey" },
        { name: "Durden_X", streak: 12, title: "Project Manager" },
        { name: "Marla_S", streak: 4, title: "Tourist" },
        { name: "Angel_Face", streak: 9, title: "Beautiful" }
    ];

    const findMatch = () => {
        setStep('searching');
        setTimeout(() => {
            const randomOp = MOCK_OPPONENTS[Math.floor(Math.random() * MOCK_OPPONENTS.length)];
            setOpponent(randomOp);
            setStep('match');
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fight-night-overlay" style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(5px)'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                        width: '90%', maxWidth: '600px',
                        background: '#0a0a0a',
                        border: '2px solid var(--primary)',
                        padding: '2rem',
                        position: 'relative',
                        boxShadow: '0 0 50px rgba(220, 20, 60, 0.2)'
                    }}
                >
                    <button onClick={onClose} style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'none', border: 'none', color: '#666', cursor: 'pointer'
                    }}><X size={24} /></button>

                    {/* HEADER */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '3rem',
                            color: 'var(--primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '4px',
                            textShadow: '4px 4px 0 #000'
                        }}>Fight Night</h2>
                        <p style={{ color: '#666', fontFamily: 'var(--font-mono)' }}>
                            Wager your streak. Prove your worth.
                        </p>
                    </div>

                    {/* CONTENT */}
                    <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                        {step === 'lobby' && (
                            <div style={{ textAlign: 'center', width: '100%' }}>
                                <div style={{
                                    padding: '2rem',
                                    border: '1px dashed #333',
                                    marginBottom: '2rem',
                                    background: 'rgba(255,255,255,0.02)'
                                }}>
                                    <div style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#ccc' }}>Your Wager</div>
                                    <div style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '4rem',
                                        color: 'var(--text-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem'
                                    }}>
                                        <Trophy size={48} color="gold" />
                                        {userStreak} DAYS
                                    </div>
                                    <p style={{ color: 'var(--primary)', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <AlertTriangle size={16} /> If you relapse, you lose it all.
                                    </p>
                                </div>
                                <button onClick={findMatch} style={{
                                    background: 'var(--primary)', color: 'white',
                                    border: 'none', padding: '1rem 3rem',
                                    fontSize: '1.5rem', fontFamily: 'var(--font-display)',
                                    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px'
                                }}>
                                    Find Opponent
                                </button>
                            </div>
                        )}

                        {step === 'searching' && (
                            <div style={{ textAlign: 'center' }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    style={{ marginBottom: '2rem' }}
                                >
                                    <Skull size={64} color="#666" />
                                </motion.div>
                                <h3 style={{ fontFamily: 'var(--font-typewriter)', color: '#ccc' }}>
                                    Scanning underground...
                                </h3>
                            </div>
                        )}

                        {step === 'match' && opponent && (
                            <div style={{ width: '100%' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '2rem'
                                }}>
                                    {/* YOU */}
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: '80px', height: '80px', background: '#333',
                                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 1rem', border: '2px solid gold'
                                        }}>
                                            <User size={40} />
                                        </div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>YOU</div>
                                        <div style={{ color: 'gold' }}>{userStreak} Days</div>
                                    </div>

                                    <div style={{
                                        fontSize: '3rem', fontFamily: 'var(--font-display)',
                                        color: 'var(--primary)', fontStyle: 'italic'
                                    }}>VS</div>

                                    {/* THEM */}
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: '80px', height: '80px', background: '#333',
                                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 1rem', border: '2px solid #666'
                                        }}>
                                            <Skull size={40} />
                                        </div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>{opponent.name}</div>
                                        <div style={{ color: '#ccc' }}>{opponent.streak} Days</div>
                                    </div>
                                </div>

                                <button onClick={() => alert("Fight Accepted! Check back in 24h.")} style={{
                                    width: '100%',
                                    background: 'var(--primary)', color: 'white',
                                    border: 'none', padding: '1.5rem',
                                    fontSize: '1.5rem', fontFamily: 'var(--font-display)',
                                    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '2px',
                                    position: 'relative', overflow: 'hidden'
                                }}>
                                    ACCEPT FIGHT
                                </button>
                                <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666', fontSize: '0.8rem' }}>
                                    "I want you to hit me as hard as you can."
                                </p>
                            </div>
                        )}

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
