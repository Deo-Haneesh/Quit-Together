import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import './UserChat.css';

const AUTO_REPLIES = [
    "Hey! Thanks for connecting. How are you holding up?",
    "I'm actually just around the corner. Do you want to grab a coffee?",
    "That's great to hear! Keep going strong. 💪",
    "I totally get that. It's been a rough week for me too.",
    "Have you tried the breathing exercise on the Wellness page? It helps me a lot."
];

export default function UserChat({ user, onClose }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        // Reset chat when user changes
        setMessages([
            { id: 1, text: `Connected with ${user.name}. Say hello! 👋`, sender: 'system' }
        ]);
    }, [user]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMsg = { id: Date.now(), text: inputText, sender: 'me' };
        setMessages(prev => [...prev, newMsg]);
        setInputText("");
        setIsTyping(true);

        // Simulate typing delay and reply
        setTimeout(() => {
            const replyText = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
            const replyMsg = { id: Date.now() + 1, text: replyText, sender: 'them' };
            setMessages(prev => [...prev, replyMsg]);
            setIsTyping(false);
        }, 2000 + Math.random() * 1000);
    };

    if (!user) return null;

    return (
        <div className="user-chat-window">
            <div className="user-chat-header">
                <div className="user-chat-avatar">{user.initial}</div>
                <div className="user-chat-info">
                    <h3>{user.name}</h3>
                    <div className="user-chat-status">
                        <span className="online-dot"></span> Online
                    </div>
                </div>
                <button className="close-chat-btn" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <div className="user-chat-messages">
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`chat-bubble ${msg.sender === 'system' ? 'them' : msg.sender}`}
                        style={msg.sender === 'system' ? { width: '100%', textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem' } : {}}
                    >
                        {msg.text}
                    </div>
                ))}
                {isTyping && <div className="typing-dots">{user.name} is typing...</div>}
                <div ref={bottomRef} />
            </div>

            <div className="user-chat-input">
                <input
                    type="text"
                    placeholder="Message..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    autoFocus
                />
                <button className="user-chat-send" onClick={handleSend}>
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
}
