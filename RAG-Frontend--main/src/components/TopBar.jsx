import React, { useState, useEffect } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import RagStar from './RagStar';

export default function TopBar({
  currentModel,
  onModelPillClick,
  onLogoClick,
  mobileDrawerOpen,
  setMobileDrawerOpen
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

        {/* Right Model Pill (Compact) */}
        <button
          style={styles.modelPillMobile}
          onClick={onModelPillClick}
        >
          <span
            style={{
              ...styles.modelDot,
              backgroundColor: selectedModel.color
            }}
          />
          <span style={styles.modelNameMobile}>{selectedModel.short}</span>
        </button>
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
        <button
          style={styles.modelPill}
          onClick={onModelPillClick}
          className="hover-fast hover-spring"
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
      </div>

      {/* Right User Avatar */}
      <div style={styles.rightGroup}>
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
