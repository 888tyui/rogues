'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

const CharacterScene = dynamic(
    () => import('@/components/CharacterScene'),
    { ssr: false }
);

export default function Home() {
    const [loaded, setLoaded] = useState(false);
    const [showContent, setShowContent] = useState(false);

    const handleLoaded = useCallback(() => {
        // Small delay to ensure first frame renders
        setTimeout(() => setLoaded(true), 300);
    }, []);

    // After the scene loads, trigger scene load callback
    useEffect(() => {
        // Fallback: auto-dismiss loader after 8 seconds
        const timeout = setTimeout(() => setLoaded(true), 3000);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (loaded) {
            const t = setTimeout(() => setShowContent(true), 400);
            return () => clearTimeout(t);
        }
    }, [loaded]);

    return (
        <main className="landing-container">
            {/* Loading screen */}
            <div className={`loading-screen ${loaded ? 'loaded' : ''}`}>
                <div className="loading-title">
                    {[{ l: 'R', y: 0, ml: 0 }, { l: 'o', y: 8, ml: -3 }, { l: 'u', y: 8, ml: -2 }, { l: 'g', y: 8, ml: -2 }, { l: 'e', y: 8, ml: -3 }, { l: 's', y: 8, ml: -2 }].map((c, i) => (
                        <span key={i} className="loading-letter" style={{
                            animationDelay: `${i * 0.15}s`,
                            '--offset-y': `${c.y}px`,
                            marginLeft: `${c.ml}px`
                        } as React.CSSProperties}>{c.l}</span>
                    ))}
                </div>
                <div className="loading-bar-container">
                    <div className="loading-bar" />
                </div>
            </div>

            {/* Fire glow overlay */}
            <div className="fire-glow" />

            {/* Centered UI — title + subtitle + buttons */}
            <div className="title-layer" style={{
                opacity: showContent ? 1 : 0,
                transition: 'opacity 1s ease',
            }}>
                <h1 className="game-title">Rouges</h1>
                <div className="title-divider" />
                <p className="subtitle">The PvP Dungeon Crawler Experience — Web3</p>
                <div className="action-buttons">
                    <a className="action-btn" id="twitter-btn" href="#" title="Twitter">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span>Twitter</span>
                    </a>
                    <a className="action-btn disabled" id="token-btn" title="$ROGUE">
                        <span>$ROGUE</span>
                    </a>
                    <a className="action-btn primary disabled" id="game-btn" title="Enter Game">
                        <span>Enter Game</span>
                    </a>
                </div>
            </div>

            {/* Vignette overlay */}
            <div className="vignette" />

            {/* 3D Scene */}
            <div className="canvas-layer">
                <CharacterScene onLoaded={handleLoaded} />
            </div>

            {/* Bottom gradient */}
            <div className="bottom-fade" />
        </main>
    );
}
