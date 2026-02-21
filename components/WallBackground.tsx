'use client';

import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

export function WallBackground() {
    const diffuse = useLoader(THREE.TextureLoader, '/wall-diffuse.webp');
    const normalMap = useLoader(THREE.TextureLoader, '/wall-normal.webp');

    // Configure texture wrapping/repeat
    [diffuse, normalMap].forEach((tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 2); // tile the bricks
    });

    return (
        <group>
            {/* Back wall */}
            <mesh position={[0, 0, -3]} receiveShadow>
                <planeGeometry args={[16, 10]} />
                <meshStandardMaterial
                    map={diffuse}
                    normalMap={normalMap}
                    normalScale={new THREE.Vector2(1.5, 1.5)}
                    roughness={0.95}
                    metalness={0}
                    color="#583828"
                />
            </mesh>

            {/* Floor */}
            <mesh
                position={[0, -4.2, 1]}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
            >
                <planeGeometry args={[16, 10]} />
                <meshStandardMaterial
                    map={diffuse}
                    normalMap={normalMap}
                    normalScale={new THREE.Vector2(1.2, 1.2)}
                    roughness={0.98}
                    metalness={0}
                    color="#3a2818"
                />
            </mesh>
        </group>
    );
}
