'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Phone, X, Heart, Wind, Copy, Check, MessageSquare } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';
import './EmergencySOS.css';

export default function EmergencySOS() {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedNumber, setCopiedNumber] = useState(null);
    const [showBreathingHelper, setShowBreathingHelper] = useState(false);
    const [breathPhase, setBreathPhase] = useState('inhale');
    const [breathCount, setBreathCount] = useState(4);
    const [sosUsageCount, setSosUsageCount] = useState(() => {
        return parseInt(localStorage.getItem('sos_usage_count') || '0');
    });
    const { addXp } = useGamification();

    // Quick breathing exercise
    useEffect(() => {
        let timer;
        if (showBreathingHelper) {
            timer = setInterval(() => {
                setBreathCount(prev => {
                    if (prev <= 1) {
                        setBreathPhase(p => p === 'inhale' ? 'exhale' : 'inhale');
                        return 4;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showBreathingHelper]);

    const handleOpen = () => {
        setIsOpen(true);
        const newCount = sosUsageCount + 1;
        setSosUsageCount(newCount);
        localStorage.setItem('sos_usage_count', newCount.toString());
    };

    const handleFeelingBetter = () => {
        addXp(20, "Crisis Managed 💪");
        setIsOpen(false);
        setShowBreathingHelper(false);
    };

    const copyToClipboard = (number, id) => {
        navigator.clipboard.writeText(number);
        setCopiedNumber(id);
        setTimeout(() => setCopiedNumber(null), 2000);
    };

    const hotlines = [
        {
            id: 'crisis',
            name: '988 Suicide & Crisis Lifeline',
            description: '24/7, free, confidential support',
            number: '988',
            tel: 'tel:988'
        },
        {
            id: 'samhsa',
            name: 'SAMHSA Helpline',
            description: 'Substance abuse & mental health',
            number: '1-800-662-4357',
            tel: 'tel:1-800-662-4357'
        },
        {
            id: 'text',
            name: 'Crisis Text Line',
            description: 'Text support available 24/7',
            number: 'Text "HELLO" to 741741',
            sms: 'sms:741741?body=HELLO'
        }
    ];

    return (
        <>
            <button className="sos-button" onClick={handleOpen} title="Emergency Resources">
                <AlertCircle size={32} />
            </button>

            {isOpen && (
                <div className="sos-modal" onClick={() => setIsOpen(false)}>
                    <div className="sos-content" onClick={(e) => e.stopPropagation()}>
                        <div className="sos-header">
                            <h2>🆘 Crisis Resources</h2>
                            <p>You're not alone. Help is available right now.</p>
                            <button className="sos-close-x" onClick={() => setIsOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="sos-body">
                            {/* Quick Breathing Helper */}
                            {showBreathingHelper && (
                                <div className="quick-breathing-box">
                                    <div className={`quick-breath-circle ${breathPhase}`}>
                                        <span className="breath-text">{breathPhase === 'inhale' ? 'Breathe In' : 'Breathe Out'}</span>
                                        <span className="breath-count">{breathCount}</span>
                                    </div>
                                    <button className="stop-breathing-btn" onClick={() => setShowBreathingHelper(false)}>
                                        Stop
                                    </button>
                                </div>
                            )}

                            <div className="resource-section">
                                <h3>📞 Immediate Help - Tap to Call</h3>

                                {hotlines.map(hotline => (
                                    <div key={hotline.id} className="hotline">
                                        <div className="hotline-info">
                                            <h4>{hotline.name}</h4>
                                            <p>{hotline.description}</p>
                                        </div>
                                        <div className="hotline-actions">
                                            {hotline.tel ? (
                                                <a href={hotline.tel} className="call-btn">
                                                    <Phone size={16} />
                                                    Call
                                                </a>
                                            ) : (
                                                <a href={hotline.sms} className="call-btn text-btn">
                                                    <MessageSquare size={16} />
                                                    Text
                                                </a>
                                            )}
                                            <button
                                                className="copy-btn"
                                                onClick={() => copyToClipboard(hotline.number, hotline.id)}
                                            >
                                                {copiedNumber === hotline.id ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="resource-section">
                                <h3>🧘 Quick Calm Tools</h3>

                                <div className="quick-tools">
                                    <button
                                        className="quick-tool-btn"
                                        onClick={() => setShowBreathingHelper(!showBreathingHelper)}
                                    >
                                        <Wind size={20} />
                                        <span>Quick Breathing</span>
                                    </button>
                                </div>

                                <div className="grounding-exercise">
                                    <h4>5-4-3-2-1 Method</h4>
                                    <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                        Use your senses to ground yourself in the present moment:
                                    </p>
                                    <ol>
                                        <li><strong>5 things</strong> you can see around you</li>
                                        <li><strong>4 things</strong> you can touch</li>
                                        <li><strong>3 things</strong> you can hear</li>
                                        <li><strong>2 things</strong> you can smell</li>
                                        <li><strong>1 thing</strong> you can taste</li>
                                    </ol>
                                </div>
                            </div>

                            <button className="close-sos" onClick={handleFeelingBetter}>
                                <Heart size={18} />
                                I'm feeling better (+20 XP)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
