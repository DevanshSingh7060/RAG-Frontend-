import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ModelPicker from './components/ModelPicker';
import MainChat from './components/MainChat';
import KnowledgePage from './components/KnowledgePage';
import AnalyticsPage from './components/AnalyticsPage';
import RagStar from './components/RagStar';
import { ArrowUp, Paperclip } from 'lucide-react';




export default function App() {
  // Cinematic Intro flags (first-load localStorage bypass)
  const [playIntro, setPlayIntro] = useState(() => {
    try {
      const played = localStorage.getItem('rag_v2_4_intro_played');
      return !played;
    } catch (e) {
      return true;
    }
  });

  // Views & Routes
  const [view, setView] = useState('landing'); // 'landing' | 'app'
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'knowledge' | 'analytics' | 'settings'
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isModelPillAnimating, setIsModelPillAnimating] = useState(false);


  // Model Picker Settings
  const [currentModel, setCurrentModel] = useState('gpt-4o');
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [autoRoute, setAutoRoute] = useState(true);
  const [isModelSwitching, setIsModelSwitching] = useState(false);
  const [isDarkReset, setIsDarkReset] = useState(false);
  const [isFullGlowActive, setIsFullGlowActive] = useState(false);
  const [isTracerFading, setIsTracerFading] = useState(false);

  // Ingested metrics
  const [indexedDocsCount, setIndexedDocsCount] = useState(3);
  const [tokenCount, setTokenCount] = useState('1,247');

  // Landing Input text area
  const [landingInput, setLandingInput] = useState('');
  const [isLandingFocused, setIsLandingFocused] = useState(false);

  // Pre-expanded rows for Analytics routing
  const [preExpandedRowId, setPreExpandedRowId] = useState(null);

  // Star Layout-Aware Traveling Transition v3.0
  const [isStarTraveling, setIsStarTraveling] = useState(false);
  const [starTravelCoords, setStarTravelCoords] = useState({
    top: 'calc(50vh - 100px)',
    left: 'calc(50vw - 24px)',
    size: 48
  });

  // Chat message histories
  const [messages, setMessages] = useState([]);

  // Sidebar Recent Logs
  const recentChats = [
    { id: 'chat-1', title: 'Roadmap Milestone alignment', timestamp: '2h ago' },
    { id: 'chat-2', title: 'Threshold validation research', timestamp: '1d ago' },
    { id: 'chat-3', title: 'Latency metrics analysis', timestamp: '3d ago' }
  ];

  // Mock document evidence database
  const mockSources = [
    { id: '1', filename: 'Q3_Product_Roadmap.pdf', page: 4 },
    { id: '2', filename: 'RAG_Confidence_Thresholds.md', page: 12 },
    { id: '3', filename: 'Embeddings_Performance_Study.txt', page: 47 }
  ];

  // Mobile viewport width listener
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Welcome Cinematic Intro Timeline v3.5
  const [introStep, setIntroStep] = useState(playIntro ? 'void' : 'settled');
  const [introStarCoords, setIntroStarCoords] = useState({
    top: isMobile ? 'calc(50vh - 80px)' : 'calc(50vh - 110px)',
    left: 'calc(50vw - 40px)', // 80px star center
    size: 80,
    opacity: 0,
    scale: 0.4
  });

  const [pulseGlow, setPulseGlow] = useState(!playIntro);
  useEffect(() => {
    if (!playIntro) {
      const timer = setTimeout(() => setPulseGlow(false), 400); // 350-450ms glow pulse
      return () => clearTimeout(timer);
    }
  }, [playIntro]);

  // keydown handler for new chat shortcuts (⌘N, Ctrl+Alt+N, Alt+N)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.metaKey && e.key.toLowerCase() === 'n') ||
        (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'n') ||
        (e.altKey && e.key.toLowerCase() === 'n')
      ) {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  useEffect(() => {
    if (!playIntro) return;

    // Timer 1: void -> welcome (after 100ms)
    const t1 = setTimeout(() => {
      setIntroStep('welcome');
      setIntroStarCoords(prev => ({
        ...prev,
        opacity: 1,
        scale: 1
      }));
    }, 100);

    // Timer 2: welcome -> transitioning (after 1600ms - ChatGPT v3.5 Spec)
    const t2 = setTimeout(() => {
      setIntroStep('transitioning');
      setIntroStarCoords({
        top: isMobile ? '28px' : '36px',
        left: isMobile ? '32px' : '40px',
        size: 80,
        opacity: 1,
        scale: 28 / 80 // Scale down to 28px logo
      });
    }, 1600);

    // Timer 3: transitioning -> settled (after 2200ms)
    const t3 = setTimeout(() => {
      setIntroStep('settled');
      setPlayIntro(false);
      try {
        localStorage.setItem('rag_v2_4_intro_played', 'true');
      } catch (e) { }
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [playIntro, isMobile]);

  // Mobile Edge Swipe touchstart trackers
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;

    // Swipe right from left edge (within 50px X margin, diffX > 80px)
    if (touchStartX.current < 50 && diffX > 80 && Math.abs(diffY) < 40) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
      setMobileDrawerOpen(true);
    }
  };

  // Vibrate ticks
  const triggerHaptic = (type) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'light') navigator.vibrate(15);
      else if (type === 'medium') navigator.vibrate(40);
      else if (type === 'selection') navigator.vibrate(10);
    }
  };

  const handleIntroComplete = () => {
    try {
      localStorage.setItem('rag_v2_4_intro_played', 'true');
    } catch (e) { }
    setPlayIntro(false);
  };

  // Sequenced streaming
  const streamAIResponse = (userPrompt) => {
    const userMsgId = `user-msg-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      role: 'user',
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const assistantMsgId = `assistant-msg-${Date.now()}`;
    const assistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isThinking: true,
      isStreaming: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: currentModel === 'gpt-4o' ? 'GPT-4o' : currentModel === 'claude-3-5' ? 'Claude 3.5' : currentModel === 'gemini-pro' ? 'Gemini Pro' : 'Mixtral'
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);

    // Star thinking vibration rhythm triggers (Android vibration)
    let thinkingVibrateTimer;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      thinkingVibrateTimer = setInterval(() => {
        navigator.vibrate(8);
      }, 3000); // rhythmic tick every 3s
    }

    setTimeout(async () => {
      clearInterval(thinkingVibrateTimer);
      triggerHaptic('light'); // arrival tick
      const response = await fetch("http://127.0.0.1:8000/stream-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: userPrompt
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullText = "";


      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMsgId
            ? {
              ...msg,
              isThinking: false,
              isStreaming: true,
              content: ""
            }
            : msg
        )
      );

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);

        fullText += chunk.replace(/data:\s*/g, "");

        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMsgId
              ? {
                ...msg,
                content: fullText
              }
              : msg
          )
        );
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMsgId
            ? {
              ...msg,
              isStreaming: false
            }
            : msg
        )
      );
    }, 2000); // 2s pulsing loader
  };

  const handleNewChat = () => {
    triggerHaptic('medium');

    // Clear chat states and set back to landing
    setMessages([]);
    setTokenCount('1,247');
    setView('landing');
    setMobileDrawerOpen(false);

    // Trigger cinematic welcome intro overlay
    setIntroStep('void');
    setIntroStarCoords({
      top: isMobile ? 'calc(50vh - 80px)' : 'calc(50vh - 110px)',
      left: 'calc(50vw - 40px)',
      size: 80,
      opacity: 0,
      scale: 0.4
    });
    setPlayIntro(true);
  };

  const handleSelectRecentChat = (chatId) => {
    triggerHaptic('medium');
    setView('app');
    setActiveTab('chat');

    // Load custom mock message histories corresponding to the recent chat titles
    if (chatId === 'chat-1') {
      setMessages([
        { id: 'u1', role: 'user', content: 'Roadmap Milestone alignment', timestamp: '2h ago' },
        {
          id: 'a1',
          role: 'assistant',
          content: 'Based on the Q3 product roadmap, the primary milestones include vector indexing completion by next Tuesday and client-side streaming optimization. We verified that the dev build runs cleanly.',
          timestamp: '2h ago',
          model: 'GPT-4o'
        }
      ]);
      setTokenCount('1,247');
    } else if (chatId === 'chat-2') {
      setMessages([
        { id: 'u2', role: 'user', content: 'Threshold validation research', timestamp: '1d ago' },
        {
          id: 'a2',
          role: 'assistant',
          content: 'I analyzed confidence threshold score behavior. Standard retrieval hygiene requires a score above 80% to filter low-confidence nodes.',
          timestamp: '1d ago',
          model: 'Claude 3.5'
        }
      ]);
      setTokenCount('984');
    } else if (chatId === 'chat-3') {
      setMessages([
        { id: 'u3', role: 'user', content: 'Latency metrics analysis', timestamp: '3d ago' },
        {
          id: 'a3',
          role: 'assistant',
          content: 'Average query round-trip latency decreased by 12% to 834ms over the past week due to indexing improvements.',
          timestamp: '3d ago',
          model: 'Gemini Pro'
        }
      ]);
      setTokenCount('1,421');
    }
  };

  const handleSelectModel = (modelId) => {
    triggerHaptic('medium');

    // Trigger the localized model pill animation
    setIsModelPillAnimating(true);

    setTimeout(() => {
      setCurrentModel(modelId);
      triggerHaptic('light');
    }, 250);

    setTimeout(() => {
      setIsModelPillAnimating(false);
    }, 1000);
  };

  // Coordinate physical star travel transition Landing -> Chat v3.0
  const handleSendMessage = (text) => {
    triggerHaptic('medium');

    if (view === 'landing') {
      const centerSize = isMobile ? 40 : 48;
      // Initialize traveling star dummy at center star coordinates/size
      setStarTravelCoords({
        top: isMobile ? 'calc(50vh - 80px)' : 'calc(50vh - 100px)',
        left: isMobile ? 'calc(50vw - 20px)' : 'calc(50vw - 24px)',
        size: centerSize,
        scale: 1
      });
      setIsStarTraveling(true);

      // Trigger the slide + shrink transition to top bar in next frame
      setTimeout(() => {
        setStarTravelCoords({
          top: '12px',
          left: isMobile ? '64px' : '16px',
          size: centerSize,
          scale: 28 / centerSize
        });
      }, 0);

      // After 400ms spring travel finishes, reveal active conversation layout
      setTimeout(() => {
        setIsStarTraveling(false);
        setView('app');
        setActiveTab('chat');
        streamAIResponse(text);
      }, 400);
    } else {
      streamAIResponse(text);
    }
  };

  const handleLandingSubmit = () => {
    if (!landingInput.trim()) return;
    const prompt = landingInput;
    setLandingInput('');
    handleSendMessage(prompt);
  };

  const handleLandingKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLandingSubmit();
    }
  };

  // Click citation navigates to Analytics pre-expanded row
  const handleCitationClick = (num) => {
    setPreExpandedRowId(num);
    setActiveTab('analytics');
  };

  const handleUploadComplete = (filename) => {
    triggerHaptic('medium');
    setIndexedDocsCount(prev => prev + 1);
    setActiveTab('chat');
  };

  return (
    <div
      style={styles.appContainer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Stacked background gradients Layer 1-4 (Void bloom v2.4) */}
      <div
        className={`aurora-container ${view === 'app' ? 'chat-mode' : 'landing-mode'} ${isModelSwitching ? 'switching-active' : ''}`}
        style={{
          opacity: (introStep === 'void' || isDarkReset || isModelSwitching) ? 0 : 1,
          transition: isDarkReset ? 'opacity 180ms ease-out' : 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transform: introStep === 'void' ? 'translateY(150px) scale(0.9)' : 'translateY(0) scale(1)',
            transition: 'transform 2500ms cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'center bottom'
          }}
        >
          <div className="aurora-layer-2"></div>
          <div className="aurora-layer-3"></div>
        </div>
        <div className={`chat-aurora-overlay ${view === 'app' ? 'chat-aurora-active' : ''}`} />
      </div>

      {/* Gemini Bottom Breathing Gradient v2.9 */}
      <div
        className="bottom-breathing-gradient"
        style={{
          bottom: view === 'landing'
            ? '-30px'
            : (isMobile ? '100px' : '80px'),
          opacity: (introStep === 'void' || isDarkReset || isModelSwitching) ? 0 : 1,
          transition: isDarkReset ? 'opacity 180ms ease-out' : 'bottom 500ms var(--ease-spring), opacity 700ms var(--ease-standard)'
        }}
      />

      {/* RAG STAR PHYSICAL TRAVEL DUMMY */}
      {isStarTraveling && (
        <div
          style={{
            position: 'absolute',
            top: starTravelCoords.top,
            left: starTravelCoords.left,
            zIndex: 9999,
            transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: 'top left',
            transform: `scale(${starTravelCoords.scale ?? 1})`
          }}
        >
          <RagStar size={starTravelCoords.size} mode="streaming" />
        </div>
      )}

      {/* Traveling star during welcome intro sequence (v2.4) */}
      {playIntro && introStep !== 'settled' && introStep !== 'void' && (
        <div
          style={{
            position: 'absolute',
            top: introStarCoords.top,
            left: introStarCoords.left,
            zIndex: 10000,
            transition: 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'top left',
            pointerEvents: 'none',
            transform: `scale(${introStarCoords.scale ?? 1})`
          }}
        >
          <div className={(introStep === 'welcome' || introStep === 'transitioning') ? 'star-welcome-scale' : ''}>
            <div className={(introStep === 'welcome' || introStep === 'transitioning') ? 'star-welcome-rotate-linear' : ''}>
              <RagStar size={introStarCoords.size} mode={(introStep === 'welcome' || introStep === 'transitioning') ? 'welcome' : 'streaming'} />
            </div>
          </div>
        </div>
      )}

      {/* Cinematic Welcome Intro Overlay (v2.4) */}
      {playIntro && introStep !== 'settled' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#070709',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: introStep === 'transitioning' ? 0 : 1,
            pointerEvents: introStep === 'transitioning' ? 'none' : 'auto'
          }}
          onClick={() => {
            setIntroStep('settled');
            try {
              localStorage.setItem('rag_v2_4_intro_played', 'true');
            } catch (e) { }
          }}
        >
          {/* Welcome space for star (traveling star floats over this center layout) */}
          {introStep === 'welcome' && (
            <div
              style={{
                width: '82px',
                height: '82px',
                position: 'relative'
              }}
            >
              {/* Subtle ambient floating particles around the star */}
              <div className="ambient-particle" style={{ top: '-40px', left: '-50px', '--x-drift': '25px', '--y-drift': '-15px' }}></div>
              <div className="ambient-particle" style={{ top: '60px', left: '80px', '--x-drift': '-30px', '--y-drift': '-25px' }}></div>
              <div className="ambient-particle" style={{ top: '-10px', left: '60px', '--x-drift': '15px', '--y-drift': '20px' }}></div>
              <div className="ambient-particle" style={{ top: '50px', left: '-60px', '--x-drift': '-20px', '--y-drift': '30px' }}></div>
            </div>
          )}

          {/* Welcome Text below star */}
          {(introStep === 'welcome' || introStep === 'transitioning') && (
            <h1
              className="welcome-text-anim display-300"
              style={{
                color: 'var(--text-primary)',
                marginTop: '32px',
                fontSize: '36px',
                fontWeight: 300,
                letterSpacing: '-0.025em',
                textShadow: '0 0 16px rgba(129, 140, 248, 0.4)',
                transition: introStep === 'transitioning' ? 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                opacity: introStep === 'transitioning' ? 0 : 1,
                transform: introStep === 'transitioning' ? 'translateY(-20px)' : 'translateY(0)'
              }}
            >
              Welcome to RAG
            </h1>
          )}

          <div
            className="caption"
            style={{
              position: 'absolute',
              bottom: '32px',
              color: 'var(--text-muted)',
              fontSize: '11px'
            }}
          >
            tap to skip
          </div>
        </div>
      )}

      {view === 'landing' ? (
        /* ======================================================== */
        /* SCREEN 1: LANDING EXPERIENCE                             */
        /* ======================================================== */
        <div
          style={{ ...styles.landingLayout, padding: isMobile ? '16px' : '24px' }}
          className="settled-landing-fade-in"
        >
          {/* Top minimal bar */}
          <div
            style={{
              ...styles.landingTopBar,
              opacity: (introStep === 'settled' || introStep === 'transitioning') ? 1 : 0,
              transform: (introStep === 'settled' || introStep === 'transitioning') ? 'translateY(0)' : 'translateY(-12px)',
              transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Left aligned logo wordmark */}
            {!isStarTraveling && (
              <div style={styles.landingTopLeft}>
                {introStep === 'settled' ? (
                  <RagStar size={28} mode="streaming" />
                ) : (
                  <div style={{ width: '28px', height: '28px' }} />
                )}
                <span
                  style={{
                    ...styles.landingTopText,
                    opacity: (introStep === 'settled' || introStep === 'transitioning') ? 1 : 0,
                    transform: (introStep === 'settled' || introStep === 'transitioning') ? 'translateX(0)' : 'translateX(-8px)',
                    transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  RAG
                </span>
              </div>
            )}
            <div style={styles.landingTopRight}>
              <div style={styles.avatar} className="hover-spring">DK</div>
            </div>
          </div>

          {/* Central Question Box */}
          <div
            style={{
              ...styles.landingCenter,
              opacity: (introStep === 'settled' || introStep === 'transitioning') ? 1 : 0,
              transform: (introStep === 'settled' || introStep === 'transitioning') ? 'translateY(-40px)' : 'translateY(0px)',
              transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Star is hidden during physical travel animation to prevent duplicates */}
            {!isStarTraveling && introStep === 'settled' && (
              <div style={styles.landingStarBox} className={pulseGlow ? 'subsequent-glow-pulse' : ''}>
                <RagStar size={isMobile ? 40 : 48} mode="idle" />
              </div>
            )}
            <h2 style={styles.landingGreeting} className="display-300">
              Where should we start?
            </h2>

            {/* Input Pill bar */}
            <div
              style={{
                ...styles.heroInputContainer,
                height: isMobile ? '56px' : '60px',
                width: isMobile ? '100%' : '680px',
                borderColor: isLandingFocused ? 'rgba(129, 140, 248, 0.4)' : 'var(--border-subtle)',
                boxShadow: isLandingFocused
                  ? '0 0 0 1px rgba(129, 140, 248, 0.25), 0 0 32px rgba(129, 140, 248, 0.08), 0 0 64px rgba(52, 211, 153, 0.04)'
                  : '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)'
              }}
              className={isLandingFocused ? 'premium-border-input premium-border-input-focus' : 'premium-border-input'}
            >
              <button style={styles.landingAttachBtn} onClick={() => { triggerHaptic('selection'); setView('app'); setActiveTab('knowledge'); }}>
                <Paperclip size={18} style={{ color: 'var(--text-muted)' }} />
              </button>
              <input
                type="text"
                value={landingInput}
                onChange={(e) => setLandingInput(e.target.value)}
                onKeyDown={handleLandingKeyDown}
                onFocus={() => setIsLandingFocused(true)}
                onBlur={() => setIsLandingFocused(false)}
                placeholder="Ask RAG anything..."
                style={styles.heroInput}
                className="gradient-placeholder"
              />
              <button
                style={{
                  ...styles.heroSendBtn,
                  background: landingInput.trim()
                    ? 'linear-gradient(135deg, #818CF8, #38BDF8, #34D399)'
                    : 'var(--bg-elevated)',
                  border: landingInput.trim() ? 'none' : '1px solid var(--border-subtle)',
                  boxShadow: landingInput.trim() ? '0 0 12px rgba(129,140,248,0.4)' : 'none'
                }}
                className={landingInput.trim() ? 'star-grad-shift-slow' : ''}
                disabled={!landingInput.trim()}
                onClick={handleLandingSubmit}
              >
                <ArrowUp size={16} style={{ color: landingInput.trim() ? '#070709' : 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Suggestions */}
            <div style={{ ...styles.landingSuggestions, gap: isMobile ? '8px' : '10px' }}>
              <button
                style={{ ...styles.suggestionPill, height: isMobile ? '44px' : '32px', padding: isMobile ? '0 12px' : '0 16px' }}
                className="hover-micro premium-border-pill"
                onClick={() => handleSendMessage("Summarize my documents")}
              >
                Summarize my documents
              </button>
              <button
                style={{ ...styles.suggestionPill, height: isMobile ? '44px' : '32px', padding: isMobile ? '0 12px' : '0 16px' }}
                className="hover-micro premium-border-pill"
                onClick={() => handleSendMessage("Find key insights")}
              >
                Find key insights
              </button>
              <button
                style={{ ...styles.suggestionPill, height: isMobile ? '44px' : '32px', padding: isMobile ? '0 12px' : '0 16px' }}
                className="hover-micro premium-border-pill"
                onClick={() => handleSendMessage("Compare research")}
              >
                Compare research
              </button>
            </div>
          </div>

          {/* Bottom indicator */}
          <div
            style={{
              ...styles.landingFooter,
              opacity: (introStep === 'settled' || introStep === 'transitioning') ? 1 : 0,
              transform: (introStep === 'settled' || introStep === 'transitioning') ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <span className="heartbeat-dot"></span>
            <span style={styles.footerText} className="metadata-400">
              {indexedDocsCount} documents indexed · Knowledge base ready
            </span>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* SCREEN 2: ACTIVE CONVERSATION WORKSPACE                  */
        /* ======================================================== */
        <div style={styles.appShell}>
          {/* Top Bar */}
          <TopBar
            currentModel={currentModel}
            onModelPillClick={() => { triggerHaptic('selection'); setModelPickerOpen(!modelPickerOpen); }}
            onLogoClick={() => setView('landing')}
            mobileDrawerOpen={mobileDrawerOpen}
            setMobileDrawerOpen={setMobileDrawerOpen}
            isModelPillAnimating={isModelPillAnimating}
            tokenCount={tokenCount}
          />

          {/* Floating Model Picker popover */}
          {modelPickerOpen && (
            <ModelPicker
              currentModel={currentModel}
              onSelectModel={handleSelectModel}
              onClose={() => setModelPickerOpen(false)}
              autoRoute={autoRoute}
              onToggleAutoRoute={() => setAutoRoute(!autoRoute)}
            />
          )}

          {/* Sidebar + Viewport Grid */}
          <div style={styles.mainLayout}>
            {/* Sidebar rail (hides on mobile, handles gestures/drawers) */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              mobileDrawerOpen={mobileDrawerOpen}
              setMobileDrawerOpen={setMobileDrawerOpen}
              indexedDocsCount={indexedDocsCount}
              recentChats={recentChats}
              onNewChat={handleNewChat}
              onSelectRecentChat={handleSelectRecentChat}
            />

            {/* Inner view routing */}
            <main style={styles.viewContent}>
              {activeTab === 'chat' && (
                <MainChat
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  currentModel={currentModel === 'gpt-4o' ? 'GPT-4o' : currentModel === 'claude-3-5' ? 'Claude 3.5' : currentModel === 'gemini-pro' ? 'Gemini Pro' : 'Mixtral'}
                  onOpenModelPicker={() => setModelPickerOpen(true)}
                  activeKbDocsCount={indexedDocsCount}
                  onSuggestionClick={handleSendMessage}
                  onOpenUpload={() => setActiveTab('knowledge')}
                  onCitationClick={handleCitationClick}
                  playIntro={playIntro}
                  onIntroComplete={handleIntroComplete}
                />
              )}

              {activeTab === 'library' && (
                <div style={styles.settingsMockCell}>
                  <h3 className="heading-l" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Library</h3>
                  <p className="caption" style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Browse and manage your shared documents, semantic indices, and corpus definitions.</p>
                  <div style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    📖 No custom corpora created yet. Upload files in the <strong>Knowledge</strong> tab to construct your first vector store.
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div style={styles.settingsMockCell}>
                  <h3 className="heading-l" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Projects</h3>
                  <p className="caption" style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Organize your RAG prompts, evaluation runs, and context stores into logical projects.</p>
                  <div style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    📁 No active project workspaces. Define prompts and model endpoints in the <strong>Chat</strong> model picker to initialize a project tracing session.
                  </div>
                </div>
              )}

              {activeTab === 'knowledge' && (
                <KnowledgePage
                  indexedDocsCount={indexedDocsCount}
                  onUploadComplete={handleUploadComplete}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsPage
                  preExpandedRowId={preExpandedRowId}
                  setPreExpandedRowId={setPreExpandedRowId}
                  sources={mockSources}
                />
              )}

              {activeTab === 'settings' && (
                <div style={styles.settingsMockCell}>
                  <h3 className="heading-l" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Settings</h3>
                  <p className="caption" style={{ color: 'var(--text-secondary)' }}>System configurations, haptic feedback toggle, and LLM endpoint parameters.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
      {/* Apple Intelligence Switch Glow Overlays v2.9.4 */}
      {isModelSwitching && (
        <div className={`apple-border-tracer-container ${isFullGlowActive ? 'full-glow-active' : ''} ${isTracerFading ? 'tracer-fading' : ''}`}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
          >
            <defs>
              <linearGradient id="tracerGradV2.9.4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="35%" stopColor="#8B5CF6" />
                <stop offset="70%" stopColor="#20B8A6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <path
              d="M 50 0 L 100 0 L 100 100 L 0 100 L 0 0 L 50 0"
              vectorEffect="non-scaling-stroke"
              pathLength="100"
              fill="none"
              stroke="url(#tracerGradV2.9.4)"
              className="tracer-path"
            />
          </svg>
        </div>
      )}
      <div className={`apple-intelligence-bloom ${isFullGlowActive ? 'bloom-active' : ''} ${isTracerFading ? 'tracer-fading' : ''}`} />


    </div>
  );
}

const styles = {
  appContainer: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    backgroundColor: 'var(--bg-void)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  /* Landing Experience layout */
  landingLayout: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px',
    alignItems: 'center',
    zIndex: 5,
    position: 'relative'
  },
  landingTopBar: {
    height: '52px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    padding: '0 16px',
    boxSizing: 'border-box'
  },
  landingTopLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  landingTopText: {
    fontFamily: 'var(--font-primary)',
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--text-primary)'
  },
  landingTopRight: {
    marginLeft: 'auto'
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
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    transition: 'transform var(--t-fast)'
  },
  landingCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '720px',
    transform: 'translateY(-40px)'
  },
  landingStarBox: {
    marginBottom: '20px' // gap set to 20px v3
  },
  landingGreeting: {
    color: 'var(--text-primary)',
    marginBottom: '48px',
    fontWeight: 300,
    userSelect: 'none'
  },
  heroInputContainer: {
    width: '680px',
    height: '60px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 'var(--radius-xl)',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  landingAttachBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '16px',
    outline: 'none',
    fontWeight: 300
  },
  heroSendBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 200ms var(--ease-standard)'
  },
  landingSuggestions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '24px'
  },
  suggestionPill: {
    height: '32px',
    padding: '0 16px',
    borderRadius: 'var(--radius-full)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontFamily: 'var(--font-primary)',
    cursor: 'pointer'
  },
  landingFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    justifyContent: 'center',
    width: '100%'
  },
  footerText: {
    color: 'var(--text-muted)'
  },
  /* Workspace App Shell */
  appShell: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 5
  },
  mainLayout: {
    flex: 1,
    display: 'flex',
    width: '100%',
    height: 'calc(100vh - 52px)',
    overflow: 'hidden'
  },
  viewContent: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    position: 'relative'
  },
  settingsMockCell: {
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'left'
  }
};
