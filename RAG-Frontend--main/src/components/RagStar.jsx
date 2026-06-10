import React from 'react';

export default function RagStar({ size = 28, mode = 'idle' }) {
  // Perfect curved 4-pointed star vector path
  const pathData = "M 50,0 Q 50,38 88,50 Q 50,62 50,100 Q 50,62 12,50 Q 50,38 50,0 Z";

  const isThinking = mode === 'thinking';
  const isWelcome = mode === 'welcome';
  
  // Size of the halo behind the star: 3x the star size
  const haloSize = size * 3;

  return (
    <div style={styles.starContainer}>
      {/* Layer 5: Star Halo (radiates from behind, pulses, does not rotate) */}
      <div
        style={{
          width: `${haloSize}px`,
          height: `${haloSize}px`,
          ...styles.haloBase,
          ...(isWelcome ? {
            background: 'radial-gradient(circle at center, rgba(129, 140, 248, 0.4) 0%, rgba(167, 139, 250, 0.2) 35%, rgba(56, 189, 248, 0.08) 60%, transparent 80%)',
            filter: 'blur(20px)'
          } : {})
        }}
        className={`star-halo ${isThinking ? 'star-halo-thinking' : 'star-halo-idle'}`}
      />

      {isWelcome && (
        <div
          style={{
            width: `${haloSize * 1.5}px`,
            height: `${haloSize * 1.5}px`,
            ...styles.haloBase,
            background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.25) 0%, rgba(52, 211, 153, 0.1) 45%, transparent 75%)',
            filter: 'blur(32px)',
          }}
          className="star-halo star-halo-idle"
        />
      )}

      {/* The Star SVG (rotates and breathes) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={isThinking ? 'star-pulse-rotation' : (mode === 'idle' || mode === 'streaming') ? 'star-idle-anim' : ''}
        style={{
          zIndex: 2,
          position: 'relative'
        }}
      >
        <defs>
          <linearGradient id="ragStarGradV3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="35%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        <path
          d={pathData}
          fill="url(#ragStarGradV3)"
          className={isThinking ? 'star-grad-shift-fast' : 'star-grad-shift-slow'}
          style={{
            transformOrigin: 'center',
            backgroundSize: '200% 200%'
          }}
        />
      </svg>

    </div>
  );
}

const styles = {
  starContainer: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  haloBase: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'radial-gradient(circle at center, rgba(129, 140, 248, 0.35) 0%, rgba(52, 211, 153, 0.15) 40%, transparent 70%)',
    filter: 'blur(16px)',
    pointerEvents: 'none',
    zIndex: 1,
    transition: 'all 350ms var(--ease-spring)'
  },
  dotsRow: {
    position: 'absolute',
    top: '100%',
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    alignItems: 'center',
    height: '10px',
    marginTop: '8px',
    zIndex: 3
  }
};
