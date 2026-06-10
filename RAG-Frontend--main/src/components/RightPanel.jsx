import React, { useState } from 'react';
import { FileText, X, ArrowUpRight, Check, Activity, AlertCircle } from 'lucide-react';

export default function RightPanel({
  obsMode,
  activeSourceId,
  setActiveSourceId,
  sources = [],
  traces = [],
  onClose
}) {
  const [expandedChunk, setExpandedChunk] = useState(null);
  const [expandedTraceIndex, setExpandedTraceIndex] = useState(null);

  // Helper for confidence color mapping
  const getConfidenceColors = (score) => {
    if (score >= 80) return { accent: 'var(--green-accent)', bg: 'var(--green-bg)', border: 'var(--green-border)' };
    if (score >= 50) return { accent: 'var(--amber-accent)', bg: 'var(--amber-bg)', border: 'var(--amber-border)' };
    return { accent: 'var(--red-accent)', bg: 'var(--red-bg)', border: 'var(--red-border)' };
  };

  return (
    <aside style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>
          {obsMode ? 'Trace Inspector' : 'Sources'}
        </span>
        <div style={styles.headerRight}>
          {obsMode ? (
            <div style={styles.liveBadge}>
              <span style={styles.liveDot}></span>
              <span style={styles.liveText} className="caption">Live</span>
            </div>
          ) : (
            <span style={styles.countBadge} className="caption">
              {sources.length} retrieved
            </span>
          )}
          <button style={styles.closeBtn} onClick={onClose} className="hover-color">
            <X size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.content} className="custom-scrollbar">
        {!obsMode ? (
          /* SCREEN 2: SOURCE EVIDENCE */
          <div style={styles.sourcesList}>
            {sources.map(source => {
              const colors = getConfidenceColors(source.relevance);
              const isActive = activeSourceId === source.id;
              const isLowConfidence = source.relevance < 40;

              return (
                <div
                  key={source.id}
                  id={`source-card-${source.id}`}
                  style={{
                    ...styles.sourceCard,
                    opacity: isLowConfidence ? 0.65 : 1,
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: isActive ? 'var(--accent-bg)' : '#0C0C10',
                    transform: isActive ? 'scale(1.01)' : 'scale(1)'
                  }}
                  className="hover-color"
                  onMouseEnter={() => setActiveSourceId(source.id)}
                  onMouseLeave={() => setActiveSourceId(null)}
                >
                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <div style={styles.cardHeaderLeft}>
                      <FileText size={14} style={{ color: colors.accent, marginRight: '6px', flexShrink: 0 }} />
                      <span style={styles.filename} title={source.filename}>
                        {source.filename}
                      </span>
                    </div>
                    
                    <div style={styles.cardHeaderRight}>
                      <span style={styles.pagePill} className="token-mono">
                        p.{source.page}
                      </span>
                      {/* Relevance bar (60px x 3px) */}
                      <div style={styles.relevanceTrack}>
                        <div 
                          style={{ 
                            ...styles.relevanceFill, 
                            width: `${source.relevance}%`,
                            backgroundColor: colors.accent 
                          }}
                        />
                      </div>
                      <span style={{ ...styles.percentage, color: colors.accent }} className="token-mono">
                        {source.relevance}%
                      </span>
                    </div>
                  </div>

                  {/* Chunk Text - JetBrains Mono, 12px, line-height 1.75, max 3 lines */}
                  <div style={styles.chunkText} className="source-s-mono">
                    {source.chunks.map((segment, index) => {
                      if (segment.highlight) {
                        return (
                          <mark key={index} style={styles.highlightText}>
                            {segment.text}
                          </mark>
                        );
                      }
                      return <span key={index}>{segment.text}</span>;
                    })}
                  </div>

                  {/* Card Footer */}
                  <div style={styles.cardFooter}>
                    {isLowConfidence && (
                      <span style={styles.lowFootnote}>
                        Low relevance — included as context
                      </span>
                    )}
                    <a 
                      href="#view-full" 
                      style={styles.viewLink} 
                      className="hover-color"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Full chunk: \n"${source.fullText}"`);
                      }}
                    >
                      View full chunk →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* SCREEN 5: OBSERVABILITY MODE (TRACE TIMELINE) */
          <div style={styles.obsContainer}>
            {/* Timeline */}
            <div style={styles.traceTimeline}>
              <div style={styles.timelineLine}></div>
              {traces.map((trace, idx) => {
                const isLongest = trace.name === 'LLM completion';
                const isExpanded = expandedTraceIndex === idx;

                return (
                  <div 
                    key={idx} 
                    style={styles.traceRowContainer}
                  >
                    <div 
                      style={styles.traceRow}
                      className="hover-color"
                      onClick={() => setExpandedTraceIndex(isExpanded ? null : idx)}
                    >
                      <div style={styles.traceLeft}>
                        <span 
                          style={{ 
                            ...styles.traceDot, 
                            backgroundColor: trace.status === 'complete' ? 'var(--teal-accent)' : 
                                             trace.status === 'in-progress' ? 'var(--amber-accent)' : 
                                             'transparent',
                            border: trace.status === 'pending' ? '1px solid var(--border-default)' : 'none'
                          }}
                        />
                        <span style={styles.traceName}>{trace.name}</span>
                      </div>
                      <div style={styles.traceRight}>
                        {isLongest && (
                          <div style={styles.durationGraph}>
                            <div style={styles.durationBar}></div>
                          </div>
                        )}
                        <span style={styles.traceDuration} className="token-mono">
                          {trace.duration}
                        </span>
                      </div>
                    </div>

                    {/* Expand details on hover/click */}
                    {isExpanded && (
                      <div style={styles.traceDetails} className="source-s-mono">
                        <div><strong>Input payload:</strong> {trace.details?.input || 'N/A'}</div>
                        <div style={{ marginTop: '4px' }}><strong>Details:</strong> {trace.details?.output || 'N/A'}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Metrics Row */}
            <div style={styles.metricsRow}>
              <div style={styles.metricCard}>
                <span style={styles.metricValue}>847ms</span>
                <span style={styles.metricLabel}>total latency</span>
                <span style={styles.metricSubvalue}>↓ 12% faster</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricValue}>1,247</span>
                <span style={styles.metricLabel}>total tokens</span>
                <span style={{ ...styles.metricSubvalue, color: 'var(--text-muted)' }}>1,102 prompt</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricValue}>$0.003</span>
                <span style={styles.metricLabel}>estimated cost</span>
                <span style={{ ...styles.metricSubvalue, color: 'var(--text-muted)' }}>saved via cache</span>
              </div>
            </div>

            {/* Chunk Inspector */}
            <div style={styles.inspectorContainer}>
              <div style={styles.inspectorLabel} className="micro-caps">
                Retrieved chunks
              </div>
              <div style={styles.inspectorList}>
                {sources.map((src, i) => (
                  <div key={src.id} style={styles.inspectorRow}>
                    <div 
                      style={styles.inspectorHeader}
                      className="hover-color"
                      onClick={() => setExpandedChunk(expandedChunk === i ? null : i)}
                    >
                      <span style={styles.inspectorTitle}>{src.filename} (chunk {src.id})</span>
                      <span className="token-mono" style={{ color: 'var(--teal-accent)' }}>
                        {src.relevance}% relevancy
                      </span>
                    </div>
                    {expandedChunk === i && (
                      <div style={styles.inspectorText} className="source-s-mono">
                        {src.fullText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div style={styles.footer}>
        <a 
          href="https://langsmith.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={styles.traceLink}
          className="hover-color"
        >
          View LangSmith trace <ArrowUpRight size={10} style={{ marginLeft: '2px' }} />
        </a>
        <div style={styles.tokenBreakdown} className="token-mono">
          Prompt: 1,102 · Comp: 145 · Total: 1,247
        </div>
      </div>
    </aside>
  );
}

const styles = {
  panel: {
    width: '340px',
    backgroundColor: 'var(--bg-surface)',
    borderLeft: '1px solid var(--border-invisible)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    zIndex: 10
  },
  header: {
    height: '56px',
    padding: '0 16px',
    borderBottom: '1px solid var(--border-invisible)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0
  },
  headerTitle: {
    fontFamily: 'var(--font-primary)',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  countBadge: {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--text-muted)',
    padding: '2px 8px'
  },
  liveBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--teal-accent)',
    boxShadow: '0 0 10px var(--teal-accent)'
  },
  liveText: {
    color: 'var(--teal-accent)',
    fontWeight: 500
  },
  closeBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent'
  },
  content: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto'
  },
  sourcesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  sourceCard: {
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 150ms var(--ease-snappy)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minWidth: 0
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flex: 1,
    marginRight: '8px'
  },
  filename: {
    fontFamily: 'var(--font-primary)',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  cardHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0
  },
  pagePill: {
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-xs)',
    color: 'var(--text-muted)',
    padding: '2px 6px'
  },
  relevanceTrack: {
    width: '60px',
    height: '3px',
    backgroundColor: '#1E1E1E',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden'
  },
  relevanceFill: {
    height: '100%',
    borderRadius: 'var(--radius-full)'
  },
  percentage: {
    fontSize: '11px',
    width: '28px',
    textAlign: 'right'
  },
  chunkText: {
    color: 'var(--text-secondary)',
    lineHeight: '1.75',
    maxHeight: '92px',
    overflow: 'hidden',
    position: 'relative'
  },
  highlightText: {
    backgroundColor: 'var(--source-highlight)',
    color: 'var(--source-text)',
    padding: '0 2px',
    borderRadius: '2px'
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4px',
    minHeight: '14px'
  },
  lowFootnote: {
    fontFamily: 'var(--font-primary)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontStyle: 'italic'
  },
  viewLink: {
    fontFamily: 'var(--font-primary)',
    fontSize: '12px',
    color: 'var(--accent-primary)',
    textDecoration: 'none',
    marginLeft: 'auto'
  },
  obsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  traceTimeline: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  timelineLine: {
    position: 'absolute',
    left: '11px',
    top: '12px',
    bottom: '12px',
    width: '1px',
    borderLeft: '1px dashed var(--border-subtle)',
    zIndex: 1
  },
  traceRowContainer: {
    zIndex: 2
  },
  traceRow: {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)',
    padding: '0 8px 0 6px',
    transition: 'background-color var(--t-color-hover)'
  },
  traceLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  traceDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0
  },
  traceName: {
    fontFamily: 'var(--font-primary)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontWeight: 500
  },
  traceRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  durationGraph: {
    width: '40px',
    height: '3px',
    backgroundColor: '#1E1E1E',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden'
  },
  durationBar: {
    height: '100%',
    width: '85%',
    backgroundColor: 'var(--amber-accent)',
    borderRadius: 'var(--radius-full)'
  },
  traceDuration: {
    color: 'var(--text-muted)',
    fontSize: '11px'
  },
  traceDetails: {
    marginLeft: '28px',
    padding: '8px 10px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    marginBottom: '8px'
  },
  metricsRow: {
    display: 'flex',
    gap: '8px',
    width: '100%'
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  metricValue: {
    fontFamily: 'var(--font-primary)',
    fontSize: '16px',
    fontWeight: 500,
    color: 'var(--text-primary)'
  },
  metricLabel: {
    fontFamily: 'var(--font-primary)',
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  metricSubvalue: {
    fontSize: '10px',
    color: 'var(--green-accent)',
    marginTop: '2px'
  },
  inspectorContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  inspectorLabel: {
    color: 'var(--text-muted)',
    paddingLeft: '4px'
  },
  inspectorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  inspectorRow: {
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden'
  },
  inspectorHeader: {
    height: '36px',
    padding: '0 12px',
    backgroundColor: 'var(--bg-elevated)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  inspectorTitle: {
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '160px'
  },
  inspectorText: {
    padding: '12px',
    backgroundColor: '#0C0C10',
    borderTop: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    lineHeight: '1.75',
    maxHeight: '150px',
    overflowY: 'auto'
  },
  footer: {
    height: '48px',
    borderTop: '1px solid var(--border-invisible)',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0
  },
  traceLink: {
    fontFamily: 'var(--font-primary)',
    fontSize: '12px',
    color: 'var(--accent-primary)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center'
  },
  tokenBreakdown: {
    color: 'var(--text-muted)',
    fontSize: '11px'
  }
};
