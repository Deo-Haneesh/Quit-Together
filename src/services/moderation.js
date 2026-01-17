/**
 * Content Moderation Service
 * Uses Google Gemini AI for wellness-focused content moderation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini - API key should be in environment variables for production
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
let genAI = null;
let model = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    // gemini-1.5-flash - stable model for content moderation
    // Note: Free tier has 15 requests/minute limit. Upgrade for production use.
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

/**
 * Moderation result structure
 */
const createModerationResult = (isApproved, reason = '', flags = [], severity = 'none') => ({
    isApproved,
    reason,
    flags,
    severity, // 'none', 'low', 'medium', 'high', 'critical'
    timestamp: new Date().toISOString()
});

/**
 * Content categories for wellness platform
 */
export const MODERATION_FLAGS = {
    SELF_HARM: 'self_harm',
    SUICIDE: 'suicide',
    HARASSMENT: 'harassment',
    HATE_SPEECH: 'hate_speech',
    VIOLENCE: 'violence',
    SPAM: 'spam',
    EXPLICIT: 'explicit',
    MISINFORMATION: 'misinformation',
    TRIGGERING: 'triggering_content',
    SAFE: 'safe'
};

/**
 * Severity levels
 */
export const SEVERITY = {
    NONE: 'none',
    LOW: 'low',       // Minor issues, allow with warning
    MEDIUM: 'medium', // Needs review, may be hidden
    HIGH: 'high',     // Should be hidden, notify moderators
    CRITICAL: 'critical' // Block immediately, urgent action needed
};

/**
 * Main moderation function using Gemini
 * @param {string} content - The text content to moderate
 * @returns {Promise<object>} Moderation result
 */
export async function moderateContent(content) {
    // If no API key, return as safe (development mode)
    if (!model) {
        console.warn('Moderation: No Gemini API key configured, skipping moderation');
        return createModerationResult(true, 'No moderation configured', ['safe'], 'none');
    }

    // Quick checks for empty/short content
    if (!content || content.trim().length < 3) {
        return createModerationResult(true, 'Content too short to moderate', ['safe'], 'none');
    }

    try {
        const prompt = `You are a content moderator for a mental health and wellness support platform called "Quit-Together". This platform helps people recover from addiction and mental health challenges.

Analyze the following user content and determine if it should be allowed. Consider that this is a supportive community where:
- Users share their struggles and victories
- Honest discussions about addiction and recovery are normal
- We want to protect users from harmful content while allowing genuine support

Content to analyze:
"""
${content}
"""

Respond in JSON format only:
{
  "approved": boolean,
  "severity": "none" | "low" | "medium" | "high" | "critical",
  "flags": string[], // Use: self_harm, suicide, harassment, hate_speech, violence, spam, explicit, misinformation, triggering_content, safe
  "reason": "Brief explanation",
  "suggestion": "If not approved, suggest how to rephrase (optional)"
}

Guidelines:
- approved=true for supportive content, recovery stories, asking for help
- approved=false for content promoting self-harm, explicit suicide plans, harassment, hate speech
- severity=low: minor issues, usually still approved
- severity=medium: borderline content, may need human review
- severity=high: clearly problematic, should be hidden
- severity=critical: immediate danger, block and alert

Be supportive of recovery discussions while protecting the community.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return createModerationResult(
                parsed.approved,
                parsed.reason || '',
                parsed.flags || ['safe'],
                parsed.severity || 'none'
            );
        }

        // Fallback if parsing fails
        return createModerationResult(true, 'Unable to parse moderation response', ['safe'], 'none');

    } catch (error) {
        console.error('Moderation error:', error);
        // On error, allow content but flag for review
        return createModerationResult(true, 'Moderation error, flagged for review', ['needs_review'], 'low');
    }
}

/**
 * Quick local checks (no API call) for obvious spam/issues
 * @param {string} content - Content to check
 * @returns {object|null} Moderation result if blocked, null to proceed to AI check
 */
export function quickModeration(content) {
    if (!content || typeof content !== 'string') {
        return createModerationResult(false, 'Invalid content', ['invalid'], 'high');
    }

    const lowered = content.toLowerCase();

    // Spam patterns
    const spamPatterns = [
        /(.)\1{10,}/,  // Repeated characters
        /(buy now|click here|free money|viagra|casino)/i,
        /https?:\/\/[^\s]+\s*https?:\/\/[^\s]+\s*https?:\/\//i, // Multiple links
    ];

    for (const pattern of spamPatterns) {
        if (pattern.test(content)) {
            return createModerationResult(false, 'Content flagged as spam', ['spam'], 'high');
        }
    }

    // Length check
    if (content.length > 5000) {
        return createModerationResult(false, 'Content exceeds maximum length', ['spam'], 'medium');
    }

    // All clear for quick check
    return null;
}

/**
 * Full moderation pipeline
 * @param {string} content - Content to moderate
 * @returns {Promise<object>} Moderation result
 */
export async function fullModeration(content) {
    // First, quick local checks
    const quickResult = quickModeration(content);
    if (quickResult) {
        return quickResult;
    }

    // Then AI moderation
    return await moderateContent(content);
}

/**
 * Check if content needs human review
 * @param {object} moderationResult - Result from moderation
 * @returns {boolean}
 */
export function needsHumanReview(moderationResult) {
    return (
        moderationResult.severity === 'medium' ||
        moderationResult.flags.includes('needs_review') ||
        moderationResult.flags.includes('triggering_content')
    );
}

/**
 * Check if content should be blocked immediately
 * @param {object} moderationResult - Result from moderation
 * @returns {boolean}
 */
export function shouldBlock(moderationResult) {
    return (
        !moderationResult.isApproved &&
        (moderationResult.severity === 'high' || moderationResult.severity === 'critical')
    );
}

export default {
    moderateContent,
    quickModeration,
    fullModeration,
    needsHumanReview,
    shouldBlock,
    MODERATION_FLAGS,
    SEVERITY
};
