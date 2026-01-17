import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

// ===== Animation Variants =====
export const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
};

export const fadeInDown = {
    hidden: { opacity: 0, y: -40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
};

export const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
};

export const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
    }
};

export const blurIn = {
    hidden: { opacity: 0, filter: 'blur(10px)', y: 20 },
    visible: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
};

// ===== Motion Components =====

// Fade in when scrolled into view
export function FadeIn({ children, direction = 'up', delay = 0, className = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    const variants = {
        up: fadeInUp,
        down: fadeInDown,
        left: fadeInLeft,
        right: fadeInRight
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={variants[direction]}
            transition={{ delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Scale in when scrolled into view
export function ScaleIn({ children, delay = 0, className = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={scaleIn}
            transition={{ delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Blur reveal when scrolled into view
export function BlurIn({ children, delay = 0, className = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={blurIn}
            transition={{ delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Staggered children animation
export function StaggerContainer({ children, className = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className = '' }) {
    return (
        <motion.div variants={staggerItem} className={className}>
            {children}
        </motion.div>
    );
}

// Parallax scroll effect
export function Parallax({ children, speed = 0.5, className = '' }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    });

    const y = useTransform(scrollYProgress, [0, 1], [-100 * speed, 100 * speed]);
    const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

    return (
        <motion.div ref={ref} style={{ y: smoothY }} className={className}>
            {children}
        </motion.div>
    );
}

// Hover lift effect
export function HoverLift({ children, className = '' }) {
    return (
        <motion.div
            whileHover={{
                y: -8,
                boxShadow: '0 20px 40px rgba(139, 92, 246, 0.2)',
                transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
            }}
            whileTap={{ scale: 0.98 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Hover scale effect
export function HoverScale({ children, scale = 1.05, className = '' }) {
    return (
        <motion.div
            whileHover={{
                scale,
                transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
            }}
            whileTap={{ scale: 0.95 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Magnetic button effect
export function Magnetic({ children, strength = 0.3, className = '' }) {
    const ref = useRef(null);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };

    const handleMouseLeave = () => {
        if (!ref.current) return;
        ref.current.style.transform = 'translate(0, 0)';
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
            style={{ transition: 'transform 0.2s ease-out' }}
        >
            {children}
        </motion.div>
    );
}

// Tilt card effect
export function TiltCard({ children, className = '' }) {
    const ref = useRef(null);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        ref.current.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
        if (!ref.current) return;
        ref.current.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
            style={{ transition: 'transform 0.3s ease-out', transformStyle: 'preserve-3d' }}
        >
            {children}
        </motion.div>
    );
}

// Scroll progress bar
export function ScrollProgress({ className = '' }) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    return (
        <motion.div
            style={{
                scaleX,
                transformOrigin: 'left',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%)',
                zIndex: 9999
            }}
            className={className}
        />
    );
}

// Text character animation
export function AnimatedText({ text, className = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const characters = text.split('');

    return (
        <motion.span ref={ref} className={className}>
            {characters.map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                        delay: i * 0.03,
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    style={{ display: 'inline-block' }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
        </motion.span>
    );
}

// Count up animation
export function CountUp({ target, duration = 2, className = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const count = useSpring(0, { duration: duration * 1000 });

    if (isInView) {
        count.set(target);
    }

    return (
        <motion.span ref={ref} className={className}>
            {Math.round(count.get())}
        </motion.span>
    );
}

// Page transition wrapper
export function PageTransition({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
}

export default {
    FadeIn,
    ScaleIn,
    BlurIn,
    StaggerContainer,
    StaggerItem,
    Parallax,
    HoverLift,
    HoverScale,
    Magnetic,
    TiltCard,
    ScrollProgress,
    AnimatedText,
    CountUp,
    PageTransition
};
