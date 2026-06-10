import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyticsPage({ preExpandedRowId, setPreExpandedRowId, sources = [] }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const rowRefs = useRef({});
  const svgRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const chartPoints = [
    { day: 'Mon', x: 50, y: 150, value: 840, color: '#818CF8' },
    { day: 'Tue', x: 150, y: 140, value: 920, color: '#818CF8' },
    { day: 'Wed', x: 250, y: 90, value: 1350, color: '#38BDF8' },
    { day: 'Thu', x: 350, y: 110, value: 1180, color: '#38BDF8' },
    { day: 'Fri', x: 450, y: 60, value: 1640, color: '#34D399' },
    { day: 'Sat', x: 550, y: 70, value: 1520, color: '#34D399' },
    { day: 'Sun', x: 650, y: 40, value: 1980, color: '#A78BFA' },
    { day: 'Today', x: 750, y: 45, value: 1890, color: '#A78BFA' }
  ];

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    
    let closestIndex = 0;
    let minDistance = Infinity;
    chartPoints.forEach((p, i) => {
      const dist = Math.abs(p.x - x);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    });
    
    if (minDistance < 60) {
      setHoveredIndex(closestIndex);
    } else {
      setHoveredIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Mobile viewport width listener
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock data for source retrievals table
  const traces = [
    {
      id: '1',
      query: 'What are the main landmarks in my project documents?',
      filename: 'Q3_Product_Roadmap.pdf',
      page: 4,
      confidence: 92,
      latency: '847ms',
      model: 'GPT-4o',
      tokens: '1,247',
      promptTokens: '1,102',
      compTokens: '145',
      fullText: 'Milestone 2 details: the primary milestones include vector indexing completion by next Tuesday and client-side streaming optimization. This ensures high-throughput search responses for our production client.',
      chunks: [
        { text: 'Milestone 2 details: the primary milestones include ' },
        { text: 'vector indexing completion by next Tuesday', highlight: true },
        { text: ' and client-side streaming optimization.' }
      ]
    },
    {
      id: '2',
      query: 'What is the confidence threshold score?',
      filename: 'RAG_Confidence_Thresholds.md',
      page: 12,
      confidence: 78,
      latency: '624ms',
      model: 'GPT-4o',
      tokens: '984',
      promptTokens: '890',
      compTokens: '94',
      fullText: 'To ensure retrieval hygiene, the core document specifies that high confidence retrieval requires a threshold score above 80%. Retrieved sources yielding lower metrics should display semantic warnings.',
      chunks: [
        { text: 'To ensure retrieval hygiene, the core document specifies that high confidence retrieval requires a ' },
        { text: 'threshold score above 80%', highlight: true },
        { text: '.' }
      ]
    },
    {
      id: '3',
      query: 'Are there embedding performance warnings?',
      filename: 'Embeddings_Performance_Study.txt',
      page: 47,
      confidence: 34,
      latency: '512ms',
      model: 'Claude 3.5',
      tokens: '1,421',
      promptTokens: '1,280',
      compTokens: '141',
      fullText: 'Additionally, some research papers advise caution on caching large embeddings because of latency penalties during key lookups. Cold boots require disk-seek queries.',
      chunks: [
        { text: 'Some research papers advise caution on caching large embeddings because of ' },
        { text: 'latency penalties', highlight: true },
        { text: '.' }
      ]
    }
  ];

  // Align pre-expanded trace from chat citation click
  useEffect(() => {
    if (preExpandedRowId) {
      setExpandedRow(preExpandedRowId);
      // Scroll to row
      setTimeout(() => {
        rowRefs.current[preExpandedRowId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Clear pre-expanded row reference in parent after routing completes
        setPreExpandedRowId(null);
      }, 300);
    }
  }, [preExpandedRowId]);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'var(--green-accent)';
    if (score >= 50) return 'var(--amber-accent)';
    return 'var(--red-accent)';
  };

  return (
    <div style={{ ...styles.container, padding: isMobile ? '16px 16px 80px 16px' : '40px' }} className="custom-scrollbar">
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Analytics</h2>
        <p style={styles.subtitle}>Observe latency patterns, document alignments, and vector scores.</p>
      </div>

      {/* Metric cards */}
      <div style={{ ...styles.metricsRow, flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ ...styles.metricCard, flex: isMobile ? '1 1 calc(50% - 6px)' : 1 }} className="metric-card-hover">
          <span style={styles.metricLabel}>Total Queries</span>
          <span style={styles.metricValue}>1,248</span>
          <div style={styles.trendRow}>
            <ArrowUpRight size={14} style={{ color: 'var(--green-accent)', marginRight: '2px' }} />
            <span style={{ color: 'var(--green-accent)' }} className="caption">8% this week</span>
          </div>
        </div>

        <div style={{ ...styles.metricCard, flex: isMobile ? '1 1 calc(50% - 6px)' : 1 }} className="metric-card-hover">
          <span style={styles.metricLabel}>Avg Latency</span>
          <span style={styles.metricValue}>847ms</span>
          <div style={styles.trendRow}>
            <ArrowDownRight size={14} style={{ color: 'var(--green-accent)', marginRight: '2px' }} />
            <span style={{ color: 'var(--green-accent)' }} className="caption">12% faster</span>
          </div>
        </div>

        <div style={{ ...styles.metricCard, flex: isMobile ? '1 1 calc(50% - 6px)' : 1 }} className="metric-card-hover">
          <span style={styles.metricLabel}>Retrieval Accuracy</span>
          <span style={styles.metricValue}>92%</span>
          <div style={styles.trendRow}>
            <ArrowUpRight size={14} style={{ color: 'var(--green-accent)', marginRight: '2px' }} />
            <span style={{ color: 'var(--green-accent)' }} className="caption">1.5% confidence</span>
          </div>
        </div>

        <div style={{ ...styles.metricCard, flex: isMobile ? '1 1 calc(50% - 6px)' : 1 }} className="metric-card-hover">
          <span style={styles.metricLabel}>Total Cost</span>
          <span style={styles.metricValue}>$0.0031</span>
          <div style={styles.trendRow}>
            <ArrowDownRight size={14} style={{ color: 'var(--green-accent)', marginRight: '2px' }} />
            <span style={{ color: 'var(--green-accent)' }} className="caption">4% saved cache</span>
          </div>
        </div>
      </div>

      {/* Query volume chart SVG */}
      <div style={styles.chartContainer}>
        <span style={styles.chartLabel} className="label-caps-500">Query Volume (Past 7 Days)</span>
        <div style={styles.chartWrapper}>
          <AnimatePresence>
            {hoveredIndex !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: `${(chartPoints[hoveredIndex].x / 800) * 100}%`,
                  top: `${(chartPoints[hoveredIndex].y / 200) * 100}%`,
                  transform: 'translate(-50%, -100%)',
                  pointerEvents: 'none',
                  marginTop: '-16px',
                  zIndex: 20
                }}
              >
                <div style={styles.tooltip}>
                  <div style={styles.tooltipDay}>{chartPoints[hoveredIndex].day}</div>
                  <div style={styles.tooltipValue}>
                    <span style={{ color: chartPoints[hoveredIndex].color, marginRight: '6px' }}>●</span>
                    {chartPoints[hoveredIndex].value.toLocaleString()} queries
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <svg 
            ref={svgRef}
            style={styles.svgChart} 
            viewBox="0 0 800 200"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="40%" stopColor="#38BDF8" />
                <stop offset="80%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="40" y1="30" x2="760" y2="30" stroke="var(--border-faint)" strokeWidth="1" />
            <line x1="40" y1="80" x2="760" y2="80" stroke="var(--border-faint)" strokeWidth="1" />
            <line x1="40" y1="130" x2="760" y2="130" stroke="var(--border-faint)" strokeWidth="1" />
            <line x1="40" y1="170" x2="760" y2="170" stroke="var(--border-faint)" strokeWidth="1" />

            {/* Vertical hover guide line */}
            <motion.line
              y1="30"
              y2="170"
              stroke="var(--border-subtle)"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={false}
              animate={{
                opacity: hoveredIndex !== null ? 1 : 0,
                x1: hoveredIndex !== null ? chartPoints[hoveredIndex].x : 0,
                x2: hoveredIndex !== null ? chartPoints[hoveredIndex].x : 0,
              }}
              transition={{
                opacity: { duration: 0.2 },
                x1: { type: 'spring', stiffness: 400, damping: 30 },
                x2: { type: 'spring', stiffness: 400, damping: 30 }
              }}
            />

            {/* Line chart stroke */}
            <motion.path
              d="M 50,150 L 150,140 L 250,90 L 350,110 L 450,60 L 550,70 L 650,40 L 750,45"
              fill="none"
              stroke="url(#chartGrad)"
              strokeLinecap="round"
              initial={false}
              animate={{
                strokeWidth: hoveredIndex !== null ? 3 : 2,
                filter: hoveredIndex !== null ? 'drop-shadow(0 0 12px rgba(129, 140, 248, 0.5))' : 'drop-shadow(0 0 0px transparent)'
              }}
              transition={{ duration: 0.25 }}
            />

            {/* Glowing dots mapped dynamically */}
            {chartPoints.map((p, i) => (
              <motion.circle
                key={i}
                cx={p.x}
                cy={p.y}
                fill={p.color}
                initial={false}
                animate={{
                  r: hoveredIndex === i ? 6 : 3,
                  filter: hoveredIndex === i ? `drop-shadow(0 0 8px ${p.color}) brightness(1.3)` : 'drop-shadow(0 0 0px transparent) brightness(1)'
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(i)}
              />
            ))}

            {/* Labels mapped dynamically */}
            {chartPoints.map((p, i) => (
              <text key={`label-${i}`} x={p.x - 5} y="190" fill="var(--text-muted)" className="token-mono" fontSize="10">
                {p.day}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Traces table */}
      <div style={styles.tableSection}>
        <span style={styles.tableHeaderLabel} className="label-caps-500">Recent Source Retrievals</span>
        <div style={{ ...styles.tableContainer, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ ...styles.table, minWidth: isMobile ? '600px' : 'auto' }}>
            <thead>
              <tr style={styles.trHead}>
                <th style={{ ...styles.th, width: '40%' }}>Query</th>
                <th style={styles.th}>Source Doc</th>
                <th style={styles.th}>Relevance</th>
                <th style={styles.th}>Latency</th>
                <th style={styles.th}>Model</th>
                <th style={{ ...styles.th, width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {traces.map(trace => {
                const isExpanded = expandedRow === trace.id;
                const confColor = getConfidenceColor(trace.confidence);

                return (
                  <React.Fragment key={trace.id}>
                    <tr 
                      ref={el => rowRefs.current[trace.id] = el}
                      style={{
                        ...styles.trRow,
                        backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.01)' : 'transparent'
                      }}
                      className="hover-micro"
                      onClick={() => toggleRow(trace.id)}
                    >
                      <td style={styles.tdQuery}>{trace.query}</td>
                      <td style={styles.tdFile}>
                        <div style={styles.fileBox}>
                          <FileText size={12} style={{ color: 'var(--text-muted)', marginRight: '6px' }} />
                          <span className="chip-mono" style={{ color: 'var(--text-secondary)' }}>{trace.filename}</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, color: confColor }} className="token-mono">
                        {trace.confidence}%
                      </td>
                      <td style={styles.td} className="token-mono">{trace.latency}</td>
                      <td style={styles.td} className="caption">{trace.model}</td>
                      <td style={styles.td}>
                        {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                      </td>
                    </tr>

                    {/* Expand Details row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="6" style={styles.expandedCell}>
                          <div style={styles.expandedContent} className="custom-scrollbar">
                            
                            {/* Input / payload */}
                            <div style={styles.detailRow}>
                              <span style={styles.detailTitle} className="label-caps-500">Query Payload</span>
                              <p style={styles.detailText} className="body-user-400">"{trace.query}"</p>
                            </div>

                            {/* Retrieved Chunk with matches */}
                            <div style={styles.detailRow}>
                              <div style={styles.chunkLabelHeader}>
                                <span style={styles.detailTitle} className="label-caps-500">Retrieved Chunk (p. {trace.page})</span>
                                <span className="token-mono" style={{ color: confColor }}>{trace.confidence}% accuracy score</span>
                              </div>
                              <div style={styles.chunkTextBox} className="chip-mono">
                                {trace.chunks.map((segment, index) => {
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
                            </div>

                            {/* Token usage breakdown and LangSmith link */}
                            <div style={styles.detailsFooter}>
                              <div style={styles.tokenUsageBox} className="token-mono">
                                Token breakdown: Prompt {trace.promptTokens} · Completion {trace.compTokens} · Total {trace.tokens}
                              </div>
                              <a
                                href="https://langsmith.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.langsmithLink}
                                className="hover-color"
                              >
                                View LangSmith trace <ArrowUpRight size={10} style={{ marginLeft: '4px' }} />
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
    overflowY: 'auto',
    zIndex: 10,
    position: 'relative'
  },
  header: {
    marginBottom: '32px',
    textAlign: 'left'
  },
  title: {
    fontFamily: 'var(--font-primary)',
    fontSize: '24px',
    fontWeight: 300,
    color: 'var(--text-primary)',
    marginBottom: '6px'
  },
  subtitle: {
    fontFamily: 'var(--font-primary)',
    fontSize: '14px',
    color: 'var(--text-secondary)'
  },
  metricsRow: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    marginBottom: '32px'
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'flex-start'
  },
  metricLabel: {
    fontFamily: 'var(--font-primary)',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  metricValue: {
    fontFamily: 'var(--font-primary)',
    fontSize: '28px',
    fontWeight: 300,
    color: 'var(--text-primary)'
  },
  trendRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '4px'
  },
  chartContainer: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  chartLabel: {
    textAlign: 'left',
    paddingLeft: '4px'
  },
  chartWrapper: {
    width: '100%',
    height: '200px',
    position: 'relative'
  },
  svgChart: {
    width: '100%',
    height: '100%'
  },
  tableSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  tableHeaderLabel: {
    textAlign: 'left',
    paddingLeft: '4px'
  },
  tableContainer: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  trHead: {
    borderBottom: '1px solid var(--border-subtle)',
    height: '40px'
  },
  th: {
    fontFamily: 'var(--font-primary)',
    fontSize: '11px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--text-muted)',
    padding: '0 16px'
  },
  trRow: {
    borderBottom: '1px solid var(--border-faint)',
    height: '44px',
    cursor: 'pointer',
    transition: 'background-color var(--t-micro)'
  },
  tdQuery: {
    fontFamily: 'var(--font-primary)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    padding: '0 16px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '240px'
  },
  tdFile: {
    padding: '0 16px',
    maxWidth: '180px'
  },
  fileBox: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  td: {
    padding: '0 16px',
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  expandedCell: {
    backgroundColor: '#0A0A0E',
    borderBottom: '1px solid var(--border-subtle)'
  },
  expandedContent: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left'
  },
  detailTitle: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--text-muted)'
  },
  detailText: {
    color: 'var(--text-secondary)',
    lineHeight: '1.6'
  },
  chunkLabelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chunkTextBox: {
    padding: '16px',
    backgroundColor: '#070709', // bg-void
    border: '1px solid var(--border-faint)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    lineHeight: '1.75',
    textAlign: 'left'
  },
  highlightText: {
    backgroundColor: 'var(--source-highlight)',
    color: 'var(--source-text)',
    padding: '0 2px',
    borderRadius: '2px'
  },
  detailsFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-faint)'
  },
  tokenUsageBox: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  langsmithLink: {
    fontSize: '12px',
    color: '#818CF8',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center'
  },
  tooltip: {
    backgroundColor: 'rgba(10, 10, 14, 0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '8px 12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.02) inset',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    pointerEvents: 'none',
    whiteSpace: 'nowrap'
  },
  tooltipDay: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 500
  },
  tooltipValue: {
    fontSize: '13px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center'
  }
};
