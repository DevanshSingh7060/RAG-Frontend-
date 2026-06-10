import React, { useState, useEffect } from 'react';
import { MessageSquare, Database, BarChart2, Settings, Menu, X, User } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileDrawerOpen,
  setMobileDrawerOpen,
  indexedDocsCount = 3,
  recentChats = [],
  onNewChat
}) {
  const [hoveredTab, setHoveredTab] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Resize listener for mobile responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'knowledge', label: 'Knowledge', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 }
  ];

  // Haptic trigger helper
  const triggerHaptic = (type) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'light') navigator.vibrate(20);
      else if (type === 'medium') navigator.vibrate(40);
      else if (type === 'selection') navigator.vibrate(10);
    }
  };

  const handleTabClick = (tabId) => {
    triggerHaptic('selection');
    setActiveTab(tabId);
    setMobileDrawerOpen(false);
  };

  // If view is mobile: render bottom navigation bar + mobile drawer sheet
  if (isMobile) {
    return (
      <>
        {/* MOBILE BOTTOM NAVIGATION BAR (Height 56px + Safe Area Bottom) */}
        <nav style={styles.mobileBottomNav} className="safe-bottom-nav">
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="sidebarActiveGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="35%" stopColor="#38BDF8" />
                <stop offset="70%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
          </svg>

          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                style={styles.mobileNavBtn}
                onClick={() => handleTabClick(item.id)}
              >
                <Icon
                  size={20}
                  stroke={isActive ? 'url(#sidebarActiveGradMobile)' : 'var(--text-muted)'}
                />
                <span 
                  style={{
                    ...styles.mobileNavLabel,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                  className="micro-caps"
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
            style={styles.mobileNavBtn}
            onClick={() => handleTabClick('settings')}
          >
            <Settings
              size={20}
              stroke={activeTab === 'settings' ? 'url(#sidebarActiveGradMobile)' : 'var(--text-muted)'}
            />
            <span 
              style={{
                ...styles.mobileNavLabel,
                color: activeTab === 'settings' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              className="micro-caps"
            >
              Settings
            </span>
          </button>
        </nav>

        {/* MOBILE DRAWER DRAWER OVERLAY */}
        {mobileDrawerOpen && (
          <>
            <div style={styles.drawerBackdrop} onClick={() => setMobileDrawerOpen(false)}></div>
            <div style={styles.drawerSheet}>
              {/* Drawer Header */}
              <div style={styles.drawerHeader}>
                <div style={styles.drawerTitle} className="label-caps-500">Navigation Menu</div>
                <button 
                  style={styles.drawerCloseBtn} 
                  onClick={() => { triggerHaptic('light'); setMobileDrawerOpen(false); }}
                >
                  <X size={18} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>

              {/* Drawer Menu List */}
              <div style={styles.drawerList}>
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      style={{
                        ...styles.drawerRow,
                        backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent'
                      }}
                      onClick={() => handleTabClick(item.id)}
                    >
                      <Icon size={18} stroke={isActive ? 'url(#sidebarActiveGradMobile)' : 'var(--text-secondary)'} style={{ marginRight: '12px' }} />
                      <span style={{ ...styles.drawerRowText, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Drawer Workspace details */}
              <div style={styles.drawerSection}>
                <span style={styles.drawerSecHeader} className="micro-caps">Collections</span>
                <div style={styles.drawerSecContent}>
                  <div style={styles.drawerMetaItem} className="caption">
                    📁 Project Docs ({indexedDocsCount} docs)
                  </div>
                  <div style={styles.drawerMetaItem} className="caption">
                    📁 Research Papers (8 docs)
                  </div>
                </div>
              </div>

              {/* Bottom user card inside Mobile Drawer */}
              <div style={styles.drawerFooter}>
                <div style={styles.drawerUserRow}>
                  <div style={styles.drawerAvatar}>DK</div>
                  <div style={styles.drawerUserInfo}>
                    <span style={styles.drawerUserName}>Devan K.</span>
                    <span style={styles.drawerUserRole} className="micro-caps">Workspace Owner</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // DESKTOP RAIL RENDERING
  return (
    <aside style={styles.sidebar}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="sidebarActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="35%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top Stack */}
      <div style={styles.topStack}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isHovered = hoveredTab === item.id;

          return (
            <div
              key={item.id}
              style={styles.itemWrapper}
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <button
                style={{
                  ...styles.iconBtn,
                  backgroundColor: isActive ? 'var(--bg-hover)' : isHovered ? 'var(--bg-hover)' : 'transparent'
                }}
                className="hover-micro"
                onClick={() => handleTabClick(item.id)}
              >
                <Icon
                  size={20}
                  stroke={isActive ? 'url(#sidebarActiveGrad)' : isHovered ? 'var(--text-secondary)' : 'var(--text-muted)'}
                  style={{ transition: 'stroke 100ms var(--ease-standard)' }}
                />
              </button>

              {isHovered && (
                <div style={styles.tooltip} className="caption">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Settings */}
      <div 
        style={styles.bottomStack}
        onMouseEnter={() => setHoveredTab('settings')}
        onMouseLeave={() => setHoveredTab(null)}
      >
        <div style={styles.itemWrapper}>
          <button
            style={{
              ...styles.iconBtn,
              backgroundColor: activeTab === 'settings' ? 'var(--bg-hover)' : hoveredTab === 'settings' ? 'var(--bg-hover)' : 'transparent'
            }}
            className="hover-micro"
            onClick={() => handleTabClick('settings')}
          >
            <Settings
              size={20}
              stroke={activeTab === 'settings' ? 'url(#sidebarActiveGrad)' : hoveredTab === 'settings' ? 'var(--text-secondary)' : 'var(--text-muted)'}
              style={{ transition: 'stroke 100ms var(--ease-standard)' }}
            />
          </button>
          {hoveredTab === 'settings' && (
            <div style={styles.tooltip} className="caption">
              Settings
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '64px',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 0',
    height: '100%',
    zIndex: 10,
    position: 'relative'
  },
  topStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
    width: '100%'
  },
  bottomStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%'
  },
  itemWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    boxSizing: 'border-box'
  },
  tooltip: {
    position: 'absolute',
    left: '56px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
    padding: '4px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    animation: 'wordStreamReveal 150ms var(--ease-expo-out) forwards'
  },
  /* Mobile Bottom Nav Bar */
  mobileBottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '56px',
    backgroundColor: 'var(--bg-surface)',
    borderTop: '1px solid var(--border-faint)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 90,
    boxShadow: '0 -4px 16px rgba(0,0,0,0.2)'
  },
  mobileNavBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '60px',
    height: '100%',
    gap: '3px'
  },
  mobileNavLabel: {
    fontSize: '9px',
    fontWeight: 500
  },
  /* Mobile Drawer Sheet */
  drawerBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 990,
    animation: 'wordStreamReveal 280ms var(--ease-expo-out)'
  },
  drawerSheet: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '280px',
    backgroundColor: 'var(--bg-elevated)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    zIndex: 1000,
    boxShadow: '8px 0 24px rgba(0,0,0,0.5)',
    animation: 'wordStreamReveal 280ms var(--ease-spring)',
    transformOrigin: 'left'
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px'
  },
  drawerTitle: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  drawerCloseBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none'
  },
  drawerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '28px'
  },
  drawerRow: {
    height: '44px',
    borderRadius: '10px',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box'
  },
  drawerRowText: {
    fontFamily: 'var(--font-primary)',
    fontSize: '14px',
    fontWeight: 500
  },
  drawerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '28px',
    borderTop: '1px solid var(--border-faint)',
    paddingTop: '20px'
  },
  drawerSecHeader: {
    color: 'var(--text-muted)'
  },
  drawerSecContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '8px'
  },
  drawerMetaItem: {
    color: 'var(--text-secondary)'
  },
  drawerFooter: {
    marginTop: 'auto',
    borderTop: '1px solid var(--border-faint)',
    paddingTop: '16px'
  },
  drawerUserRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  drawerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #818CF8 0%, #38BDF8 35%, #34D399 70%, #A78BFA 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 500,
    color: '#070709'
  },
  drawerUserInfo: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
  drawerUserName: {
    fontFamily: 'var(--font-primary)',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)'
  },
  drawerUserRole: {
    color: 'var(--text-muted)',
    fontSize: '9px'
  }
};
