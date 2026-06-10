import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import RagStar from './RagStar';

function TokenCountAnimator({ count }) {
  const [prevCount, setPrevCount] = useState(count);
  const [animateKeys, setAnimateKeys] = useState({});

  useEffect(() => {
    if (count !== prevCount) {
      const newKeys = {};
      for (let i = 0; i < count.length; i++) {
        if (count[i] !== prevCount[i]) {
          newKeys[i] = Date.now() + i;
        }
      }
      setAnimateKeys(newKeys);
      setPrevCount(count);
    }
  }, [count, prevCount]);

  return (
    <div style={{ display: 'flex' }}>
      {count.split('').map((char, idx) => {
        const hasAnim = animateKeys[idx] !== undefined;
        return (
          <span 
            key={hasAnim ? animateKeys[idx] : `static-${idx}`} 
            className={hasAnim ? 'digit-flip-scale' : ''}
            style={{ display: 'inline-block' }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}

export default function TopBar({
  currentModel,
  onModelPillClick,
  onLogoClick,
  mobileDrawerOpen,
  setMobileDrawerOpen,
  isModelPillAnimating = false,
  tokenCount = '1,247'
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const modelConfig = {
    'gpt-4o': { name: 'GPT-4o', short: '4o', color: '#10B981' },
    'claude-3-5': { name: 'Claude 3.5', short: '3.5', color: '#F59E0B' },
    'gemini-pro': { name: 'Gemini Pro', short: 'Pro', color: '#4285F4' },
    'mixtral': { name: 'Mixtral', short: 'Mix', color: '#A78BFA' }
  };

  const selectedModel = modelConfig[currentModel] || modelConfig['gpt-4o'];

  // Haptic tick
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const toggleDrawer = () => {
    triggerHaptic();
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  if (isMobile) {
    /* ======================================================== */
    /* MOBILE TOP BAR                                           */
    /* ======================================================== */
    return (
      <header style={styles.topBar}>
        {/* Left Hamburger + Logo Group */}
        <div style={styles.leftGroupMobile}>
          <button style={styles.hamburgerBtn} onClick={toggleDrawer}>
            <Menu size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>

          <div style={styles.logoGroupMobile} onClick={onLogoClick}>
            <RagStar size={28} mode="streaming" />
            <span style={styles.logoTextMobile}>RAG</span>
          </div>
        </div>

        {/* Right Model Pill (Compact) + Token counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ ...styles.tokenPill, marginRight: 0, padding: '0 8px', height: '26px' }}>
            <div style={{ display: 'flex', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500, color: '#818CF8' }}>
              <TokenCountAnimator count={tokenCount} />
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {isModelPillAnimating && <div className="model-pill-bloom" style={{ width: '90px', height: '60px' }} />}
            <button
              style={styles.modelPillMobile}
              onClick={onModelPillClick}
              className={isModelPillAnimating ? 'model-pill-animating' : ''}
            >
              <span
                style={{
                  ...styles.modelDot,
                  backgroundColor: selectedModel.color
                }}
              />
              <span style={styles.modelNameMobile}>{selectedModel.short}</span>
            </button>

            {isModelPillAnimating && (
              <div className="model-pill-ring-container" style={{ width: '120px', height: '120px' }}>
                <svg className="model-pill-ring-svg" viewBox="0 0 120 120">
                  <circle 
                    className="model-pill-ring-circle" 
                    cx="60" 
                    cy="60" 
                    r="30"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  /* ======================================================== */
  /* DESKTOP TOP BAR                                          */
  /* ======================================================== */
  return (
    <header style={styles.topBar}>
      {/* Left logo wordmark */}
      <div style={styles.leftGroup} onClick={onLogoClick}>
        <RagStar size={28} mode="streaming" />
        <span style={styles.logoText}>RAG</span>
      </div>

      {/* Center Model Selector */}
      <div style={styles.centerGroup}>
        {isModelPillAnimating && <div className="model-pill-bloom" />}
        <button
          style={styles.modelPill}
          onClick={onModelPillClick}
          className={`hover-fast hover-spring ${isModelPillAnimating ? 'model-pill-animating' : ''}`}
        >
          <span
            style={{
              ...styles.modelDot,
              backgroundColor: selectedModel.color
            }}
          />
          <span style={styles.modelName}>{selectedModel.name}</span>
          <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
        </button>

        {isModelPillAnimating && (
          <div className="model-pill-ring-container">
            <svg className="model-pill-ring-svg" viewBox="0 0 180 180">
              <defs>
                <linearGradient id="localRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>
              <circle 
                className="model-pill-ring-circle" 
                cx="90" 
                cy="90" 
                r="45"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Right User Avatar + Token counter */}
      <div style={styles.rightGroup}>
        <div style={styles.tokenPill}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '10px', textTransform: 'uppercase', marginRight: '6px' }} className="chip-mono">tokens</span>
          <div style={{ display: 'flex', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500, color: '#818CF8' }}>
            <TokenCountAnimator count={tokenCount} />
          </div>
        </div>
        
        <div style={styles.avatar} className="hover-spring">
          DK
        </div>
      </div>
    </header>
  );
}

const styles = {
  topBar: {
    height: '52px',
    width: '100%',
    backgroundColor: 'var(--bg-void)',
    borderBottom: '1px solid var(--border-faint)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    position: 'relative',
    zIndex: 100,
    boxSizing: 'border-box'
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px', // star on left, wordmark on right, 8px gap
    cursor: 'pointer',
    userSelect: 'none'
  },
  hamburgerBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px', // mobile friendly target 44px
    height: '44px',
    borderRadius: '6px'
  },
  logoText: {
    fontFamily: 'var(--font-primary)',
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    letterSpacing: '+0.08em', // extra air tracking v3.0
    textTransform: 'uppercase'
  },
  centerGroup: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center'
  },
  modelPill: {
    height: '30px',
    padding: '0 14px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'border-color var(--t-fast), transform var(--t-fast)'
  },
  modelDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%'
  },
  modelName: {
    fontFamily: 'var(--font-primary)',
    fontSize: '13px',
    fontWeight: 400,
    color: 'var(--text-primary)'
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  tokenPill: {
    display: 'flex',
    alignItems: 'center',
    height: '30px',
    padding: '0 12px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    marginRight: '12px',
    boxSizing: 'border-box',
    userSelect: 'none'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #818CF8 0%, #38BDF8 35%, #34D399 70%, #A78BFA 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 500,
    color: '#070709',
    userSelect: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    transition: 'transform var(--t-fast)'
  },
  /* Mobile specific elements */
  logoGroupMobile: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  logoTextMobile: {
    fontFamily: 'var(--font-primary)',
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    letterSpacing: '+0.08em',
    textTransform: 'uppercase'
  },
  modelPillMobile: {
    height: '30px',
    padding: '0 10px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer'
  },
  modelNameMobile: {
    fontFamily: 'var(--font-primary)',
    fontSize: '12px',
    fontWeight: 400,
    color: 'var(--text-primary)'
  },
  leftGroupMobile: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }
};
