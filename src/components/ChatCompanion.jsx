import React, { useState } from 'react';
import { X, Zap, Skull, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatCompanion.css';

const MOTIVATIONAL_QUOTES = [
    "IT'S ONLY AFTER WE'VE LOST EVERYTHING THAT WE'RE FREE TO DO ANYTHING.",
    "THIS IS YOUR LIFE AND IT'S ENDING ONE MINUTE AT A TIME.",
    "YOU ARE NOT YOUR JOB. YOU'RE NOT HOW MUCH MONEY YOU HAVE IN THE BANK.",
    "STOP TRYING TO CONTROL EVERYTHING AND JUST LET GO.",
    "SELF-IMPROVEMENT IS MASTURBATION. DESTRUCTION IS A FORM OF CREATION.",
    "THE THINGS YOU OWN END UP OWNING YOU.",
    "YOU HAVE TO KNOW, NOT FEAR, THAT ONE DAY YOU ARE GOING TO DIE.",
    "DO WHAT YOU LOVE, OR DIE A SLOW DEATH DOING WHAT YOU HATE.",
    "PAIN IS JUST WEAKNESS LEAVING THE BODY. BURN IT OUT.",
    "IF YOU WANT TO CHANGE THE WORLD, START BY TEARING YOURSELF APART.",
    "WE SUFFER MORE OFTEN IN IMAGINATION THAN IN REALITY. WAKE UP.",
    "YOU HAVE POWER OVER YOUR MIND - NOT OUTSIDE EVENTS. REALIZE THIS, AND YOU WILL FIND STRENGTH.",
    "THE BEST REVENGE IS TO BE UNLIKE HIM WHO PERFORMED THE INJURY.",
    "DOUBT KILLS MORE DREAMS THAN FAILURE EVER WILL. MURDER YOUR DOUBT.",
    "DISCIPLINE IS FREEDOM. EVERYTHING ELSE IS A CAGE.",
    "DON'T WISH IT WERE EASIER. WISH YOU WERE BETTER.",
    "YOUR POTENTIAL IS THE ONLY THING WORTH FIGHTING FOR. EVERYTHING ELSE IS NOISE.",
    "COMFORT IS THE ENEMY OF PROGRESS. SUFFER MORE.",
    "WAKE UP. THE WORLD IS WAITING FOR YOU TO TAKE IT.",
    "DON'T JUST EXIST. LIVE. SCREAM. BLEED. FIGHT."
];

export default function ChatCompanion() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentQuote, setCurrentQuote] = useState("HIT THE BUTTON TO WAKE UP.");
    const [isAnimating, setIsAnimating] = useState(false);

    const getMotivation = () => {
        setIsAnimating(true);
        // Slight delay for "processing" feel
        setTimeout(() => {
            const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
            setCurrentQuote(randomQuote);
            setIsAnimating(false);
        }, 300);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chat-window glass-panel tyler-theme"
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Header */}
                        <div className="chat-header broken-header">
                            <div className="bot-avatar tyler-avatar">
                                <Skull size={20} />
                            </div>
                            <div>
                                <h3 className="glitch-text" data-text="CHAOS">CHAOS</h3>
                                <span style={{ fontSize: '0.75rem', color: '#ff0000' }}>
                                    <span className="status-dot red-pulse"></span>UNHINGED
                                </span>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <button onClick={() => setIsOpen(false)} className="icon-btn">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="motivation-content" style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '30px',
                            textAlign: 'center',
                            background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255, 0, 0, 0.05) 1px, rgba(255, 0, 0, 0.05) 2px)'
                        }}>
                            <Quote size={40} color="#ff0000" style={{ opacity: 0.5, marginBottom: '20px' }} />

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuote}
                                    initial={{ opacity: 0, scale: 0.9, x: -10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, position: 'absolute', x: 10 }}
                                    className="quote-text glitch-text"
                                    data-text={currentQuote}
                                    style={{
                                        fontSize: '1.4rem',
                                        fontFamily: 'var(--font-display)',
                                        lineHeight: '1.4',
                                        color: '#fff',
                                        textShadow: '2px 2px 0px #ff0000',
                                        textTransform: 'uppercase',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    "{currentQuote}"
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer / Action Area */}
                        <div className="chat-input-area chaos-input" style={{ justifyContent: 'center', padding: '20px' }}>
                            <motion.button
                                className="chaos-btn"
                                onClick={getMotivation}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ marginTop: 0, width: '100%', fontSize: '1.1rem' }}
                            >
                                <Zap size={20} />
                                {isAnimating ? "LOADING..." : "HIT ME"}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fab Button */}
            <motion.button
                className={`chat-fab tyler-fab ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? <X size={32} /> : <Zap size={32} />}
            </motion.button>
        </>
    );
}
