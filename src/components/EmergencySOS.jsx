import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, X, Wind, Radio, Loader2, ShieldCheck, Volume2, PhoneCall, ChevronLeft, StopCircle, Phone } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';
import BreathingExercise from './BreathingExercise';
import './EmergencySOS.css';

export default function EmergencySOS() {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, searching, connected
    const [activeTool, setActiveTool] = useState(null); // 'breathing', 'audio'
    const audioRef = useRef(new Audio('/forestambience.mp3'));
    const { addXp } = useGamification();

    useEffect(() => {
        if (isOpen && status === 'idle') {
            setStatus('searching');
            const timer = setTimeout(() => {
                setStatus('connected');
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsOpen(false);
        setStatus('idle');
        setActiveTool(null);
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    };

    const toggleAudio = () => {
        if (activeTool === 'audio') {
            audioRef.current.pause();
            setActiveTool(null);
        } else {
            audioRef.current.loop = true;
            audioRef.current.play().catch(e => console.log("Audio play failed", e));
            setActiveTool('audio');
        }
    };

    const handleFeelingBetter = () => {
        addXp(50, "Crisis De-escalated");
        handleClose();
    };

    const resources = [
        {
            id: '988',
            name: 'Suicide & Crisis Lifeline',
            sub: '24/7 • Confidential',
            action: 'Call 988',
            href: 'tel:988',
            icon: PhoneCall
        },
        {
            id: 'text',
            name: 'Crisis Text Line',
            sub: 'Text HELLO to 741741',
            action: 'Text Now',
            href: 'sms:741741?body=HELLO',
            icon: Radio
        }
    ];

    return (
        <>
            <button className="sos-button" onClick={() => setIsOpen(true)} title="Emergency">
                <AlertCircle size={32} />
            </button>

            {isOpen && (
                <div className="sos-modal">
                    <div className="sos-content">
                        {status === 'searching' ? (
                            <div className="connecting-screen">
                                <div className="radar-spinner">
                                    <Radio size={48} />
                                </div>
                                <div className="connecting-text">
                                    <h3>Connecting...</h3>
                                    <p>Locating nearest available support nodes.</p>
                                    <p style={{ marginTop: '10px', color: '#ef4444', fontWeight: 'bold' }}>Stay on the line.</p>
                                </div>
                                <button className="cancel-search-btn" onClick={handleClose}>
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="sos-header">
                                    <div className="header-left">
                                        <div className="status-indicator">
                                            <span className="status-dot"></span>
                                            SECURE CONNECTION
                                        </div>
                                        <div className="sos-title">
                                            <h2>Crisis Command</h2>
                                        </div>
                                    </div>
                                    <button className="sos-return-btn" onClick={handleClose} title="Close / Back">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="sos-body">
                                    <div className="section-title">
                                        <Phone size={14} /> Immediate Support
                                    </div>

                                    <div className="resource-grid">
                                        {resources.map(res => (
                                            <a key={res.id} href={res.href} className="resource-card" style={{ textDecoration: 'none' }}>
                                                <div className="resource-info">
                                                    <h4>{res.name}</h4>
                                                    <p>{res.sub}</p>
                                                </div>
                                                <div className="resource-action">
                                                    <res.icon size={18} />
                                                    {res.action}
                                                </div>
                                            </a>
                                        ))}
                                    </div>

                                    <div className="section-title">
                                        <ShieldCheck size={14} /> Stabilization Tools
                                    </div>

                                    <div className="tools-grid">
                                        <button
                                            className={`tool-btn ${activeTool === 'breathing' ? 'active' : ''}`}
                                            onClick={() => setActiveTool(activeTool === 'breathing' ? null : 'breathing')}
                                        >
                                            <Wind size={28} />
                                            <span>Box Breathing</span>
                                        </button>
                                        <button
                                            className={`tool-btn ${activeTool === 'audio' ? 'active' : ''}`}
                                            onClick={toggleAudio}
                                        >
                                            {activeTool === 'audio' ? <Loader2 size={28} className="animate-spin" /> : <Volume2 size={28} />}
                                            <span>Audio Grounding</span>
                                        </button>
                                    </div>

                                    {activeTool === 'breathing' && (
                                        <div className="embedded-breathing">
                                            <BreathingExercise />
                                        </div>
                                    )}

                                    <button className="close-sos-btn" onClick={handleFeelingBetter}>
                                        <ChevronLeft size={20} />
                                        Return to Safety (+50 XP)
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
