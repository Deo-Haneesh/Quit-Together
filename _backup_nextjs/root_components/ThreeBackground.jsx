'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import './ThreeBackground.css';

// Reduced particle count significantly for performance
function ParticleField({ count = 500 }) {
    const points = useRef();
    const frameCount = useRef(0);

    // Generate particle positions
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const colorPalette = [
            new THREE.Color('#8b5cf6'), // Purple
            new THREE.Color('#6366f1'), // Indigo
            new THREE.Color('#3b82f6'), // Blue
            new THREE.Color('#06b6d4'), // Cyan
            new THREE.Color('#10b981'), // Emerald
        ];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Spread particles in a sphere
            const radius = Math.random() * 15 + 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Assign color from palette
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        return { positions, colors };
    }, [count]);

    // Animate particles - only update every 3rd frame
    useFrame((state, delta) => {
        if (!points.current) return;
        frameCount.current++;
        if (frameCount.current % 3 !== 0) return;

        // Slow rotation
        points.current.rotation.x += delta * 0.01;
        points.current.rotation.y += delta * 0.015;
    });

    return (
        <Points ref={points} positions={particles.positions} colors={particles.colors} stride={3}>
            <PointMaterial
                transparent
                vertexColors
                size={0.1}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.6}
            />
        </Points>
    );
}

// Simplified floating orbs
function FloatingOrbs() {
    const orbs = useRef([]);
    const frameCount = useRef(0);

    const orbData = useMemo(() => {
        return Array.from({ length: 3 }, (_, i) => ({
            position: [
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5 - 5,
            ],
            scale: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 0.3 + 0.1,
            offset: Math.random() * Math.PI * 2,
            color: ['#8b5cf6', '#6366f1', '#3b82f6'][i % 3],
        }));
    }, []);

    useFrame((state) => {
        frameCount.current++;
        if (frameCount.current % 2 !== 0) return;

        orbs.current.forEach((orb, i) => {
            if (!orb) return;
            const t = state.clock.elapsedTime * orbData[i].speed + orbData[i].offset;
            orb.position.y = orbData[i].position[1] + Math.sin(t) * 2;
        });
    });

    return (
        <>
            {orbData.map((orb, i) => (
                <mesh
                    key={i}
                    ref={(el) => (orbs.current[i] = el)}
                    position={orb.position}
                    scale={orb.scale}
                >
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial
                        color={orb.color}
                        transparent
                        opacity={0.1}
                    />
                </mesh>
            ))}
        </>
    );
}

export default function ThreeBackground() {
    const [isVisible, setIsVisible] = useState(true);

    // Reduce/pause rendering when tab is not visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    if (!isVisible) return <div className="three-background" />;

    return (
        <div className="three-background">
            <Canvas
                camera={{ position: [0, 0, 15], fov: 60 }}
                gl={{
                    antialias: false,
                    alpha: true,
                    powerPreference: 'low-power',
                    precision: 'lowp'
                }}
                dpr={1}
                frameloop="always"
            >
                <ambientLight intensity={0.5} />
                <ParticleField count={400} />
                <FloatingOrbs />
            </Canvas>
        </div>
    );
}

