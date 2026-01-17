'use client';

import { useEffect, useRef } from 'react';
import './CursorGlow.css';

export default function CursorGlow() {
    const glowRef = useRef(null);
    const secondaryRef = useRef(null);
    const ringRef = useRef(null);
    const rafRef = useRef();

    // Use refs for position to avoid React re-renders
    const targetPos = useRef({ x: -100, y: -100 });
    const currentPos = useRef({ x: -100, y: -100 });
    const isHovering = useRef(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            targetPos.current.x = e.clientX;
            targetPos.current.y = e.clientY;

            // Check if hovering over interactive elements
            const target = e.target;
            const interactive = target.closest('button, a, input, textarea, [role="button"]');

            if (interactive && !isHovering.current) {
                isHovering.current = true;
                glowRef.current?.classList.add('hovering');
            } else if (!interactive && isHovering.current) {
                isHovering.current = false;
                glowRef.current?.classList.remove('hovering');
            }
        };

        const handleMouseDown = (e) => {
            // Position ring at click location using left/top (not transform)
            if (ringRef.current) {
                ringRef.current.style.left = `${e.clientX - 24}px`;
                ringRef.current.style.top = `${e.clientY - 24}px`;
                // Remove and re-add class to restart animation
                ringRef.current.classList.remove('active');
                // Force reflow to restart animation
                void ringRef.current.offsetWidth;
                ringRef.current.classList.add('active');
            }
            glowRef.current?.classList.add('clicking');
        };

        const handleMouseUp = () => {
            glowRef.current?.classList.remove('clicking');
        };

        const handleMouseLeave = () => {
            targetPos.current = { x: -100, y: -100 };
        };

        // Smooth animation loop for glow effect only
        const animate = () => {
            const ease = 0.12;
            currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
            currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

            const x = currentPos.current.x;
            const y = currentPos.current.y;

            // Only animate the glow effects
            if (glowRef.current) {
                glowRef.current.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
            }
            if (secondaryRef.current) {
                secondaryRef.current.style.transform = `translate(${x - 75}px, ${y - 75}px)`;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <>
            {/* Main glow */}
            <div
                ref={glowRef}
                className="cursor-glow"
            />

            {/* Secondary glow trail */}
            <div
                ref={secondaryRef}
                className="cursor-glow-secondary"
            />

            {/* Click ring - only visible on click */}
            <div
                ref={ringRef}
                className="cursor-ring"
            />
        </>
    );
}
