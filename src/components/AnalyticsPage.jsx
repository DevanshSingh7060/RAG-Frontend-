import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, 
  FileText, AlertTriangle, RefreshCw, BarChart2, Star, ThumbsUp, ThumbsDown
} from 'lucide-react';

export default function AnalyticsPage({ preExpandedRowId, setPreExpandedRowId, sources = [] }) {
  const [displayState, setDisplayState] = useState('filled'); // 'filled' | 'empty' | 'loading' | 'error'
  const [expandedRow, setExpandedRow] = useState(null);
  const [hoveredDayIdx, setHoveredDayIdx] = useState(null);
  const chartRef = useRef(null);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync pre-expanded trace from citation click
  useEffect(() => {
    if (preExpandedRowId) {
      setDisplayState('filled');
      setExpandedRow(preExpandedRowId);
      setPreExpandedRowId(null);
    }
  }, [preExpandedRowId]);

  const toggleRow = (id) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  // Sparkline data (last 7 days query volumes per metric)
  const sparklineData = {
    queries: [15, 22, 18, 30, 24, 35, 42],
    latency: [950, 920, 890, 840, 810, 850, 834],
    score: [88, 89, 90, 91, 91, 92, 92.4],
    cost: [0.012, 0.018, 0.024, 0.045, 0.052, 0.071, 0.084]
  };

  // Main Dual-Axis Chart Data
  const dailyData = [
    { label: 'Mon', queries: 120, latency: 950 },
    { label: 'Tue', queries: 150, latency: 910 },
    { label: 'Wed', queries: 220, latency: 850 },
    { label: 'Thu', queries: 180, latency: 880 },
    { label: 'Fri', queries: 290, latency: 720 },
    { label: 'Sat', queries: 240, latency: 810 },
    { label: 'Sun', queries: 310, latency: 790 },
    { label: 'Today', queries: 325, latency: 834 }
  ];

  // Traces Mock Database
  const traces = [
    {
      id: '1',
      query: 'What are the vector indexing milestones for next Tuesday?',
      filename: 'Q3_Product_Roadmap.pdf',
      page: 4,
      confidence: 'high',
      score: 92,
      latency: '834ms',
      model: 'GPT-4o',
      modelColor: '#10B981',
      sourcesCount: 3,
      feedback: 'up',
      timestamp: '10m ago',
      promptTokens: '1,102',
      compTokens: '145',
      totalTokens: '1,247',
      answer: 'The primary milestone is vector indexing completion scheduled for next Tuesday, alongside client-side streaming optimization.',
      chunks: [
        { text: 'Milestone 2 details: the primary milestones include ' },
        { text: 'vector indexing completion by next Tuesday', highlight: true },
        { text: ' and client-side streaming optimization.' }
      ]
    },
    {
      id: '2',
      query: 'What is the confidence threshold score required for retrieval hygiene?',
      filename: 'RAG_Confidence_Thresholds.md',
      page: 12,
      confidence: 'medium',
      score: 78,
      latency: '624ms',
      model: 'GPT-4o',
      modelColor: '#10B981',
      sourcesCount: 2,
      feedback: 'none',
      timestamp: '2h ago',
      promptTokens: '890',
      compTokens: '94',
      totalTokens: '984',
      answer: 'The core document specifies that high confidence retrieval requires a threshold score above 80%. Retrieved sources below that display warnings.',
      chunks: [
        { text: 'To ensure retrieval hygiene, the core document specifies that high confidence retrieval requires a ' },
        { text: 'threshold score above 80%', highlight: true },
        { text: '.' }
      ]
    },
    {
      id: '3',
      query: 'Are there embedding performance warnings or cold boot latency studies?',
      filename: 'Embeddings_Performance_Study.txt',
      page: 47,
      confidence: 'low',
      score: 34,
      latency: '512ms',
      model: 'Claude 3.5',
      modelColor: '#F59E0B',
      sourcesCount: 1,
      feedback: 'down',
      timestamp: '1d ago',
      promptTokens: '1,280',
      compTokens: '141',
      totalTokens: '1,421',
      answer: 'Additionally, caution is advised when caching large embeddings because of latency penalties during key lookups. Cold boots require disk-seek queries.',
      chunks: [
        { text: 'Some research papers advise caution on caching large embeddings because of ' },
        { text: 'latency penalties', highlight: true },
        { text: '.' }
      ]
    }
  ];

  // Hover SVG chart logic to show tooltip
  const handleChartMouseMove = (e) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const margin = 40; // SVG left padding
    const usableWidth = width - margin * 2;
    const step = usableWidth / (dailyData.length - 1);
    
    let index = Math.round((x - margin) / step);
    index = Math.max(0, Math.min(dailyData.length - 1, index));
    setHoveredDayIdx(index);
  };

  const triggerRetry = () => {
    setDisplayState('loading');
    setTimeout(() => {
      setDisplayState('filled');
    }, 1200);
  };

  // Sparkline builder (renders SVG mini bars)
  const renderSparkline = (data, isLatencyOrCost = false) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const height = 32;
    const spacing = 4;
    const totalBars = data.length;
    const barWidth = 6;
    
    return (
      <svg width={totalBars * (barWidth + spacing) - spacing} height={height} style={{ overflow: 'visible' }}>
        {data.map((val, idx) => {
          const ratio = max === min ? 0.5 : (val - min) / (max - min);
          const barHeight = 6 + ratio * (height - 6);
          const y = height - barHeight;
          const x = idx * (barWidth + spacing);
          return (
            <rect 
              key={idx}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={1.5}
              fill={isLatencyOrCost ? 'url(#sparkLatencyGrad)' : 'url(#sparkQueriesGrad)'}
              opacity={idx === totalBars - 1 ? 1 : 0.45}
            />
          );
        })}
        <defs>
          <linearGradient id="sparkQueriesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="sparkLatencyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div style={styles.outerContainer} className="custom-scrollbar">
      
      {/* Top Header Bar & Interactive Showcase State Swapping */}
      <div style={styles.topHeader}>
        <div style={styles.headerLeft}>
          <h2 style={styles.pageTitle}>Performance Analytics</h2>
          <p style={styles.pageSubtitle}>Observe query speeds, semantic retrieval scores, and cache operations.</p>
        </div>
        
        {/* Toggle switches for demonstrating States */}
        <div style={styles.stateSelector}>
          {['filled', 'empty', 'loading', 'error'].map(st => (
            <button
              key={st}
              style={{
                ...styles.stateBtn,
                backgroundColor: displayState === st ? 'var(--bg-hover)' : 'transparent',
                borderColor: displayState === st ? '#818CF8' : 'var(--border-subtle)',
                color: displayState === st ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
              onClick={() => {
                setExpandedRow(null);
                setDisplayState(st);
              }}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================== */}
      {/* LOADING SHIMMER STATE                                     */}
      {/* ========================================================== */}
      {displayState === 'loading' && (
        <div style={styles.contentGrid}>
          {/* Skeleton Metrics Row */}
          <div style={styles.metricsRow}>
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="skeleton-shimmer" style={{ ...styles.metricCard, height: '120px' }}>
                <div style={{ width: '60px', height: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '2px', marginBottom: '8px' }} />
                <div style={{ width: '90px', height: '28px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginBottom: '16px' }} />
                <div style={{ width: '80px', height: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '2px' }} />
              </div>
            ))}
          </div>

          {/* Skeleton Chart */}
          <div className="skeleton-shimmer" style={{ ...styles.chartCard, height: '280px' }}>
            <div style={{ width: '140px', height: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '2px', marginBottom: '24px' }} />
            <div style={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.03)' }}></div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ERROR STATE                                               */}
      {/* ========================================================== */}
      {displayState === 'error' && (
        <div style={styles.errorContainer}>
          <div style={styles.errorIconBox}>
            <AlertTriangle size={32} style={{ color: '#F43F5E' }} />
          </div>
          <h3 style={styles.errorTitle}>Failed to load analytics feed</h3>
          <p style={styles.errorSubtitle}>The vector tracer synchronization timed out during chunk fetch.</p>
          <button style={styles.retryBtn} onClick={triggerRetry} className="hover-spring">
            <RefreshCw size={14} style={{ marginRight: '6px' }} />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* ========================================================== */}
      {/* EMPTY STATE                                               */}
      {/* ========================================================== */}
      {displayState === 'empty' && (
        <div style={styles.contentGrid}>
          {/* 4 Cards (Zero data) */}
          <div style={styles.metricsRow}>
            {[
              { title: 'Queries', value: '0' },
              { title: 'Avg Latency', value: '0ms' },
              { title: 'Retrieval Score', value: '0.0%' },
              { title: 'Total Cost', value: '$0.000' }
            ].map((card, idx) => (
              <div key={idx} style={styles.metricCard}>
                <span style={styles.metricLabel}>{card.title}</span>
                <span style={styles.metricValue}>{card.value}</span>
                <div style={{ height: '32px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                  No historical trend
                </div>
              </div>
            ))}
          </div>

          {/* Dotted Zero Chart */}
          <div style={styles.chartCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={styles.cardHeaderTitle} className="label-caps-500">Query Volume & Latency Overview</span>
            </div>
            <div style={{ ...styles.chartWrapper, position: 'relative', border: '1px dashed var(--border-subtle)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', minHeight: '200px' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-muted)', fontSize: '13px' }}>
                No active data points recorded yet
              </div>
              <svg width="100%" height="100%" viewBox="0 0 800 200">
                <line x1="40" y1="160" x2="760" y2="160" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>
          </div>

          {/* Empty log panel */}
          <div style={styles.emptyPromptPanel}>
            <Star size={24} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>No queries cataloged</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px', margin: '4px auto 16px' }}>
              Submit questions to RAG in the chat page to begin monitoring confidence indices.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* FILLED STATE                                              */}
      {/* ========================================================== */}
      {displayState === 'filled' && (
        <div style={styles.contentGrid}>
          
          {/* Top Metrics row (4 cards) */}
          <div style={styles.metricsRow}>
            
            {/* Card 1: Queries */}
            <div style={styles.metricCard} className="hover-micro">
              <div style={styles.metricCardHeader}>
                <span style={styles.metricLabel}>Total Queries</span>
                <span style={{ ...styles.trendBadge, color: 'var(--green-accent)', backgroundColor: 'rgba(52, 211, 153, 0.05)' }}>
                  <ArrowUpRight size={12} style={{ marginRight: '2px' }} />
                  8%
                </span>
              </div>
              <div style={styles.metricMainRow}>
                <span style={styles.metricValue}>1,847</span>
                {renderSparkline(sparklineData.queries)}
              </div>
              <span style={styles.metricCardFooter}>Queries submitted past 7d</span>
            </div>

            {/* Card 2: Latency */}
            <div style={styles.metricCard} className="hover-micro">
              <div style={styles.metricCardHeader}>
                <span style={styles.metricLabel}>Avg Latency</span>
                <span style={{ ...styles.trendBadge, color: 'var(--green-accent)', backgroundColor: 'rgba(52, 211, 153, 0.05)' }}>
                  <ArrowDownRight size={12} style={{ marginRight: '2px' }} />
                  12%
                </span>
              </div>
              <div style={styles.metricMainRow}>
                <span style={styles.metricValue}>834ms</span>
                {renderSparkline(sparklineData.latency, true)}
              </div>
              <span style={styles.metricCardFooter}>Avg response round-trip time</span>
            </div>

            {/* Card 3: Retrieval Accuracy */}
            <div style={styles.metricCard} className="hover-micro">
              <div style={styles.metricCardHeader}>
                <span style={styles.metricLabel}>Retrieval Score</span>
                <span style={{ ...styles.trendBadge, color: 'var(--green-accent)', backgroundColor: 'rgba(52, 211, 153, 0.05)' }}>
                  <ArrowUpRight size={12} style={{ marginRight: '2px' }} />
                  1.5%
                </span>
              </div>
              <div style={styles.metricMainRow}>
                <span style={styles.metricValue}>92.4%</span>
                {renderSparkline(sparklineData.score)}
              </div>
              <span style={styles.metricCardFooter}>Accurate semantic chunk matches</span>
            </div>

            {/* Card 4: Cost */}
            <div style={styles.metricCard} className="hover-micro">
              <div style={styles.metricCardHeader}>
                <span style={styles.metricLabel}>Total Cost</span>
                <span style={{ ...styles.trendBadge, color: 'var(--green-accent)', backgroundColor: 'rgba(52, 211, 153, 0.05)' }}>
                  <ArrowDownRight size={12} style={{ marginRight: '2px' }} />
                  4%
                </span>
              </div>
              <div style={styles.metricMainRow}>
                <span style={styles.metricValue} className="token-mono">$0.084</span>
                {renderSparkline(sparklineData.cost, true)}
              </div>
              <span style={styles.metricCardFooter}>Cumulative token pricing (Mono)</span>
            </div>

          </div>

          {/* Dual Axis Line + Bar Chart */}
          <div style={styles.chartCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={styles.cardHeaderTitle} className="label-caps-500">Query Volume & Latency Overview</span>
              <div style={styles.chartLegend}>
                <div style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: '#818CF8' }}></span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Queries (Bars)</span>
                </div>
                <div style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: '#34D399', borderRadius: '0' }}></span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Avg Latency (Line)</span>
                </div>
              </div>
            </div>

            {/* SVG Plot Wrapper */}
            <div 
              ref={chartRef}
              style={styles.chartWrapper}
              onMouseMove={handleChartMouseMove}
              onMouseLeave={() => setHoveredDayIdx(null)}
            >
              <svg width="100%" height="100%" viewBox="0 0 800 200" style={{ overflow: 'visible' }}>
                <defs>
                  {/* Grid / bar gradient */}
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(129, 140, 248, 0.35)" />
                    <stop offset="100%" stopColor="rgba(129, 140, 248, 0.02)" />
                  </linearGradient>
                  
                  {/* Line area gradient */}
                  <linearGradient id="lineFillGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(52, 211, 153, 0.12)" />
                    <stop offset="100%" stopColor="rgba(52, 211, 153, 0.0)" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="40" y1="30" x2="760" y2="30" stroke="var(--border-faint)" strokeWidth="1" />
                <line x1="40" y1="75" x2="760" y2="75" stroke="var(--border-faint)" strokeWidth="1" />
                <line x1="40" y1="120" x2="760" y2="120" stroke="var(--border-faint)" strokeWidth="1" />
                <line x1="40" y1="165" x2="760" y2="165" stroke="var(--border-subtle)" strokeWidth="1.5" />

                {/* Draw query bars */}
                {dailyData.map((day, idx) => {
                  const x = 50 + idx * 98;
                  const barHeight = (day.queries / 350) * 135;
                  const y = 165 - barHeight;
                  return (
                    <rect 
                      key={idx}
                      x={x - 12}
                      y={y}
                      width="24"
                      height={barHeight}
                      rx={3}
                      fill="url(#barGrad)"
                      stroke="rgba(129, 140, 248, 0.15)"
                      strokeWidth="1"
                      style={{ transition: 'opacity 200ms ease' }}
                      opacity={hoveredDayIdx === null || hoveredDayIdx === idx ? 1 : 0.45}
                    />
                  );
                })}

                {/* Latency line path */}
                <path 
                  d="M 50,75 L 148,82 L 246,95 L 344,90 L 442,120 L 540,105 L 638,110 L 736,98"
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Fill area beneath latency line */}
                <path 
                  d="M 50,75 L 148,82 L 246,95 L 344,90 L 442,120 L 540,105 L 638,110 L 736,98 L 736,165 L 50,165 Z"
                  fill="url(#lineFillGrad)"
                />

                {/* Points on latency line */}
                {dailyData.map((day, idx) => {
                  const x = 50 + idx * 98;
                  const pointsY = [75, 82, 95, 90, 120, 105, 110, 98];
                  const y = pointsY[idx];
                  return (
                    <circle 
                      key={idx}
                      cx={x}
                      cy={y}
                      r={hoveredDayIdx === idx ? 5 : 3.5}
                      fill="#34D399"
                      stroke="#070709"
                      strokeWidth={hoveredDayIdx === idx ? 2 : 1.5}
                      style={{ transition: 'r 150ms ease, stroke-width 150ms ease' }}
                    />
                  );
                })}

                {/* Hover line marker */}
                {hoveredDayIdx !== null && (
                  <line 
                    x1={50 + hoveredDayIdx * 98} 
                    y1="30" 
                    x2={50 + hoveredDayIdx * 98} 
                    y2="165" 
                    stroke="rgba(129, 140, 248, 0.4)" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                  />
                )}

                {/* X labels */}
                {dailyData.map((day, idx) => (
                  <text 
                    key={idx} 
                    x={50 + idx * 98} 
                    y="185" 
                    fill={hoveredDayIdx === idx ? 'var(--text-primary)' : 'var(--text-secondary)'} 
                    fontSize="10" 
                    fontFamily="var(--font-primary)"
                    textAnchor="middle"
                    style={{ transition: 'fill 150ms ease' }}
                  >
                    {day.label}
                  </text>
                ))}
              </svg>

              {/* Hover Tooltip Overlay (absolute card coordinates) */}
              {hoveredDayIdx !== null && (
                <div 
                  style={{
                    ...styles.chartTooltipCard,
                    left: `${(hoveredDayIdx / (dailyData.length - 1)) * 75}%`,
                    transform: hoveredDayIdx > 4 ? 'translateX(-100%)' : 'none'
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11px', marginBottom: '4px' }}>
                    {dailyData[hoveredDayIdx].label} Metrics
                  </div>
                  <div style={styles.tooltipRow}>
                    <span style={{ color: 'var(--text-secondary)' }}>Queries:</span>
                    <span style={{ color: '#818CF8', fontWeight: 600 }}>{dailyData[hoveredDayIdx].queries}</span>
                  </div>
                  <div style={styles.tooltipRow}>
                    <span style={{ color: 'var(--text-secondary)' }}>Avg Latency:</span>
                    <span style={{ color: '#34D399', fontWeight: 600 }}>{dailyData[hoveredDayIdx].latency}ms</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* High Fidelity Table */}
          <div style={styles.tableCard}>
            <span style={styles.cardHeaderTitle} className="label-caps-500">Semantic Query Logs</span>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={styles.tableContainer}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.thCell, paddingLeft: '20px' }}>Query</th>
                    <th style={styles.thCell}>Model</th>
                    <th style={styles.thCell}>Sources</th>
                    <th style={styles.thCell}>Confidence</th>
                    <th style={styles.thCell}>Latency</th>
                    <th style={styles.thCell}>Feedback</th>
                    <th style={{ ...styles.thCell, paddingRight: '20px' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {traces.map(trace => {
                    const isExpanded = expandedRow === trace.id;
                    return (
                      <React.Fragment key={trace.id}>
                        {/* Summary row (44px height) */}
                        <tr 
                          style={{
                            ...styles.trSummaryRow,
                            backgroundColor: isExpanded ? 'rgba(129, 140, 248, 0.03)' : 'transparent'
                          }}
                          className="hover-micro"
                          onClick={() => toggleRow(trace.id)}
                        >
                          <td style={{ ...styles.tdQueryCell, paddingLeft: '20px' }}>
                            {trace.query}
                          </td>
                          <td style={styles.tdCell}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ ...styles.modelDotDot, backgroundColor: trace.modelColor }}></span>
                              <span>{trace.model}</span>
                            </div>
                          </td>
                          <td style={styles.tdCell}>
                            <span style={styles.badgeSources}>{trace.sourcesCount} nodes</span>
                          </td>
                          <td style={styles.tdCell}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span 
                                style={{ 
                                  ...styles.modelDotDot, 
                                  backgroundColor: trace.confidence === 'high' ? 'var(--green-accent)' : trace.confidence === 'medium' ? 'var(--amber-accent)' : 'var(--red-accent)' 
                                }}
                              ></span>
                              <span style={{ textTransform: 'capitalize' }}>{trace.confidence}</span>
                            </div>
                          </td>
                          <td style={{ ...styles.tdCell, fontFamily: 'var(--font-mono)' }}>{trace.latency}</td>
                          <td style={styles.tdCell}>
                            {trace.feedback === 'up' && <ThumbsUp size={12} style={{ color: 'var(--green-accent)' }} />}
                            {trace.feedback === 'down' && <ThumbsDown size={12} style={{ color: 'var(--red-accent)' }} />}
                            {trace.feedback === 'none' && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                          </td>
                          <td style={{ ...styles.tdCell, paddingRight: '20px', color: 'var(--text-muted)' }}>{trace.timestamp}</td>
                        </tr>

                        {/* Collapsed / Expanded payload card details */}
                        {isExpanded && (
                          <tr style={styles.expandedWrapperRow}>
                            <td colSpan="7" style={styles.expandedDataCell}>
                              <div style={styles.innerExpansionCard} className="custom-scrollbar">
                                
                                <div style={styles.expandedColGrid}>
                                  
                                  {/* Left col: payload questions */}
                                  <div style={styles.expandMetaSection}>
                                    <span style={styles.detailLabelHeader}>Query Payload</span>
                                    <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>"{trace.query}"</p>
                                    
                                    <span style={{ ...styles.detailLabelHeader, marginTop: '16px' }}>AI Answer Result</span>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{trace.answer}</p>
                                  </div>

                                  {/* Right col: sources chunks lists */}
                                  <div style={styles.expandMetaSection}>
                                    <span style={styles.detailLabelHeader}>Source Chunk Preview (accuracy score {trace.score}%)</span>
                                    <div style={styles.sourcesBoxWrapper}>
                                      <div style={styles.sourcesBoxHeader}>
                                        <FileText size={12} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{trace.filename} (p. {trace.page})</span>
                                      </div>
                                      <div style={styles.chunksBoxText}>
                                        {trace.chunks.map((chnk, cIdx) => (
                                          <span 
                                            key={cIdx} 
                                            style={chnk.highlight ? { backgroundColor: 'rgba(129, 140, 248, 0.15)', borderLeft: '2px solid #818CF8', paddingLeft: '4px', color: 'var(--text-primary)' } : {}}
                                          >
                                            {chnk.text}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                </div>

                                {/* Cost & technical token data metrics */}
                                <div style={styles.expandFooterRow}>
                                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                                    Prompt: <span style={{ color: 'var(--text-primary)' }}>{trace.promptTokens}</span> · 
                                    Completion: <span style={{ color: 'var(--text-primary)' }}>{trace.compTokens}</span> · 
                                    Total: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{trace.totalTokens}</span>
                                  </span>
                                  
                                  <a 
                                    href="https://langsmith.com" 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={styles.inspectLink}
                                  >
                                    Inspect LangSmith trace ➜
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
      )}

    </div>
  );
}

const styles = {
  outerContainer: {
    width: '100%',
    height: '100%',
    padding: '36px 24px',
    maxWidth: '1100px', // Spacious max width
    margin: '0 auto',
    overflowY: 'auto',
    position: 'relative',
    zIndex: 10,
    boxSizing: 'border-box'
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerLeft: {
    textAlign: 'left'
  },
  pageTitle: {
    fontSize: '20px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
    marginBottom: '4px'
  },
  pageSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  stateSelector: {
    display: 'flex',
    gap: '6px',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '3px',
    backgroundColor: '#0a0a0f'
  },
  stateBtn: {
    border: '1px solid transparent',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    transition: 'all 200ms ease'
  },
  contentGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    width: '100%'
  },
  metricCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 300ms var(--ease-spring)',
    textAlign: 'left',
    boxSizing: 'border-box'
  },
  metricCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  metricLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  trendBadge: {
    fontSize: '10px',
    fontWeight: 600,
    padding: '1px 5px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  metricMainRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '8px'
  },
  metricValue: {
    fontSize: '26px',
    fontWeight: 300,
    color: 'var(--text-primary)',
    letterSpacing: '-0.015em'
  },
  metricCardFooter: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  },
  chartCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box'
  },
  cardHeaderTitle: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em'
  },
  chartLegend: {
    display: 'flex',
    gap: '16px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  chartWrapper: {
    width: '100%',
    height: '220px',
    position: 'relative'
  },
  chartTooltipCard: {
    position: 'absolute',
    top: '30px',
    width: '130px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '8px 10px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    zIndex: 100,
    pointerEvents: 'none',
    boxSizing: 'border-box',
    textAlign: 'left'
  },
  tooltipRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    marginTop: '3px'
  },
  tableCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxSizing: 'border-box',
    textAlign: 'left'
  },
  tableContainer: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableHeaderRow: {
    borderBottom: '1px solid var(--border-subtle)',
    height: '38px'
  },
  thCell: {
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    padding: '0 12px'
  },
  trSummaryRow: {
    borderBottom: '1px solid var(--border-faint)',
    height: '44px',
    cursor: 'pointer',
    transition: 'background-color 200ms ease'
  },
  tdQueryCell: {
    padding: '0 12px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    maxWidth: '220px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  tdCell: {
    padding: '0 12px',
    fontSize: '12.5px',
    color: 'var(--text-secondary)'
  },
  modelDotDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%'
  },
  badgeSources: {
    fontSize: '10px',
    backgroundColor: 'var(--bg-hover)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '4px',
    padding: '2px 6px',
    color: 'var(--text-secondary)'
  },
  expandedWrapperRow: {
    backgroundColor: '#0a0a0f'
  },
  expandedDataCell: {
    padding: '0',
    borderBottom: '1px solid var(--border-subtle)'
  },
  innerExpansionCard: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxSizing: 'border-box'
  },
  expandedColGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  expandMetaSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left'
  },
  detailLabelHeader: {
    fontSize: '10px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--text-muted)'
  },
  sourcesBoxWrapper: {
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    backgroundColor: '#070709',
    overflow: 'hidden'
  },
  sourcesBoxHeader: {
    padding: '8px 12px',
    borderBottom: '1px solid var(--border-faint)',
    backgroundColor: 'var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-secondary)'
  },
  chunksBoxText: {
    padding: '12px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxHeight: '120px',
    overflowY: 'auto'
  },
  expandFooterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-faint)',
    paddingTop: '12px',
    fontSize: '11px'
  },
  inspectLink: {
    color: '#818CF8',
    textDecoration: 'none',
    fontWeight: 500
  },
  emptyPromptPanel: {
    border: '1px dashed var(--border-subtle)',
    borderRadius: '12px',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '60px 24px',
    border: '1px solid rgba(244,63,94,0.15)',
    borderRadius: '12px',
    backgroundColor: 'rgba(244,63,94,0.02)',
    maxWidth: '500px',
    margin: '40px auto 0'
  },
  errorIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(244,63,94,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  errorTitle: {
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    marginBottom: '4px'
  },
  errorSubtitle: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '20px',
    maxWidth: '320px'
  },
  retryBtn: {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 16px',
    fontSize: '12px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    transition: 'all 200ms ease'
  }
};
