import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertTriangle, Fingerprint } from 'lucide-react';
import './Login.css';

export default function Login() {
    const { login, signup, loginWithEmail } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await login();
            navigate('/');
        } catch (error) {
            setError('Failed to log in with Google.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            if (isLogin) {
                await loginWithEmail(email, password);
            } else {
                await signup(email, password);
            }
            navigate('/');
        } catch (error) {
            console.error(error);
            // Improve error message readability
            let msg = error.message;
            if (msg.includes('auth/email-already-in-use')) msg = 'Email already in use.';
            else if (msg.includes('auth/invalid-email')) msg = 'Invalid email address.';
            else if (msg.includes('auth/weak-password')) msg = 'Password should be at least 6 characters.';
            else if (msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) msg = 'Invalid email or password.';

            setError(`Failed to ${isLogin ? 'log in' : 'create account'}: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="noise-overlay"></div>

            <motion.div
                className="login-card glass-panel"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-header">
                    <motion.div
                        className="logo-icon-wrapper"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                    >
                        <Shield size={48} className="text-primary" />
                    </motion.div>
                    <h1 className="glitch-text" data-text="ACCESS_CONTROL">ACCESS_CONTROL</h1>
                    <p className="subtitle typing-effect">Identify yourself. Protocol requires verification.</p>
                </div>

                <div className="login-content">
                    {error && (
                        <div className="warning-box">
                            <AlertTriangle size={18} className="text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="login-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="login-input"
                                required
                            />
                        </div>
                        <motion.button
                            className="login-btn btn-primary"
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Processing...' : (isLogin ? 'ACCESS SYSTEM' : 'INITIATE PROTOCOL')}
                        </motion.button>
                    </form>

                    <div className="flex items-center gap-2 my-2 w-full">
                        <div className="h-px bg-white/10 flex-1"></div>
                        <span className="text-xs text-muted">OR</span>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <motion.button
                        className="login-btn btn-glow w-full"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                    >
                        <Fingerprint size={24} />
                        <span>Authenticate with Google</span>
                    </motion.button>

                    <button
                        className="text-muted text-sm hover:text-primary transition-colors mt-2 font-mono"
                        onClick={() => setIsLogin(!isLogin)}
                        type="button"
                    >
                        {isLogin ? "Need an identity? JOIN US." : "Already verified? LOGIN."}
                    </button>
                </div>

                <div className="login-footer">
                    <Lock size={14} />
                    <span>SECURE CONNECTION ESTABLISHED</span>
                </div>
            </motion.div>
        </div>
    );
}
