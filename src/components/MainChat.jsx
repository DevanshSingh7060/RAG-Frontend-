import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Sparkles, ArrowUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import RagStar from './RagStar';

export default function MainChat({
  messages = [],
  onSendMessage,
  currentModel,
  onOpenModelPicker,
  activeKbDocsCount = 3,
  onSuggestionClick,
  onOpenUpload,
  onCitationClick,
  playIntro,
  onIntroComplete
}) {
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [votedMessages, setVotedMessages] = useState({});
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);

  useEffect(() => {
    if (showFeedbackToast) {
      const timer = setTimeout(() => {
        setShowFeedbackToast(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showFeedbackToast]);

  // Typewriter active state
  const [isTypewriting, setIsTypewriting] = useState(false);

  // Cinematic sequencer states (for Landing Empty State)
  const [introFrame, setIntroFrame] = useState(playIntro ? 0 : 7);
  const [docCountAnim, setDocCountAnim] = useState(playIntro ? 0 : activeKbDocsCount);

  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);

  // Mobile viewport width listener
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Vibration feedback utility
  const triggerHaptic = (type) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'light') navigator.vibrate(15);
      else if (type === 'medium') navigator.vibrate(40);
      else if (type === 'selection') navigator.vibrate(10);
    }
  };

  // Cinematic Intro sequence timers
  useEffect(() => {
    if (!playIntro) return;

    // Frame 1: 300ms (Aurora is rising)
    const t1 = setTimeout(() => setIntroFrame(1), 200);

    // Frame 2: 600ms (Star is born, haptic medium)
    const t2 = setTimeout(() => {
      setIntroFrame(2);
      triggerHaptic('medium');
    }, 550);

    // Frame 3: 1000ms (Question text sequenced)
    const t3 = setTimeout(() => setIntroFrame(3), 900);

    // Frame 4: 1400ms (Input emerges)
    const t4 = setTimeout(() => setIntroFrame(4), 1300);

    // Frame 5: 1700ms (Suggestions stagger)
    const t5 = setTimeout(() => setIntroFrame(5), 1600);

    // Frame 6: 2000ms (Footer numbers count up)
    const t6 = setTimeout(() => {
      setIntroFrame(6);
      // Staggered count up from 0 to target docs count
      let currentVal = 0;
      const countInterval = setInterval(() => {
        if (currentVal < activeKbDocsCount) {
          currentVal++;
          setDocCountAnim(currentVal);
          triggerHaptic('selection');
        } else {
          clearInterval(countInterval);
          // Complete intro
          setIntroFrame(7);
          onIntroComplete();
        }
      }, 120);
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [playIntro, activeKbDocsCount]);

  // Skip cinematic intro sequence
  const handleSkipIntro = (e) => {
    e.stopPropagation();
    setIntroFrame(7);
    setDocCountAnim(activeKbDocsCount);
    onIntroComplete();
    triggerHaptic('selection');
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || isTypewriting) return;
    triggerHaptic('medium');
    onSendMessage(inputText);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVote = (msgId, direction) => {
    if (votedMessages[msgId]) return;
    triggerHaptic('selection');
    setVotedMessages(prev => ({ ...prev, [msgId]: direction }));
    setShowFeedbackToast(true);
  };

  // Micro interaction suggestion pill press + typewriter effect
  const handleSuggestionPress = (text) => {
    if (isTypewriting) return;
    triggerHaptic('light');
    setIsTypewriting(true);
    setInputText('');

    let charIdx = 0;
    const interval = setInterval(() => {
      if (charIdx < text.length) {
        setInputText(prev => prev + text.charAt(charIdx));
        charIdx++;
      } else {
        clearInterval(interval);
        setIsTypewriting(false);
      }
    }, 18); // 18ms character typing intervals v3
  };

  // Parser for citations superscript markers
  const parseCitations = (text) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        const num = match[1];
        return (
          <sup
            key={index}
            style={styles.citation}
            className="hover-micro token-mono"
            onClick={() => { triggerHaptic('selection'); onCitationClick(num); }}
            title={`Jump to trace detail ${num}`}
          >
            {num}
          </sup>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const isIntroComplete = introFrame >= 7;

  return (
    <div style={styles.container}>
      {/* Skip intro label (during frame 1 to 5) */}
      {!isIntroComplete && playIntro && introFrame > 0 && introFrame < 6 && (
        <button style={styles.skipLabel} onClick={handleSkipIntro} className="caption hover-color">
          tap to skip
        </button>
      )}

      {/* Scrollable conversation history */}
      <div style={styles.scrollArea} className="custom-scrollbar">
        {messages.length === 0 ? (
          /* ======================================================== */
          /* SCREEN 1: EMPTY STATE LANDING                            */
          /* ======================================================== */
          <div style={styles.emptyState}>
            {/* Star Logo with Layer 5 halo (animated offset scales) */}
            {introFrame >= 2 && (
              <div style={styles.landingStarBox}>
                <RagStar size={isMobile ? 40 : 48} mode="idle" />
              </div>
            )}
            
            {/* Cinematic text reveal word-by-word */}
            {introFrame >= 3 && (
              <h2 style={styles.emptyGreeting} className="display-300">
                <span className="word-streaming" style={{ animationDelay: '0ms' }}>Where</span>{' '}
                <span className="word-streaming" style={{ animationDelay: '60ms' }}>should</span>{' '}
                <span className="word-streaming" style={{ animationDelay: '120ms' }}>we</span>{' '}
                <span className="word-streaming" style={{ animationDelay: '180ms' }}>start?</span>
              </h2>
            )}

            {/* Input pill */}
            {introFrame >= 4 && (
              <div 
                style={{
                  ...styles.heroInputContainer,
                  height: isMobile ? '56px' : '60px',
                  width: isMobile ? '100%' : '680px',
                  borderColor: isFocused ? 'var(--border-active)' : 'var(--border-subtle)',
                  boxShadow: isFocused 
                    ? '0 0 0 1px rgba(129, 140, 248, 0.2), 0 0 32px rgba(129, 140, 248, 0.07), 0 0 56px rgba(52, 211, 153, 0.04)' 
                    : '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
                  animation: playIntro ? 'wordStreamReveal 500ms var(--ease-expo-out)' : 'none'
                }}
                className={isFocused ? 'premium-border-input premium-border-input-focus' : 'premium-border-input'}
              >
                <button style={styles.landingAttachBtn} onClick={onOpenUpload}>
                  <Paperclip size={18} style={{ color: 'var(--text-muted)' }} />
                </button>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ask RAG anything..."
                    style={styles.heroInput}
                    className="gradient-placeholder"
                    disabled={isTypewriting}
                  />
                  {isTypewriting && <span className="typing-cursor"></span>}
                </div>
                <button 
                  style={{
                    ...styles.heroSendBtn,
                    background: inputText.trim() 
                      ? 'linear-gradient(135deg, #818CF8, #38BDF8, #34D399)' 
                      : 'var(--bg-elevated)',
                    border: inputText.trim() ? 'none' : '1px solid var(--border-subtle)',
                    boxShadow: inputText.trim() ? '0 0 12px rgba(129,140,248,0.4)' : 'none'
                  }}
                  className={inputText.trim() ? 'star-grad-shift-slow' : ''}
                  disabled={!inputText.trim() || isTypewriting}
                  onClick={handleSend}
                >
                  <ArrowUp size={16} style={{ color: inputText.trim() ? '#070709' : 'var(--text-muted)' }} />
                </button>
              </div>
            )}

            {/* Staggered Suggestion Pills */}
            {introFrame >= 5 && (
              <div style={{ ...styles.suggestionsRow, gap: isMobile ? '8px' : '10px' }}>
                <button 
                  style={{ ...styles.suggestionPill, height: isMobile ? '44px' : '32px', padding: isMobile ? '0 12px' : '0 16px' }} 
                  className="hover-micro premium-border-pill"
                  onClick={() => handleSuggestionPress("Summarize my documents")}
                  disabled={isTypewriting}
                >
                  Summarize my documents
                </button>
                <button 
                  style={{ ...styles.suggestionPill, height: isMobile ? '44px' : '32px', padding: isMobile ? '0 12px' : '0 16px' }} 
                  className="hover-micro premium-border-pill"
                  onClick={() => handleSuggestionPress("Find key insights")}
                  disabled={isTypewriting}
                >
                  Find key insights
                </button>
                <button 
                  style={{ ...styles.suggestionPill, height: isMobile ? '44px' : '32px', padding: isMobile ? '0 12px' : '0 16px' }} 
                  className="hover-micro premium-border-pill"
                  onClick={() => handleSuggestionPress("Compare research")}
                  disabled={isTypewriting}
                >
                  Compare research
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* SCREEN 2: ACTIVE CONVERSATION                            */
          /* ======================================================== */
          <div style={styles.chatHistory}>
            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              const isUser = msg.role === 'user';
              
              return (
                <div 
                  key={msg.id || index}
                  style={{
                    ...styles.exchangeWrapper,
                    opacity: isLast ? 1 : 0.5
                  }}
                  className="hover-fast"
                  onMouseEnter={(e) => {
                    if (!isLast) e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLast) e.currentTarget.style.opacity = '0.5';
                  }}
                >
                  {isUser ? (
                    /* USER MESSAGE */
                    <div style={{ ...styles.userMsgContainer, maxWidth: isMobile ? '280px' : '560px' }}>
                      <div style={styles.userSender} className="metadata-400">You</div>
                      <div style={styles.userText} className="body-user-400">{msg.content}</div>
                      {msg.timestamp && (
                        <div style={styles.userTime} className="metadata-400">{msg.timestamp}</div>
                      )}
                    </div>
                  ) : (
                     /* AI RESPONSE */
                     <div style={styles.aiMsgContainer}>
                      {/* Response Header or Thinking state dots */}
                      <div style={{ position: 'relative', height: '28px', marginBottom: '12px' }}>
                        {/* Thinking Dots */}
                        <div 
                          style={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            display: 'flex', 
                            gap: '6px', 
                            paddingLeft: '8px', 
                            height: '28px', 
                            alignItems: 'center',
                            opacity: msg.isThinking ? 1 : 0,
                            pointerEvents: msg.isThinking ? 'auto' : 'none',
                            transition: 'opacity 300ms ease-out'
                          }}
                        >
                          <div className="dot-bounce-v3 dot-bounce-1"></div>
                          <div className="dot-bounce-v3 dot-bounce-2"></div>
                          <div className="dot-bounce-v3 dot-bounce-3"></div>
                        </div>

                        {/* AI Header */}
                        <div 
                          style={{
                            ...styles.aiHeader,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            opacity: msg.isThinking ? 0 : 1,
                            pointerEvents: msg.isThinking ? 'none' : 'auto',
                            transition: 'opacity 400ms ease-out',
                            margin: 0
                          }}
                        >
                          <div style={styles.starWrapper} className="fade-in-glow">
                            <RagStar 
                              size={28} 
                              mode="streaming" 
                            />
                          </div>
                          <span style={styles.aiName}>RAG</span>
                          <span style={styles.aiModelBadge} className="metadata-400">
                            {msg.model || currentModel}
                          </span>
                          {msg.timestamp && (
                            <span style={styles.aiTime} className="metadata-400">{msg.timestamp}</span>
                          )}
                        </div>
                      </div>

                      {/* Response Body Text */}
                      {!msg.isThinking && (
                        <div 
                          style={styles.aiBody}
                          className={`body-ai-400 ${isLast ? 'ai-response-block' : ''}`}
                        >
                          {msg.content.split('\n\n').map((para, pIdx) => {
                            if (para.trim().startsWith('-')) {
                              return (
                                <ul key={pIdx} style={styles.aiList}>
                                  {para.split('\n').map((li, liIdx) => (
                                    <li key={liIdx} style={styles.aiListItem}>
                                      {isLast && msg.isStreaming ? (
                                        li.replace(/^-\s*/, '').split(' ').map((word, wIdx) => (
                                          <span key={wIdx} className="word-reveal">
                                            {parseCitations(word)}
                                            {wIdx < li.replace(/^-\s*/, '').split(' ').length - 1 ? ' ' : ''}
                                          </span>
                                        ))
                                      ) : (
                                        parseCitations(li.replace(/^-\s*/, ''))
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              );
                            }
                            return (
                              <p key={pIdx} style={styles.aiParagraph}>
                                {isLast && msg.isStreaming ? (
                                  para.split(' ').map((word, wIdx) => (
                                    <span key={wIdx} className="word-reveal">
                                      {parseCitations(word)}
                                      {wIdx < para.split(' ').length - 1 ? ' ' : ''}
                                    </span>
                                  ))
                                ) : (
                                  parseCitations(para)
                                )}
                                {isLast && pIdx === msg.content.split('\n\n').length - 1 && msg.isStreaming && (
                                  <span className="blinking-cursor"></span>
                                )}
                              </p>
                            );
                          })}
                        </div>
                      )}

                      {/* Response Metadata Row */}
                      {!msg.isThinking && !msg.isStreaming && (
                        <div style={styles.aiMetadataRow} className="metadata-400">
                          <span className="heartbeat-dot"></span>
                          <span style={{ color: 'var(--text-secondary)' }}>High confidence</span>
                          <span style={styles.metaDivider}>·</span>
                          <span>{msg.sources?.length || 0} sources</span>
                          <span style={styles.metaDivider}>·</span>
                          <span className="chip-mono">
                            {msg.latency || '847ms'}
                          </span>
                          <span style={styles.metaDivider}>·</span>
                          
                          {/* Feedback Thumbs */}
                          <div style={styles.feedbackContainer}>
                            <button 
                              style={{
                                ...styles.feedbackBtn,
                                color: votedMessages[msg.id] === 'up' ? '#34D399' : 'var(--text-muted)'
                              }}
                              className="feedback-thumb-up"
                              onClick={() => handleVote(msg.id, 'up')}
                            >
                              <ThumbsUp size={14} fill={votedMessages[msg.id] === 'up' ? '#34D399' : 'none'} />
                            </button>
                            <button 
                              style={{
                                ...styles.feedbackBtn,
                                color: votedMessages[msg.id] === 'down' ? '#F43F5E' : 'var(--text-muted)'
                              }}
                              className="feedback-thumb-down"
                              onClick={() => handleVote(msg.id, 'down')}
                            >
                              <ThumbsDown size={14} fill={votedMessages[msg.id] === 'down' ? '#F43F5E' : 'none'} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Source Chips Row */}
                      {!msg.isThinking && !msg.isStreaming && msg.sources && (
                        <div 
                          style={{
                            ...styles.sourceChipsRow,
                            opacity: isLast ? 1 : 0.45
                          }}
                        >
                          {msg.sources.map(src => (
                            <div
                              key={src.id}
                              style={styles.sourceChip}
                              className="hover-micro chip-mono"
                              onClick={() => onCitationClick(src.id)}
                            >
                              <Paperclip size={11} style={{ color: 'var(--text-muted)', marginRight: '4px' }} />
                              <span style={styles.chipText}>{src.filename}</span>
                              <span style={styles.chipDivider}>·</span>
                              <span>p.{src.page}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* CHAT INPUT AREA (pinned bottom, emergable transitions) */}
      {isIntroComplete && (
        <div style={{
          ...styles.inputOuterContainer,
          bottom: isMobile ? 'calc(56px + env(safe-area-inset-bottom) + 12px)' : '24px',
          padding: isMobile ? '0 16px' : '0 24px'
        }}>
          <div 
            style={{
              borderColor: isFocused ? 'var(--border-active)' : 'var(--border-subtle)',
              boxShadow: isFocused 
                ? '0 0 0 1px rgba(129, 140, 248, 0.2), 0 0 32px rgba(129, 140, 248, 0.07), 0 0 56px rgba(52, 211, 153, 0.04)' 
                : '0 -4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.02)',
              ...styles.inputContainer
            }}
            className={isFocused ? 'premium-border-input premium-border-input-focus' : 'premium-border-input'}
          >
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask anything..."
                style={styles.textarea}
                className="custom-scrollbar gradient-placeholder"
                disabled={isTypewriting}
              />
              {isTypewriting && <span className="typing-cursor"></span>}
            </div>

            {/* Bottom Row inside Input */}
            <div style={styles.inputBottomRow}>
              {/* Left Attach / Knowledge pills */}
              <div style={styles.leftPills}>
                <button style={styles.pillBtn} className="hover-color" onClick={onOpenUpload}>
                  <Paperclip size={14} style={{ color: 'var(--text-muted)', marginRight: '6px' }} />
                  <span>Attach</span>
                </button>
                <button style={styles.pillBtn} className="hover-color" onClick={onOpenModelPicker}>
                  <Sparkles size={14} style={{ color: 'var(--text-muted)', marginRight: '6px' }} />
                  <span>Knowledge</span>
                </button>
              </div>

              {/* Character counts (>200 characters) */}
              {inputText.length > 200 && (
                <div style={styles.charCount} className="caption">
                  {inputText.length} chars
                </div>
              )}

              {/* Center docs indicator */}
              <div style={styles.docsCountPill} className="chip-mono">
                {activeKbDocsCount} docs · 4,891 chunks
              </div>

              {/* Right send button */}
              <button
                style={{
                  ...styles.sendBtn,
                  background: inputText.trim() 
                    ? 'linear-gradient(135deg, #818CF8, #38BDF8, #34D399)' 
                    : 'var(--bg-elevated)',
                  border: inputText.trim() ? 'none' : '1px solid var(--border-subtle)',
                  boxShadow: inputText.trim() ? '0 0 12px rgba(129,140,248,0.4), 0 0 24px rgba(129,140,248,0.15)' : 'none'
                }}
                className={inputText.trim() ? 'star-grad-shift-slow' : ''}
                onClick={handleSend}
                disabled={!inputText.trim() || isTypewriting}
              >
                <ArrowUp 
                  size={16} 
                  style={{ 
                    color: inputText.trim() ? '#070709' : 'var(--text-muted)' 
                  }} 
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER STATUS HEARTBEAT SIGNALS */}
      {introFrame >= 6 && messages.length === 0 && (
        <div style={styles.landingFooter}>
          <span className="heartbeat-dot"></span>
          <span style={styles.footerText} className="metadata-400">
            {docCountAnim} documents indexed · Knowledge base ready
          </span>
        </div>
      )}

      {/* Feedback Toast slide up */}
      {showFeedbackToast && (
        <div className="feedback-toast-container">
          Thanks for your feedback!
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'transparent',
    position: 'relative'
  },
  skipLabel: {
    position: 'absolute',
    bottom: '24px',
    right: '24px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    zIndex: 100,
    textDecoration: 'underline'
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '160px'
  },
  emptyState: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '120px 24px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  landingStarBox: {
    marginBottom: '20px', // spacing between star and headline set to 20px v3
    animation: 'wordStreamReveal 500ms var(--ease-spring)'
  },
  emptyGreeting: {
    color: 'var(--text-primary)',
    marginBottom: '48px',
    fontWeight: 300
  },
  suggestionsRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
    marginTop: '24px'
  },
  suggestionPill: {
    height: '44px', // mobile hit target 44px
    padding: '0 16px',
    borderRadius: 'var(--radius-full)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontFamily: 'var(--font-primary)',
    cursor: 'pointer'
  },
  chatHistory: {
    maxWidth: '720px',
    margin: '0 auto',
    width: '100%',
    padding: '40px 24px 0',
    display: 'flex',
    flexDirection: 'column'
  },
  exchangeWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    transition: 'opacity var(--t-normal)'
  },
  userMsgContainer: {
    alignSelf: 'flex-end',
    maxWidth: '560px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom: '20px'
  },
  userSender: {
    marginBottom: '4px'
  },
  userText: {
    color: 'var(--text-primary)',
    whiteSpace: 'pre-wrap',
    textAlign: 'right'
  },
  userTime: {
    marginTop: '4px'
  },
  aiMsgContainer: {
    alignSelf: 'flex-start',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '48px'
  },
  aiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    height: '28px',
    marginBottom: '12px'
  },
  starWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px'
  },
  aiName: {
    fontFamily: 'var(--font-primary)',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)'
  },
  aiModelBadge: {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xs)',
    padding: '2px 6px',
    fontSize: '11px'
  },
  aiTime: {
    color: 'var(--text-muted)'
  },
  aiBody: {
    color: 'var(--text-primary)',
    transition: 'all var(--t-normal)'
  },
  aiParagraph: {
    marginBottom: '16px'
  },
  aiList: {
    marginLeft: '12px',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  aiListItem: {
    listStyleType: 'disc',
    paddingLeft: '4px'
  },
  citation: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '13px',
    height: '13px',
    borderRadius: '3px',
    border: '1px solid var(--border-subtle)',
    fontSize: '9px',
    fontWeight: 500,
    marginLeft: '2px',
    cursor: 'pointer',
    verticalAlign: 'super',
    userSelect: 'none',
    transition: 'all var(--t-micro)'
  },
  aiMetadataRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '12px',
    userSelect: 'none'
  },
  metaDivider: {
    color: 'var(--border-subtle)'
  },
  feedbackContainer: {
    display: 'flex',
    gap: '4px'
  },
  feedbackBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'color var(--t-micro)'
  },
  sourceChipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px',
    width: '100%',
    transition: 'opacity var(--t-normal)'
  },
  sourceChip: {
    height: '22px',
    padding: '0 8px',
    borderRadius: '4px',
    border: '1px solid var(--border-faint)',
    backgroundColor: 'var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '11px',
    transition: 'all var(--t-micro)'
  },
  chipText: {
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  chipDivider: {
    margin: '0 4px',
    color: 'var(--border-subtle)'
  },
  inputOuterContainer: {
    position: 'absolute',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '720px',
    padding: '0 24px',
    zIndex: 20
  },
  inputContainer: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 'var(--radius-xl)',
    padding: '16px 20px 12px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  textarea: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '16px',
    lineHeight: '1.6',
    resize: 'none',
    maxHeight: '120px',
    fontFamily: 'var(--font-primary)',
    fontWeight: 400
  },
  inputBottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-faint)'
  },
  leftPills: {
    display: 'flex',
    gap: '16px'
  },
  pillBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'color var(--t-micro)'
  },
  charCount: {
    color: 'var(--text-muted)'
  },
  docsCountPill: {
    color: 'var(--text-muted)',
    fontSize: '11px'
  },
  sendBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--t-fast)',
    cursor: 'pointer'
  },
  landingFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    justifyContent: 'center',
    width: '100%',
    animation: 'wordStreamReveal 500ms var(--ease-standard)'
  },
  footerText: {
    color: 'var(--text-muted)'
  }
};
