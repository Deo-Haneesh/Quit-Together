import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import './LanguageSelector.css';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true }
];

export default function LanguageSelector({ compact = false }) {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className="language-selector">
            <motion.button
                className="language-trigger"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {compact ? (
                    <Globe size={20} />
                ) : (
                    <>
                        <span className="lang-flag">{currentLanguage.flag}</span>
                        <span className="lang-name">{currentLanguage.name}</span>
                        <ChevronDown
                            size={16}
                            className={`chevron ${isOpen ? 'open' : ''}`}
                        />
                    </>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="language-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            className="language-dropdown"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <div className="dropdown-header">
                                <Globe size={16} />
                                <span>{t('settings.language')}</span>
                            </div>
                            <div className="language-list">
                                {languages.map((lang) => (
                                    <motion.button
                                        key={lang.code}
                                        className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                                        onClick={() => changeLanguage(lang.code)}
                                        whileHover={{ x: 4 }}
                                    >
                                        <span className="lang-flag">{lang.flag}</span>
                                        <span className="lang-name">{lang.name}</span>
                                        {i18n.language === lang.code && (
                                            <motion.span
                                                className="check-icon"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <Check size={16} />
                                            </motion.span>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
