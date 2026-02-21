'use client';

import { useGLTF } from '@react-three/drei';

export function KnifeModel() {
    const { scene } = useGLTF('/knife.glb');

    return (
        <primitive
            object={scene}
            scale={3.5}
            position={[0, -3.8, 0]}
            rotation={[0, Math.PI * 0.1, 0]}
        />
    );
}

useGLTF.preload('/knife.glb');
