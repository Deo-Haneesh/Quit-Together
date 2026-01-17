import React, { useState, useRef, useEffect } from 'react';
import { CloudRain, Wind, Waves, Coffee, Volume2, VolumeX, Play, Lock, Timer } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';
import './Soundscapes.css';

const SOUNDS = [
    {
        id: 'rain',
        name: 'Soft Rain',
        description: 'Gentle raindrops falling on leaves',
        icon: CloudRain,
        url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
        minLevel: 1
    },
    {
        id: 'forest',
        name: 'Forest Breeze',
        description: 'Wind rustling through the trees',
        icon: Wind,
        url: '/forestambience.mp3',
        minLevel: 1
    },
    {
        id: 'ocean',
        name: 'Ocean Waves',
        description: 'Rhythmic waves hitting the shore',
        icon: Waves,
        url: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3',
        minLevel: 2 // Locked until Level 2
    },
    {
        id: 'cafe',
        name: 'Ambient Cafe',
        description: 'Quiet background chatter and clinking',
        icon: Coffee,
        url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
        minLevel: 3 // Locked until Level 3
    }
];

export default function Soundscapes() {
    const { gameState, addXp } = useGamification();
    const [activeSound, setActiveSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [sessionTime, setSessionTime] = useState(0); // in seconds
    const audioRef = useRef(new Audio());
    const timerRef = useRef(null);

    // Timer Logic
    const stopTimer = React.useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = React.useCallback(() => {
        if (timerRef.current) return;
        timerRef.current = setInterval(() => {
            setSessionTime(prev => {
                const newTime = prev + 1;
                // Every 5 minutes (300 seconds), award 10 XP
                if (newTime % 300 === 0) {
                    addXp(10, "Deep Focus Session");
                }
                return newTime;
            });
        }, 1000);
    }, [addXp]);

    useEffect(() => {
        const audio = audioRef.current;
        audio.loop = true;

        return () => {
            audio.pause();
            audio.src = '';
            stopTimer();
        };
    }, [stopTimer]);

    useEffect(() => {
        const audio = audioRef.current;
        audio.volume = volume;
    }, [volume]);

    const toggleSound = (sound) => {
        if (sound.minLevel > gameState.level) return; // Locked

        const audio = audioRef.current;

        if (activeSound?.id === sound.id) {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
                stopTimer();
            } else {
                audio.play();
                setIsPlaying(true);
                startTimer();
            }
        } else {
            audio.src = sound.url;
            audio.play();
            setActiveSound(sound);
            setIsPlaying(true);
            setSessionTime(0); // Reset timer for new session
            stopTimer(); // Ensure old timer is cleared
            startTimer();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="glass-panel">
            <div className="section-header">
                <div>
                    <h3>🎧 Audio Sanctuary</h3>
                    <span className="subtitle">Immersive soundscapes for focus and relaxation</span>
                </div>
                {isPlaying && (
                    <div className="active-timer pulse-animation">
                        <Timer size={16} />
                        <span>{formatTime(sessionTime)}</span>
                        <span className="xp-hint">(+10 XP / 5m)</span>
                    </div>
                )}
            </div>

            <div className="volume-control">
                {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="volume-slider"
                />
            </div>

            <div className="soundscapes-container">
                {SOUNDS.map((sound) => {
                    const isActive = activeSound?.id === sound.id;
                    const isLocked = sound.minLevel > gameState.level;
                    const Icon = sound.icon;

                    return (
                        <div
                            key={sound.id}
                            className={`sound-card ${isActive && isPlaying ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                            onClick={() => toggleSound(sound)}
                        >
                            <div className="sound-icon-wrapper">
                                {isLocked ? <Lock size={24} /> : <Icon size={32} />}
                            </div>

                            <div className="sound-info">
                                <h3>{sound.name}</h3>
                                <p>{isLocked ? `Unlock at Level ${sound.minLevel}` : sound.description}</p>
                            </div>

                            {isActive && isPlaying ? (
                                <div className="playing-indicator">
                                    <div className="bar"></div>
                                    <div className="bar"></div>
                                    <div className="bar"></div>
                                </div>
                            ) : (
                                <div style={{ height: '20px', marginTop: '1rem' }}>
                                    {!isLocked && (isActive ? <Play size={20} /> : null)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
