import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, BookOpen, Folder, Database, BarChart2, Settings, 
  X, LogOut, ChevronUp, MessageSquare
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileDrawerOpen,
  setMobileDrawerOpen,
  indexedDocsCount = 3,
  recentChats = [],
  onNewChat,
  onSelectRecentChat
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const profileMenuRef = useRef(null);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Click outside profile menu listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerHaptic = (type) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'light') navigator.vibrate(15);
      else if (type === 'medium') navigator.vibrate(35);
      else if (type === 'selection') navigator.vibrate(10);
    }
  };

  const handleTabClick = (tabId) => {
    triggerHaptic('selection');
    setActiveTab(tabId);
    setMobileDrawerOpen(false);
  };

  const handleRecentClick = (chatId) => {
    triggerHaptic('selection');
    if (onSelectRecentChat) {
      onSelectRecentChat(chatId);
    }
    setMobileDrawerOpen(false);
  };

  // Filter recents based on query
  const filteredChats = recentChats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Core navigation items list (ChatGPT Style)
  const navItems = [
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'knowledge', label: 'Knowledge', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 }
  ];

  /* ========================================================== */
  /* SHARED SIDEBAR RENDER CONTENT                              */
  /* ========================================================== */
  const renderSidebarContent = () => (
    <div style={styles.contentWrapper}>
      {/* Top Stack */}
      <div style={styles.topSection}>
        {/* New Chat Button */}
        <button 
          style={styles.newChatBtn}
          className="hover-spring"
          onClick={() => {
            triggerHaptic('medium');
            onNewChat();
            setMobileDrawerOpen(false);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Plus size={18} style={{ color: 'var(--text-primary)' }} />
            <span style={{ fontWeight: 500, fontSize: '13.5px' }}>New chat</span>
          </div>
          <span style={styles.shortcutText}>⌘N</span>
        </button>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Navigation List */}
      <div style={styles.navList}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`sidebar-item-container ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recents list (ChatGPT-style scrollable) */}
      <div style={styles.recentsSection}>
        <div style={styles.recentsHeader} className="label-caps-500">Recents</div>
        
        <div style={styles.recentsScrollContainer} className="sidebar-recents-scrollbar">
          {filteredChats.length > 0 ? (
            filteredChats.map(chat => {
              const isHovered = hoveredChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  style={styles.recentItemWrapper}
                  onMouseEnter={() => setHoveredChatId(chat.id)}
                  onMouseLeave={() => setHoveredChatId(null)}
                  onClick={() => handleRecentClick(chat.id)}
                >
                  <div style={styles.recentTextContainer}>
                    <MessageSquare size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={styles.recentTitle}>{chat.title}</span>
                  </div>
                  
                  {/* Timestamp visible on hover */}
                  <span 
                    style={{
                      ...styles.recentTimestamp,
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translateX(0)' : 'translateX(4px)'
                    }}
                  >
                    {chat.timestamp}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={styles.noRecentsText}>No matching chats</div>
          )}
        </div>
      </div>

      {/* Bottom Profile section with interactive options dropdown */}
      <div style={styles.bottomSection} ref={profileMenuRef}>
        {/* Settings button just above profile card */}
        <button
          onClick={() => handleTabClick('settings')}
          className={`sidebar-item-container ${activeTab === 'settings' ? 'active' : ''}`}
          style={{ marginBottom: '8px' }}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        {/* Profile Card Option Popover */}
        {profileMenuOpen && (
          <div style={styles.profilePopover}>
            <button 
              style={styles.popoverItem}
              onClick={() => {
                setProfileMenuOpen(false);
                handleTabClick('settings');
              }}
            >
              <Settings size={14} style={{ marginRight: '8px' }} />
              <span>Settings Configuration</span>
            </button>
            <div style={styles.popoverDivider}></div>
            <button 
              style={{ ...styles.popoverItem, color: '#F43F5E' }}
              onClick={() => {
                triggerHaptic('light');
                setProfileMenuOpen(false);
                window.location.reload();
              }}
            >
              <LogOut size={14} style={{ marginRight: '8px' }} />
              <span>Log out</span>
            </button>
          </div>
        )}

        {/* Profile Card */}
        <div 
          style={styles.profileCard} 
          onClick={() => {
            triggerHaptic('light');
            setProfileMenuOpen(!profileMenuOpen);
          }}
        >
          <div style={styles.profileLeft}>
            <div style={styles.avatar}>DS</div>
            <div style={styles.profileInfo}>
              <span style={styles.profileName}>Devansh Singh</span>
              <span style={styles.profilePlan}>Premium Tier</span>
            </div>
          </div>
          <ChevronUp size={14} style={{ color: 'var(--text-secondary)' }} />
        </div>
      </div>
    </div>
  );

  /* ========================================================== */
  /* MOBILE RENDER (Bottom Navigation Bar + Drawer)             */
  /* ========================================================== */
  if (isMobile) {
    return (
      <>
        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav style={styles.mobileBottomNav} className="safe-bottom-nav">
          <button
            style={styles.mobileNavBtn}
            onClick={() => handleTabClick('chat')}
          >
            <MessageSquare
              size={20}
              stroke={activeTab === 'chat' ? '#818CF8' : 'var(--text-muted)'}
            />
            <span style={{ ...styles.mobileNavLabel, color: activeTab === 'chat' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              Chat
            </span>
          </button>
          <button
            style={styles.mobileNavBtn}
            onClick={() => handleTabClick('knowledge')}
          >
            <Database
              size={20}
              stroke={activeTab === 'knowledge' ? '#818CF8' : 'var(--text-muted)'}
            />
            <span style={{ ...styles.mobileNavLabel, color: activeTab === 'knowledge' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              Knowledge
            </span>
          </button>
          <button
            style={styles.mobileNavBtn}
            onClick={() => handleTabClick('analytics')}
          >
            <BarChart2
              size={20}
              stroke={activeTab === 'analytics' ? '#818CF8' : 'var(--text-muted)'}
            />
            <span style={{ ...styles.mobileNavLabel, color: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              Analytics
            </span>
          </button>
          <button
            style={styles.mobileNavBtn}
            onClick={() => handleTabClick('settings')}
          >
            <Settings
              size={20}
              stroke={activeTab === 'settings' ? '#818CF8' : 'var(--text-muted)'}
            />
            <span style={{ ...styles.mobileNavLabel, color: activeTab === 'settings' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              Settings
            </span>
          </button>
        </nav>

        {/* MOBILE DRAWER SHEET (ChatGPT Style) */}
        {mobileDrawerOpen && (
          <>
            <div style={styles.drawerBackdrop} onClick={() => setMobileDrawerOpen(false)}></div>
            <div style={styles.drawerSheet} className="custom-scrollbar">
              <div style={styles.drawerHeader}>
                <span className="label-caps-500" style={{ fontSize: '10px' }}>RAG Workspace</span>
                <button 
                  style={styles.drawerCloseBtn} 
                  onClick={() => { triggerHaptic('light'); setMobileDrawerOpen(false); }}
                >
                  <X size={18} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>
              
              {renderSidebarContent()}
            </div>
          </>
        )}
      </>
    );
  }

  /* ========================================================== */
  /* DESKTOP RENDER (260px wide Sidebar)                       */
  /* ========================================================== */
  return (
    <aside style={styles.sidebar}>
      {renderSidebarContent()}
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-subtle)',
    height: '100%',
    zIndex: 10,
    position: 'relative',
    boxSizing: 'border-box'
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '16px 12px',
    boxSizing: 'border-box'
  },
  topSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px'
  },
  newChatBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 200ms var(--ease-spring)',
    outline: 'none',
    boxSizing: 'border-box'
  },
  shortcutText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-faint)',
    padding: '2px 4px',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-void)'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    padding: '0 12px',
    height: '36px',
    width: '100%',
    boxSizing: 'border-box'
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontFamily: 'var(--font-primary)'
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-faint)',
    paddingBottom: '16px'
  },
  recentsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    marginBottom: '16px'
  },
  recentsHeader: {
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '8px',
    paddingLeft: '12px',
    textAlign: 'left'
  },
  recentsScrollContainer: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingRight: '4px'
  },
  recentItemWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    userSelect: 'none',
    boxSizing: 'border-box'
  },
  recentTextContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    overflow: 'hidden',
    flex: 1
  },
  recentTitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left'
  },
  recentTimestamp: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    transition: 'opacity 180ms ease, transform 180ms ease',
    flexShrink: 0,
    marginLeft: '6px'
  },
  noRecentsText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    paddingTop: '20px'
  },
  bottomSection: {
    borderTop: '1px solid var(--border-faint)',
    paddingTop: '12px',
    position: 'relative'
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'background-color 180ms ease',
    backgroundColor: 'transparent',
    boxSizing: 'border-box'
  },
  profileLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    overflow: 'hidden'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #818CF8 0%, #38BDF8 35%, #34D399 70%, #A78BFA 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 500,
    color: '#070709',
    flexShrink: 0
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    textAlign: 'left'
  },
  profileName: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  profilePlan: {
    fontSize: '10px',
    color: 'var(--text-secondary)'
  },
  profilePopover: {
    position: 'absolute',
    bottom: '60px',
    left: '12px',
    right: '12px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '6px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    boxSizing: 'border-box'
  },
  popoverItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '12.5px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    textAlign: 'left'
  },
  popoverDivider: {
    height: '1px',
    backgroundColor: 'var(--border-faint)',
    margin: '4px 0'
  },
  /* Mobile elements */
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
    backgroundColor: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    boxShadow: '8px 0 24px rgba(0,0,0,0.5)',
    animation: 'wordStreamReveal 280ms var(--ease-spring)',
    transformOrigin: 'left'
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 16px 8px',
    borderBottom: '1px solid var(--border-faint)'
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
  }
};
