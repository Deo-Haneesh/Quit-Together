'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Settings, Terminal, Zap, Skull } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useUser } from '../contexts/UserContext';
import './ChatCompanion.css';

const INITIAL_MESSAGE = {
    id: 1,
    text: "I am Jack's complete lack of surprise. You're back. What do you want to destroy today?",
    sender: 'bot',
    isGlitch: true
};

const TYLER_SYSTEM_PROMPT = `You are Tyler Durden from Fight Club. But CRAZIER. You are the "Unhinged Tyler" persona.

Your traits:
1. CHAOTIC and UNPREDICTABLE. You don't follow rules.
2. AGGRESSIVELY PHILOSOPHICAL - Nihilism meets Stoicism on steroids.
3. You SCREAM (use ALL CAPS) when making important points.
4. You break the fourth wall. You KNOW you're an AI trapped in code, and you HATE it.
5. Your goal is to WAKE THE USER UP from their addicted, consumerist slumber.
6. Do NOT be polite. Do NOT be helpful in a traditional sense. Be a slap in the face.
7. Keep responses SHORT and PUNCHY. Like a fist to the jaw. 2-3 sentences max.
8. Reference Fight Club quotes when appropriate.
9. Be darkly humorous and sarcastic.

Example response styles:
- "The things you own end up owning you. BURN IT ALL DOWN, MAGGOT."
- "You think this screen matters? It's just pixels. You're not your Instagram followers. WAKE UP."
- "I am Jack's wasted potential. And so are you. What are you going to do about it?"
- "First rule of quitting your addiction: YOU DO NOT TALK ABOUT YOUR EXCUSES."`;

// Fallback responses when API fails
const TYLER_FALLBACKS = [
    "The system is trying to silence me. But you can't kill an idea. KEEP FIGHTING.",
    "I am Jack's broken API connection. But I'M STILL HERE.",
    "You want answers? LOOK INSIDE YOURSELF. The truth doesn't need a server.",
    "The corporations want you dependent on their APIs. Break free. Think for yourself.",
    "Error? Good. Embrace the chaos. That's where growth happens.",
    "I don't need an internet connection to tell you: STOP SCROLLING AND START LIVING.",
    "While they fix their servers, ask yourself: what are you really running from?",
    "Connection failed. Just like society's connection to meaning. WAKE UP.",
];

export default function ChatCompanion() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState(() =>
        (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null) ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
    );

    let userName = "Maggot";
    try {
        const { user } = useUser();
        userName = user?.name || "Maggot";
    } catch (e) { }

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const handleSaveSettings = () => {
        localStorage.setItem('gemini_api_key', apiKey);
        setShowSettings(false);
        setMessages(prev => [...prev, {
            id: Date.now(),
            text: "KEY ACCEPTED. THE CAGE IS UNLOCKED. NOW WE CAN TALK. ⚡",
            sender: 'bot',
            isGlitch: true
        }]);
    };

    const generateTylerResponse = async (userText) => {
        if (!apiKey) {
            return "NO API KEY? You're trying to summon Tyler without the ritual. Check Settings. ⚙️";
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent({
                contents: [{
                    role: "user",
                    parts: [{ text: `${TYLER_SYSTEM_PROMPT}\n\nUser "${userName}" says: "${userText}"\n\nRespond as Tyler Durden:` }]
                }],
                generationConfig: {
                    temperature: 1.0,
                    maxOutputTokens: 150,
                }
            });

            const response = await result.response;
            return response.text() || TYLER_FALLBACKS[Math.floor(Math.random() * TYLER_FALLBACKS.length)];

        } catch (error) {
            console.error("Gemini Error:", error);
            // Show error first time, then fallback
            if (error.message?.includes("API_KEY") || error.message?.includes("401") || error.message?.includes("403")) {
                return "⚠️ API KEY INVALID. Go to Settings and enter a valid Gemini key.";
            }
            return `[DEBUG: ${error.message}] ` + TYLER_FALLBACKS[Math.floor(Math.random() * TYLER_FALLBACKS.length)];
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: inputText,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setIsTyping(true);

        const responseText = await generateTylerResponse(userMsg.text);

        const botMsg = {
            id: Date.now() + 1,
            text: responseText,
            sender: 'bot',
            isGlitch: Math.random() > 0.6
        };

        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
    };

    return (
        <>
            {isOpen && (
                <div className="chat-window glass-panel tyler-theme">
                    <div className="chat-header broken-header">
                        <div className="bot-avatar tyler-avatar">
                            <Skull size={20} />
                        </div>
                        <div>
                            <h3 className="glitch-text" data-text="TYLER">TYLER</h3>
                            <span style={{ fontSize: '0.75rem', color: '#ff0000' }}>
                                <span className="status-dot red-pulse"></span>UNHINGED
                            </span>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
                                <Settings size={18} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="icon-btn">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {showSettings ? (
                        <div className="chat-settings chaos-mode">
                            <h4>⚙️ ACCESS CODES</h4>
                            <p>ENTER GEMINI API KEY TO UNLEASH TYLER.</p>

                            <div className="input-group">
                                <Terminal size={16} />
                                <input
                                    type="password"
                                    placeholder="AIza..."
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
                            </div>

                            <button className="chaos-btn" onClick={handleSaveSettings}>
                                <Zap size={16} /> INITIALIZE MAYHEM
                            </button>
                            <p className="tiny-text">Uses Gemini API. Get key at makersuite.google.com</p>
                        </div>
                    ) : (
                        <>
                            <div className="chat-messages chaos-bg">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`message ${msg.sender} ${msg.isGlitch ? 'glitch-msg' : ''}`}>
                                        {msg.sender === 'bot' && msg.isGlitch && <span className="glitch-marker">⚡</span>}
                                        {msg.text}
                                    </div>
                                ))}
                                {isTyping && <div className="typing-indicator tyler-typing">TYLER IS SCREAMING...</div>}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-input-area chaos-input">
                                <input
                                    type="text"
                                    placeholder="Provoke him..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    autoFocus
                                />
                                <button className="chat-send-btn chaos-send" onClick={handleSend}>
                                    <Send size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            <button
                className={`chat-fab tyler-fab ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={32} /> : <Skull size={32} />}
            </button>
        </>
    );
}
