'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CharacterModel } from './CharacterModel';
import { KnifeModel } from './KnifeModel';
import { WallBackground } from './WallBackground';
import { TitleText3D } from './TitleText3D';
import * as THREE from 'three';

function Lights() {
    return (
        <>
            {/* Ambient - warm orange tint, low intensity */}
            <ambientLight intensity={0.15} color="#c08040" />

            {/* Strong front fill light for face & texture visibility */}
            <directionalLight
                position={[0.5, 3, 5]}
                intensity={1.5}
                color="#e0d4c0"
                castShadow={false}
            />

            {/* Secondary front light from slight left - face */}
            <pointLight
                position={[-1, 2, 4]}
                intensity={4}
                color="#d0a880"
                distance={15}
                decay={2}
            />

            {/* Strong rim light - back left (cyan edge glow) */}
            <pointLight
                position={[-4, 4, -4]}
                intensity={18}
                color="#4a7c9e"
                distance={20}
                decay={2}
            />

            {/* Rim light - back right (warm gold edge) */}
            <pointLight
                position={[4, 3, -5]}
                intensity={14}
                color="#c9a84c"
                distance={20}
                decay={2}
            />

            {/* Top-down hair/shoulder highlight */}
            <spotLight
                position={[0, 10, -2]}
                intensity={10}
                color="#8070a0"
                angle={0.4}
                penumbra={0.8}
                distance={20}
                decay={2}
            />
        </>
    );
}

function FireLight() {
    const charLight = useRef<THREE.PointLight>(null);
    const wallLight = useRef<THREE.PointLight>(null);
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        // Organic flicker from multiple sine waves
        const f1 = 0.6 + Math.sin(t * 1.7) * 0.15 + Math.sin(t * 3.1) * 0.1 + Math.sin(t * 5.3) * 0.05;
        const f2 = 0.6 + Math.sin(t * 1.3 + 0.5) * 0.15 + Math.sin(t * 2.7 + 1) * 0.1 + Math.sin(t * 4.9) * 0.05;
        if (charLight.current) charLight.current.intensity = f1 * 6;
        if (wallLight.current) wallLight.current.intensity = f2 * 14;
    });
    return (
        <>
            {/* Fire on character side */}
            <pointLight
                ref={charLight}
                position={[1, -1, 3]}
                color="#e08030"
                intensity={4}
                distance={15}
                decay={2}
            />
            {/* Fire illuminating wall & floor */}
            <pointLight
                ref={wallLight}
                position={[0, -2, -0.5]}
                color="#d07020"
                intensity={8}
                distance={20}
                decay={1.5}
            />
        </>
    );
}

function LoadingFallback({ onLoaded }: { onLoaded: () => void }) {
    useEffect(() => {
        return () => onLoaded();
    }, [onLoaded]);
    return null;
}

export default function CharacterScene({
    onLoaded,
}: {
    onLoaded: () => void;
}) {
    return (
        <Canvas
            camera={{
                position: [0, -0.2, 5],
                fov: 45,
                near: 0.1,
                far: 100,
            }}
            gl={{
                antialias: true,
                toneMapping: 3, // ACESFilmic
                toneMappingExposure: 1.2,
            }}
            style={{ background: 'transparent' }}
            dpr={[1, 2]}
        >
            <Lights />
            <FireLight />
            <Suspense fallback={<LoadingFallback onLoaded={onLoaded} />}>
                <WallBackground />
                <CharacterModel />
                <KnifeModel />
            </Suspense>
            <fog attach="fog" args={['#050505', 10, 30]} />
        </Canvas>
    );
}
