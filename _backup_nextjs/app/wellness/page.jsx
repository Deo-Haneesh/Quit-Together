'use client';

import { Wind, Brain, ListTodo, Music, Sparkles } from 'lucide-react';
import Link from 'next/link';
import BreathingExercise from '@/components/BreathingExercise';
import '@/pages/Wellness.css';

const TOOLS = [
    {
        id: 1,
        name: "Soundscapes",
        description: "Calming audio environments",
        icon: <Music size={24} />,
        color: "#3b82f6",
        link: "/soundscapes"
    },
    {
        id: 2,
        name: "Bubble Pop",
        description: "Stress-relief game",
        icon: <Sparkles size={24} />,
        color: "#a855f7",
        link: "/wellness"
    },
];

const GROUNDING_STEPS = [
    { count: 5, sense: "things you can SEE", emoji: "👀" },
    { count: 4, sense: "things you can TOUCH", emoji: "✋" },
    { count: 3, sense: "things you can HEAR", emoji: "👂" },
    { count: 2, sense: "things you can SMELL", emoji: "👃" },
    { count: 1, sense: "thing you can TASTE", emoji: "👅" },
];

export default function Wellness() {
    return (
        <div className="wellness-page">
            <header className="page-header">
                <h2>Wellness Hub</h2>
                <p className="page-subtitle">Tools to support your mental and physical wellbeing.</p>
            </header>

            {/* Featured: Breathing */}
            <section className="wellness-section">
                <h3 className="section-title"><Wind size={20} /> Breathing Exercise</h3>
                <BreathingExercise />
            </section>

            {/* Grounding Technique */}
            <section className="wellness-section glass-panel grounding-section">
                <h3 className="section-title"><Brain size={20} /> 5-4-3-2-1 Grounding</h3>
                <p className="section-description">When anxiety hits, use your senses to ground yourself in the present moment.</p>
                <div className="grounding-steps">
                    {GROUNDING_STEPS.map((step, idx) => (
                        <div key={idx} className="grounding-step">
                            <span className="step-emoji">{step.emoji}</span>
                            <span className="step-count">{step.count}</span>
                            <span className="step-sense">{step.sense}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Access Tools */}
            <section className="wellness-section">
                <h3 className="section-title"><ListTodo size={20} /> More Tools</h3>
                <div className="tools-grid">
                    {TOOLS.map(tool => (
                        <Link href={tool.link} key={tool.id} className="tool-card glass-panel">
                            <div className="tool-icon" style={{ background: tool.color }}>
                                {tool.icon}
                            </div>
                            <div className="tool-info">
                                <h4>{tool.name}</h4>
                                <p>{tool.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
