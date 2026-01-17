import React, { useState, useEffect } from 'react';
import tylerImg from '../assets/tyler-flash.jpg';

export default function TylerFlash() {
    const [isVisible, setIsVisible] = useState(false);
    const [style, setStyle] = useState({});

    useEffect(() => {
        let timeoutId;

        const triggerFlash = () => {
            // Randomize position and style
            const randomTop = Math.floor(Math.random() * 80) + 10;
            const randomLeft = Math.floor(Math.random() * 80) + 10;

            const randomRotate = Math.floor(Math.random() * 60) - 30;
            const randomRotateX = Math.floor(Math.random() * 40) - 20;
            const randomRotateY = Math.floor(Math.random() * 40) - 20;
            const randomScale = 0.5 + Math.random() * 0.8;

            setStyle({
                top: `${randomTop}%`,
                left: `${randomLeft}%`,
                transform: `translate(-50%, -50%) rotate(${randomRotate}deg) rotateX(${randomRotateX}deg) rotateY(${randomRotateY}deg) scale(${randomScale})`,
                perspective: '1000px',
                position: 'fixed',
                zIndex: 9999,
                pointerEvents: 'none',
                mixBlendMode: 'difference', // Negative effect
                filter: 'invert(1) contrast(2) hue-rotate(180deg)',
                opacity: 0.8,
                width: '300px', // Base size
                height: 'auto',
                boxShadow: '0 0 50px rgba(255,0,0,0.5)'
            });

            setIsVisible(true);

            // Subliminal duration (fast)
            setTimeout(() => {
                setIsVisible(false);

                // Schedule next flash (more frequent: 5s to 15s)
                const nextInterval = Math.random() * 10000 + 5000;
                timeoutId = setTimeout(triggerFlash, nextInterval);
            }, 250); // Increased duration to 250ms (quarter second)
        };

        // Start first flash after a delay
        const initialDelay = Math.random() * 5000 + 2000;
        timeoutId = setTimeout(triggerFlash, initialDelay);

        return () => clearTimeout(timeoutId);
    }, []);

    if (!isVisible) return null;

    return (
        <img
            src={tylerImg}
            alt="Tyler"
            style={style}
        />
    );
}
