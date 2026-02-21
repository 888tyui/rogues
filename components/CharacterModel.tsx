'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface BoneSet {
    spine: THREE.Bone[];
    pelvis: THREE.Bone | null;
    head: THREE.Bone | null;
    neck: THREE.Bone | null;
    upperarmL: THREE.Bone | null;
    upperarmR: THREE.Bone | null;
    lowerarmL: THREE.Bone | null;
    lowerarmR: THREE.Bone | null;
    thighL: THREE.Bone | null;
    thighR: THREE.Bone | null;
    calfL: THREE.Bone | null;
    calfR: THREE.Bone | null;
}

export function CharacterModel() {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/model_final.glb');

    const bones = useMemo<BoneSet>(() => {
        const result: BoneSet = {
            spine: [], pelvis: null, head: null, neck: null,
            upperarmL: null, upperarmR: null,
            lowerarmL: null, lowerarmR: null,
            thighL: null, thighR: null, calfL: null, calfR: null,
        };
        scene.traverse((child) => {
            if (child instanceof THREE.Bone) {
                const n = child.name;
                if (['spine_03', 'spine_04', 'spine_05'].includes(n)) result.spine.push(child);
                if (n === 'pelvis') result.pelvis = child;
                if (n === 'head') result.head = child;
                if (n === 'neck_01') result.neck = child;
                if (n === 'upperarm_l') result.upperarmL = child;
                if (n === 'upperarm_r') result.upperarmR = child;
                if (n === 'lowerarm_l') result.lowerarmL = child;
                if (n === 'lowerarm_r') result.lowerarmR = child;
                if (n === 'thigh_l') result.thighL = child;
                if (n === 'thigh_r') result.thighR = child;
                if (n === 'calf_l') result.calfL = child;
                if (n === 'calf_r') result.calfR = child;
            }
        });
        return result;
    }, [scene]);

    // Store originals, apply static pose, then re-save as animation baseline
    const orig = useRef(new Map<string, THREE.Euler>());
    const origPelvisY = useRef(0);
    const initialized = useRef(false);

    // Mouse tracking for head follow
    const mouseTarget = useRef({ x: 0, y: 0 });
    const mouseCurrent = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            // Normalize to -1 to 1 range
            mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseTarget.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener('mousemove', onMouseMove);
        return () => window.removeEventListener('mousemove', onMouseMove);
    }, []);

    useMemo(() => {
        if (!initialized.current && bones.spine.length > 0) {
            initialized.current = true;
            const map = new Map<string, THREE.Euler>();
            const save = (key: string, bone: THREE.Bone | null) => {
                if (bone) map.set(key, bone.rotation.clone());
            };

            // --- STATIC POSE ---
            // Both upperarm bones share identical rest quaternion,
            // so SAME direction Y rotation brings both arms down
            if (bones.upperarmL) bones.upperarmL.rotation.y += 0.25;
            if (bones.upperarmR) bones.upperarmR.rotation.y += 0.25;

            // Slight elbow bend — left arm bent inward, right arm straight
            if (bones.lowerarmL) bones.lowerarmL.rotation.y -= 0.35;
            if (bones.lowerarmR) bones.lowerarmR.rotation.y += 0.05;

            // Save all baselines AFTER pose
            bones.spine.forEach((b, i) => save(`spine_${i}`, b));
            save('head', bones.head);
            save('neck', bones.neck);
            save('upperarmL', bones.upperarmL);
            save('upperarmR', bones.upperarmR);
            save('lowerarmL', bones.lowerarmL);
            save('lowerarmR', bones.lowerarmR);
            save('thighL', bones.thighL);
            save('thighR', bones.thighR);
            save('calfL', bones.calfL);
            save('calfR', bones.calfR);
            orig.current = map;
            if (bones.pelvis) origPelvisY.current = bones.pelvis.position.y;
        }
    }, [bones]);

    // Idle breathing + mouse follow
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const o = orig.current;

        // Smooth lerp mouse position
        const lerp = 0.03;
        mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * lerp;
        mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * lerp;
        const mx = mouseCurrent.current.x;
        const my = mouseCurrent.current.y;

        // Different frequencies for natural desync
        const headCycle = Math.sin(t * 0.7);
        const spineCycle = Math.sin(t * 1.0);
        const bodyCycle = Math.sin(t * 1.3);
        const armCycle = Math.sin(t * 1.1 + 0.5);
        const legCycle = Math.sin(t * 1.3 + 1.0);

        // Head: mouse follow + breathing
        // X = left/right turn, Y = up/down nod
        const h = o.get('head');
        if (h && bones.head) {
            bones.head.rotation.x = h.x + mx * 0.15;
            bones.head.rotation.y = h.y - my * 0.10 + headCycle * 0.015;
            bones.head.rotation.z = h.z;
        }
        const nk = o.get('neck');
        if (nk && bones.neck) {
            bones.neck.rotation.x = nk.x + mx * 0.06;
            bones.neck.rotation.y = nk.y - my * 0.04 + headCycle * 0.008;
            bones.neck.rotation.z = nk.z;
        }

        // Spine: breathing motion (Z = forward/back lean)
        bones.spine.forEach((bone, i) => {
            const s = o.get(`spine_${i}`);
            if (!s) return;
            bone.rotation.z = s.z + spineCycle * (0.006 + i * 0.003);
        });

        // Body vertical bob via pelvis
        if (bones.pelvis) {
            bones.pelvis.position.y = origPelvisY.current + bodyCycle * 0.003;
        }

        // Elbows: subtle bend/extend (same Y direction for both)
        const la = o.get('lowerarmL');
        if (la && bones.lowerarmL) {
            bones.lowerarmL.rotation.y = la.y + armCycle * 0.03;
        }
        const ra = o.get('lowerarmR');
        if (ra && bones.lowerarmR) {
            bones.lowerarmR.rotation.y = ra.y + armCycle * 0.03;
        }

        // Thighs: subtle flex (Z = forward/back)
        const tl = o.get('thighL');
        if (tl && bones.thighL) {
            bones.thighL.rotation.z = tl.z + legCycle * 0.008;
        }
        const tr = o.get('thighR');
        if (tr && bones.thighR) {
            bones.thighR.rotation.z = tr.z + legCycle * 0.008;
        }

        // Calves: compensate
        const cl = o.get('calfL');
        if (cl && bones.calfL) {
            bones.calfL.rotation.z = cl.z - legCycle * 0.01;
        }
        const cr = o.get('calfR');
        if (cr && bones.calfR) {
            bones.calfR.rotation.z = cr.z - legCycle * 0.01;
        }
    });

    return (
        <group ref={group} dispose={null}>
            <primitive
                object={scene}
                scale={3.5}
                position={[0, -4.8, 0]}
                rotation={[0, Math.PI * 0.1, 0]}
            />
        </group>
    );
}

useGLTF.preload('/model_final.glb');
