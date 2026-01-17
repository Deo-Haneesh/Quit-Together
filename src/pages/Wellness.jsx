import React from 'react';
import { Wind, Brain, ListTodo, Music, Sparkles, Activity, Eye, Hand, Ear, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BreathingExercise from '../components/BreathingExercise';
import { FadeIn, StaggerContainer, StaggerItem, TiltCard, HoverScale } from '../components/Animations';
import './Wellness.css';

const TOOLS = [
    {
        id: 1,
        name: "Soundscapes",
        description: "Immersive audio environments for focus and calm.",
        icon: <Music size={28} />,
        color: "var(--primary)",
        link: "/soundscapes",
        btnText: "Listen Now"
    },
    {
        id: 2,
        name: "Bubble Pop",
        description: "Interactive stress-relief simulation.",
        icon: <Sparkles size={28} />,
        color: "var(--accent)",
        link: "/wellness",
        btnText: "Play Now"
    },
];

const GROUNDING_STEPS = [
    { count: 5, sense: "SEE", detail: "Describe 5 things you can see.", icon: <Eye size={20} />, color: "#60A5FA" },
    { count: 4, sense: "TOUCH", detail: "Feel 4 textures around you.", icon: <Hand size={20} />, color: "#34D399" },
    { count: 3, sense: "HEAR", detail: "Listen for 3 distinct sounds.", icon: <Ear size={20} />, color: "#A78BFA" },
    { count: 2, sense: "SMELL", detail: "Identify 2 scents present.", icon: <Wind size={20} />, color: "#F472B6" },
    { count: 1, sense: "TASTE", detail: "Notice 1 thing you can taste.", icon: <Zap size={20} />, color: "#FBBF24" },
];

export default function Wellness() {
    return (
        <div className="wellness-page">
            <FadeIn direction="down">
                <header className="page-header center-text">
                    <motion.div
                        className="header-icon-wrapper"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    >
                        <Activity size={48} className="text-primary" />
                    </motion.div>
                    <h2 className="glitch-text" data-text="WELLNESS_HUB">WELLNESS_HUB</h2>
                    <p className="page-subtitle typing-effect">Calibrate your mind. Regulate your system.</p>
                </header>
            </FadeIn>

            {/* Featured: Breathing */}
            <FadeIn delay={0.2}>
                <section className="wellness-section breathing-section">
                    <div className="section-header">
                        <Wind className="section-icon spin-slow" />
                        <h3>RESPIRATORY_CONTROL</h3>
                    </div>
                    <BreathingExercise />
                </section>
            </FadeIn>

            {/* Grounding Technique */}
            <section className="wellness-section">
                <div className="section-header">
                    <Brain className="section-icon pulse-slow" />
                    <h3>SENSORY_GROUNDING_PROTOCOL</h3>
                </div>
                <p className="section-description">
                    <span className="terminal-prefix">&gt;</span> Initiate 5-4-3-2-1 calming sequence when anxiety levels spike.
                </p>

                <StaggerContainer className="grounding-grid">
                    {GROUNDING_STEPS.map((step, idx) => (
                        <StaggerItem key={idx}>
                            <motion.div
                                className="grounding-card glass-panel"
                                whileHover={{ y: -5, borderColor: step.color }}
                            >
                                <div className="step-count-badge" style={{ borderColor: step.color, color: step.color }}>
                                    {step.count}
                                </div>
                                <div className="step-content">
                                    <div className="step-header">
                                        <span className="step-icon" style={{ color: step.color }}>{step.icon}</span>
                                        <h4 style={{ color: step.color }}>{step.sense}</h4>
                                    </div>
                                    <p>{step.detail}</p>
                                </div>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>

            {/* Quick Access Tools */}
            <section className="wellness-section">
                <div className="section-header">
                    <ListTodo className="section-icon" />
                    <h3>ADDITIONAL_MODULES</h3>
                </div>
                <StaggerContainer className="tools-grid">
                    {TOOLS.map(tool => (
                        <StaggerItem key={tool.id}>
                            <TiltCard>
                                <Link to={tool.link}>
                                    <div className="tool-card card-3d">
                                        <div className="tool-content">
                                            <div className="tool-icon-wrapper glow-border">
                                                {tool.icon}
                                            </div>
                                            <div className="tool-text">
                                                <h4>{tool.name}</h4>
                                                <p>{tool.description}</p>
                                            </div>
                                        </div>
                                        <button className="tool-action-btn">
                                            {tool.btnText}
                                        </button>
                                    </div>
                                </Link>
                            </TiltCard>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </section>
        </div>
    );
}
