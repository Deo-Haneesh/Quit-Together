import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, CheckCircle, XCircle, Activity, Database, Shield, Wifi } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, limit, query, doc, getDoc } from 'firebase/firestore';
import './SystemDiagnostics.css';

export default function SystemDiagnostics() {
    const { currentUser } = useAuth();
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState({
        auth: 'pending',
        firestore: 'pending',
        userData: 'pending',
        gamification: 'pending'
    });

    const addLog = (message, type = 'info') => {
        setLogs(prev => [...prev, { id: Date.now(), message, type, time: new Date().toLocaleTimeString() }]);
    };

    useEffect(() => {
        const runDiagnostics = async () => {
            addLog("INITIALIZING SYSTEM DIAGNOSTICS...", "info");

            // 1. Auth Check
            if (currentUser) {
                setStatus(prev => ({ ...prev, auth: 'success' }));
                addLog(`USER_DETECTED: ${currentUser.email} (UID: ${currentUser.uid})`, "success");
            } else {
                setStatus(prev => ({ ...prev, auth: 'error' }));
                addLog("CRITICAL: NO_USER_SESSION_DETECTED", "error");
                return; // Stop if no user
            }

            // 2. Firestore Connection (Public)
            try {
                addLog("PINGING_FIRESTORE_POSTS...", "info");
                const q = query(collection(db, "posts"), limit(1));
                await getDocs(q);
                setStatus(prev => ({ ...prev, firestore: 'success' }));
                addLog("CONNECTION_ESTABLISHED: FIRESTORE_READ_OK", "success");
            } catch (error) {
                setStatus(prev => ({ ...prev, firestore: 'error' }));
                addLog(`CONNECTION_FAILED: ${error.message}`, "error");
            }

            // 3. User Data Check (Private)
            try {
                addLog(`FETCHING_USER_PROFILE [${currentUser.uid}]...`, "info");
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setStatus(prev => ({ ...prev, userData: 'success' }));
                    addLog("USER_PROFILE_INTEGRITY: VERIFIED", "success");
                } else {
                    setStatus(prev => ({ ...prev, userData: 'warning' }));
                    addLog("WARNING: USER_PROFILE_MISSING", "warning");
                }
            } catch (error) {
                setStatus(prev => ({ ...prev, userData: 'error' }));
                addLog(`USER_DATA_ACCESS_DENIED: ${error.message}`, "error");
            }

            // 4. Gamification Check
            try {
                addLog("VERIFYING_GAMIFICATION_SUBSYSTEM...", "info");
                const gameDoc = await getDoc(doc(db, "gamification", currentUser.uid));
                if (gameDoc.exists()) {
                    setStatus(prev => ({ ...prev, gamification: 'success' }));
                    addLog(`GAMIFICATION_STATE: ACTIVE (XP: ${gameDoc.data().xp})`, "success");
                } else {
                    // It might not exist yet if new user, but technically context creates it.
                    setStatus(prev => ({ ...prev, gamification: 'warning' }));
                    addLog("GAMIFICATION_STATE: NOT_FOUND (Will be created on first action)", "warning");
                }
            } catch (error) {
                setStatus(prev => ({ ...prev, gamification: 'error' }));
                addLog(`GAMIFICATION_ERROR: ${error.message}`, "error");
            }

            addLog("DIAGNOSTIC_SEQUENCE_COMPLETE", "info");
        };

        runDiagnostics();
    }, [currentUser]);

    const StatusIcon = ({ state }) => {
        if (state === 'success') return <CheckCircle className="text-green-500" />;
        if (state === 'error') return <XCircle className="text-red-500" />;
        if (state === 'warning') return <Activity className="text-yellow-500" />;
        return <Activity className="text-gray-500 animate-pulse" />;
    };

    return (
        <div className="diagnostics-page">
            <div className="terminal-container glass-panel">
                <header className="terminal-header">
                    <Terminal size={20} className="text-primary" />
                    <h2>SYSTEM_DIAGNOSTICS_TOOL_V1.0</h2>
                    <div className="status-indicator online"></div>
                </header>

                <div className="diagnostics-grid">
                    <div className="status-card glass-panel">
                        <div className="card-header">
                            <Shield size={20} />
                            <span>AUTHENTICATION</span>
                        </div>
                        <div className="card-status">
                            <StatusIcon state={status.auth} />
                            <span>{status.auth.toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="status-card glass-panel">
                        <div className="card-header">
                            <Wifi size={20} />
                            <span>DATABASE_CONN</span>
                        </div>
                        <div className="card-status">
                            <StatusIcon state={status.firestore} />
                            <span>{status.firestore.toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="status-card glass-panel">
                        <div className="card-header">
                            <Database size={20} />
                            <span>USER_DATA</span>
                        </div>
                        <div className="card-status">
                            <StatusIcon state={status.userData} />
                            <span>{status.userData.toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="status-card glass-panel">
                        <div className="card-header">
                            <Activity size={20} />
                            <span>GAMIFICATION</span>
                        </div>
                        <div className="card-status">
                            <StatusIcon state={status.gamification} />
                            <span>{status.gamification.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div className="terminal-window">
                    {logs.map(log => (
                        <motion.div
                            key={log.id}
                            className={`log-line type-${log.type}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <span className="log-time">[{log.time}]</span>
                            <span className="log-message">{log.message}</span>
                        </motion.div>
                    ))}
                    <div className="cursor-blink">_</div>
                </div>
            </div>
        </div>
    );
}
