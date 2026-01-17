import React from 'react';
import { Trophy, Star, Sparkles, X } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';
import confetti from 'canvas-confetti';
import './LevelUpModal.css';

export default function LevelUpModal() {
    const { levelUpData, clearLevelUp } = useGamification();

    if (!levelUpData) return null;

    // Trigger confetti on render
    React.useEffect(() => {
        const duration = 3000;
        const end = Date.now() + duration;

        const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981'];

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }, []);

    return (
        <div className="level-up-overlay" onClick={clearLevelUp}>
            <div className="level-up-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={clearLevelUp}>
                    <X size={20} />
                </button>

                <div className="modal-content">
                    <div className="celebration-icon">
                        <div className="icon-ring pulse-glow"></div>
                        <Trophy size={48} />
                        <Sparkles size={20} className="sparkle s1" />
                        <Sparkles size={16} className="sparkle s2" />
                        <Star size={14} className="sparkle s3" />
                    </div>

                    <h2 className="text-gradient-aurora">Level Up!</h2>

                    <div className="level-display">
                        <span className="level-number">{levelUpData.newLevel}</span>
                    </div>

                    <p className="new-title">{levelUpData.newTitle}</p>
                    <p className="congrats-text">
                        Congratulations! You've reached a new milestone in your journey.
                    </p>

                    <button className="continue-btn btn-glow" onClick={clearLevelUp}>
                        <span>Continue</span>
                        <Sparkles size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
