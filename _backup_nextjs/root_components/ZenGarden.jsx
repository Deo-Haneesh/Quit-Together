'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Palette, RotateCcw, Trash2 } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';
import './ZenGarden.css';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function ZenGarden() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lines, setLines] = useState([]);
    const [currentLine, setCurrentLine] = useState([]);
    const [color, setColor] = useState(COLORS[0]);
    const { addXp } = useGamification();
    const xpAwardedRef = useRef(false);

    const getPosition = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const handleStart = useCallback((e) => {
        e.preventDefault();
        setIsDrawing(true);
        const pos = getPosition(e);
        setCurrentLine([pos]);
    }, []);

    const handleMove = useCallback((e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPosition(e);
        setCurrentLine(prev => [...prev, pos]);
    }, [isDrawing]);

    const handleEnd = useCallback(() => {
        if (currentLine.length > 1) {
            setLines(prev => [...prev, { points: currentLine, color }]);

            // Award XP after first pattern
            if (!xpAwardedRef.current && lines.length >= 2) {
                xpAwardedRef.current = true;
                addXp(15, "Zen Garden Pattern 🎨");
            }
        }
        setCurrentLine([]);
        setIsDrawing(false);
    }, [currentLine, color, lines.length, addXp]);

    const clearCanvas = () => {
        setLines([]);
        setCurrentLine([]);
        xpAwardedRef.current = false;
    };

    const getPath = (points) => {
        if (points.length < 2) return '';

        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            const p1 = points[i - 1];
            const p2 = points[i];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            path += ` Q ${p1.x} ${p1.y}, ${midX} ${midY}`;
        }

        return path;
    };

    return (
        <motion.div
            className="zen-garden card-3d"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="game-header">
                <motion.div
                    className="game-icon"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                >
                    <Palette size={18} />
                </motion.div>
                <div className="game-title">
                    <h4>Zen Garden</h4>
                    <p>Draw calming patterns</p>
                </div>
                <motion.button
                    className="clear-btn"
                    onClick={clearCanvas}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Clear"
                >
                    <Trash2 size={14} />
                </motion.button>
            </div>

            {/* Color picker */}
            <div className="color-picker">
                {COLORS.map((c) => (
                    <motion.button
                        key={c}
                        className={`color-btn ${color === c ? 'active' : ''}`}
                        style={{ background: c }}
                        onClick={() => setColor(c)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                    />
                ))}
            </div>

            {/* Canvas */}
            <div
                className="canvas-container"
                ref={canvasRef}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            >
                <svg className="drawing-svg" viewBox="0 0 300 200">
                    {/* Sand texture background */}
                    <defs>
                        <pattern id="sand" width="4" height="4" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="0.5" fill="currentColor" opacity="0.1" />
                            <circle cx="3" cy="3" r="0.5" fill="currentColor" opacity="0.1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#sand)" />

                    {/* Drawn lines */}
                    {lines.map((line, i) => (
                        <motion.path
                            key={i}
                            d={getPath(line.points)}
                            fill="none"
                            stroke={line.color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.8 }}
                            transition={{ duration: 0.5 }}
                        />
                    ))}

                    {/* Current drawing */}
                    {currentLine.length > 1 && (
                        <path
                            d={getPath(currentLine)}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.8"
                        />
                    )}
                </svg>

                {lines.length === 0 && !isDrawing && (
                    <div className="hint-overlay">
                        <span>Draw to create patterns</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
