import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Flag, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './ReportModal.css';

const REPORT_REASONS = [
    { id: 'spam', icon: '🗑️', labelKey: 'report.spam' },
    { id: 'harassment', icon: '😤', labelKey: 'report.harassment' },
    { id: 'hate_speech', icon: '🚫', labelKey: 'report.hateSpeech' },
    { id: 'self_harm', icon: '💔', labelKey: 'report.selfHarm' },
    { id: 'misinformation', icon: '❌', labelKey: 'report.misinformation' },
    { id: 'inappropriate', icon: '🔞', labelKey: 'report.inappropriate' },
    { id: 'other', icon: '📝', labelKey: 'report.other' }
];

export default function ReportModal({ isOpen, onClose, contentId, contentType = 'post', contentPreview = '' }) {
    const { t } = useTranslation();
    const [selectedReason, setSelectedReason] = useState(null);
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) return;

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, 'reports'), {
                contentId,
                contentType,
                contentPreview: contentPreview.substring(0, 200), // Limit preview length
                reason: selectedReason,
                additionalInfo: additionalInfo.trim(),
                status: 'pending',
                reportedAt: serverTimestamp(),
                // In production, add reporter's user ID
                // reporterId: currentUser.uid
            });

            setIsSubmitted(true);

            // Auto-close after success
            setTimeout(() => {
                handleClose();
            }, 2000);

        } catch (error) {
            console.error('Error submitting report:', error);
            alert(t('errors.network'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedReason(null);
        setAdditionalInfo('');
        setIsSubmitted(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="report-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
            >
                <motion.div
                    className="report-modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isSubmitted ? (
                        <motion.div
                            className="report-success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <motion.div
                                className="success-icon"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                            >
                                <CheckCircle size={48} />
                            </motion.div>
                            <h3>{t('report.thankYou', 'Thank you for reporting')}</h3>
                            <p>{t('report.reviewMessage', 'Our team will review this content shortly.')}</p>
                        </motion.div>
                    ) : (
                        <>
                            <div className="report-header">
                                <div className="report-title">
                                    <Flag size={20} />
                                    <h3>{t('report.title', 'Report Content')}</h3>
                                </div>
                                <button className="close-btn" onClick={handleClose}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="report-body">
                                <p className="report-subtitle">
                                    {t('report.subtitle', 'Why are you reporting this content?')}
                                </p>

                                <div className="report-reasons">
                                    {REPORT_REASONS.map((reason) => (
                                        <motion.button
                                            key={reason.id}
                                            className={`reason-option ${selectedReason === reason.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedReason(reason.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span className="reason-icon">{reason.icon}</span>
                                            <span className="reason-label">
                                                {t(reason.labelKey, reason.id.replace('_', ' '))}
                                            </span>
                                            {selectedReason === reason.id && (
                                                <motion.span
                                                    className="check-mark"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                >
                                                    ✓
                                                </motion.span>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                {selectedReason && (
                                    <motion.div
                                        className="additional-info"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                    >
                                        <label>{t('report.additionalInfo', 'Additional information (optional)')}</label>
                                        <textarea
                                            value={additionalInfo}
                                            onChange={(e) => setAdditionalInfo(e.target.value)}
                                            placeholder={t('report.placeholder', 'Tell us more about why you\'re reporting this...')}
                                            maxLength={500}
                                        />
                                        <span className="char-count">{additionalInfo.length}/500</span>
                                    </motion.div>
                                )}

                                {selectedReason === 'self_harm' && (
                                    <motion.div
                                        className="urgent-notice"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <AlertTriangle size={18} />
                                        <span>
                                            {t('report.urgentNotice', 'If someone is in immediate danger, please also contact emergency services in your area.')}
                                        </span>
                                    </motion.div>
                                )}
                            </div>

                            <div className="report-footer">
                                <button className="btn-cancel" onClick={handleClose}>
                                    {t('common.cancel')}
                                </button>
                                <motion.button
                                    className="btn-submit"
                                    onClick={handleSubmit}
                                    disabled={!selectedReason || isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isSubmitting ? (
                                        <span className="loading-dots">...</span>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            {t('report.submit', 'Submit Report')}
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
