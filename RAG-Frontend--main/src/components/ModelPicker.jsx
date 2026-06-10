import React from 'react';

export default function ModelPicker({
  currentModel,
  onSelectModel,
  onClose,
  autoRoute,
  onToggleAutoRoute
}) {
  const models = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      context: '128k',
      speed: 'Balanced',
      color: '#10B981'
    },
    {
      id: 'claude-3-5',
      name: 'Claude 3.5',
      provider: 'Anthropic',
      context: '200k',
      speed: 'Powerful',
      color: '#F59E0B'
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      context: '1M',
      speed: 'Fast',
      color: '#4285F4'
    },
    {
      id: 'mixtral',
      name: 'Mixtral',
      provider: 'Mistral',
      context: '32k',
      speed: 'Fast',
      color: '#A78BFA'
    }
  ];

  const triggerHaptic = (type) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'medium') navigator.vibrate(40);
      else if (type === 'selection') navigator.vibrate(10);
    }
  };

  const handleSelect = (modelId) => {
    triggerHaptic('medium');
    onSelectModel(modelId);
    setTimeout(() => {
      onClose();
    }, 280);
  };

  return (
    <>
      <div style={styles.backdrop} onClick={onClose}></div>

      <div style={styles.container} className="custom-scrollbar">
        <div style={styles.header} className="label-caps-500">
          Switch model
        </div>

        <div style={styles.list}>
          {models.map(model => {
            const isActive = currentModel === model.id;
            return (
              <div
                key={model.id}
                style={{
                  ...styles.row,
                  backgroundColor: isActive ? 'rgba(129, 140, 248, 0.08)' : 'transparent',
                  borderLeft: isActive ? '2px solid #818CF8' : '2px solid transparent',
                  paddingLeft: isActive ? '10px' : '12px'
                }}
                className={`hover-micro ${isActive ? 'model-row-active' : ''}`}
                onClick={() => handleSelect(model.id)}
              >
                <div style={styles.rowLeft}>
                  <span style={{ ...styles.dot, backgroundColor: model.color }}></span>
                  <div style={styles.details}>
                    <span style={{
                      ...styles.name,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-primary)'
                    }}>{model.name}</span>
                    <span style={styles.subtext}>{model.provider} · {model.context}</span>
                  </div>
                </div>
                <span style={styles.speedTag} className="caption">{model.speed}</span>
              </div>
            );
          })}

          <div style={styles.divider}></div>
        </div>

        <div style={styles.footer}>
          <span style={styles.footerText}>Auto-routing</span>
          <button 
            style={{
              ...styles.toggle,
              backgroundColor: autoRoute ? '#34D399' : 'var(--bg-hover)',
              justifyContent: autoRoute ? 'flex-end' : 'flex-start'
            }}
            onClick={() => {
              triggerHaptic('selection');
              onToggleAutoRoute();
            }}
          >
            <span style={styles.toggleKnob}></span>
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 990,
    backgroundColor: 'transparent'
  },
  container: {
    position: 'absolute',
    top: '44px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '300px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    animation: 'wordStreamReveal 280ms cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  header: {
    padding: '10px 10px 4px',
    fontSize: '11px',
    fontWeight: 500
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  row: {
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color var(--t-micro)'
  },
  rowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0
  },
  details: {
    display: 'flex',
    flexDirection: 'column'
  },
  name: {
    fontFamily: 'var(--font-primary)',
    fontSize: '14px',
    fontWeight: 400
  },
  subtext: {
    fontFamily: 'var(--font-primary)',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  speedTag: {
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-hover)',
    borderRadius: 'var(--radius-xs)',
    padding: '2px 6px',
    fontSize: '11px'
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-faint)',
    margin: '6px 4px'
  },
  footer: {
    padding: '8px 10px 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  footerText: {
    fontFamily: 'var(--font-primary)',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  toggle: {
    width: '28px',
    height: '16px',
    borderRadius: 'var(--radius-full)',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 150ms var(--ease-standard)'
  },
  toggleKnob: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#070709',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
  }
};
