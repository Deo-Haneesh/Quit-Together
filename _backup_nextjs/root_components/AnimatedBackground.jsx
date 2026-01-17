'use client';

import React from 'react';
import './AnimatedBackground.css';

export default function AnimatedBackground() {
    return (
        <div className="animated-bg">
            {/* SVG Filter for Gooey Effect */}
            <svg className="svg-filters">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                            result="goo"
                        />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>

            <div className="aurora-container">
                {/* Main Aurora Blobs */}
                <div className="aurora-blob blob-1"></div>
                <div className="aurora-blob blob-2"></div>
                <div className="aurora-blob blob-3"></div>
                <div className="aurora-blob blob-4"></div>
                <div className="aurora-blob blob-5"></div>

                {/* Accent Orbs */}
                <div className="accent-orb orb-1"></div>
                <div className="accent-orb orb-2"></div>
                <div className="accent-orb orb-3"></div>
            </div>

            {/* Gradient Overlay */}
            <div className="gradient-overlay"></div>
        </div>
    );
}
