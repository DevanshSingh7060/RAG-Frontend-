import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, File, X, Check } from 'lucide-react';

export default function UploadZone({ onUploadComplete, onCancel }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(-1); // -1: idle, 0: Reading, 1: Chunking, 2: Embedding, 3: Indexing, 4: Ready
  const [embeddingProgress, setEmbeddingProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);

  const fileInputRef = useRef(null);

  // Simulated processing timer
  useEffect(() => {
    if (step === -1) return;

    let timer;
    if (step === 0) {
      // Step 0: Reading PDF
      timer = setTimeout(() => setStep(1), 1800);
    } else if (step === 1) {
      // Step 1: Chunking
      timer = setTimeout(() => {
        setStep(2);
        setEmbeddingProgress(0);
      }, 1500);
    } else if (step === 2) {
      // Step 2: Generating Embeddings with Progress bar
      const interval = setInterval(() => {
        setEmbeddingProgress(prev => {
          if (prev >= 312) {
            clearInterval(interval);
            setStep(3);
            return 312;
          }
          return Math.min(prev + 12, 312);
        });
      }, 150);
      return () => clearInterval(interval);
    } else if (step === 3) {
      // Step 3: Storing vectors
      timer = setTimeout(() => setStep(4), 1500);
    } else if (step === 4) {
      // Step 4: Ready! Call parent
      timer = setTimeout(() => {
        onUploadComplete(file.name);
      }, 1200);
    }

    return () => clearTimeout(timer);
  }, [step, file]);

  // Handle countdown timer
  useEffect(() => {
    if (step >= 0 && step < 4) {
      const interval = setInterval(() => {
        setTimeLeft(prev => Math.max(prev - 1, 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      startUpload(e.target.files[0]);
    }
  };

  const startUpload = (fileObj) => {
    setFile({
      name: fileObj.name,
      size: (fileObj.size / (1024 * 1024)).toFixed(2) + ' MB'
    });
    setStep(0);
  };

  const resetUpload = () => {
    setFile(null);
    setStep(-1);
    setEmbeddingProgress(0);
    setTimeLeft(45);
  };

  const progressPercent = Math.round((embeddingProgress / 312) * 100);

  return (
    <div style={styles.centerContainer}>
      {step === -1 ? (
        /* SCREEN 4: IDLE UPLOAD ZONE */
        <div 
          style={{
            ...styles.uploadZone,
            borderColor: isDragOver ? 'var(--accent-primary)' : 'var(--border-default)',
            borderStyle: isDragOver ? 'solid' : 'dashed',
            backgroundColor: isDragOver ? 'var(--accent-bg)' : 'var(--bg-surface)',
            boxShadow: isDragOver ? '0 0 20px rgba(124, 111, 255, 0.15)' : 'none'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div style={styles.uploadContent}>
            <div 
              style={{
                ...styles.iconContainer,
                color: isDragOver ? 'var(--accent-primary)' : 'var(--text-muted)',
                transform: isDragOver ? 'scale(1.1)' : 'scale(1)'
              }}
              className="animate-float-up"
            >
              <UploadCloud size={32} />
            </div>

            <h3 style={styles.heading} className="heading-l">
              Drop files here
            </h3>
            
            <button 
              style={styles.browseLink} 
              onClick={() => fileInputRef.current?.click()}
            >
              or browse files
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt,.md"
            />

            <span style={styles.captionText} className="caption">
              PDF · DOCX · TXT · MD · Max 50MB
            </span>
          </div>
        </div>
      ) : (
        /* SCREEN 4: PROCESSING STATE */
        <div style={styles.pipelineContainer}>
          {/* File Card */}
          <div style={styles.fileCard}>
            <div style={styles.fileCardLeft}>
              <File size={24} style={{ color: 'var(--green-accent)', marginRight: '12px' }} />
              <div style={styles.fileDetails}>
                <span style={styles.fileName}>{file.name}</span>
                <span style={styles.fileSize} className="caption">{file.size}</span>
              </div>
            </div>
            <button style={styles.removeBtn} onClick={resetUpload} className="hover-color">
              <X size={14} />
            </button>
          </div>

          {/* Stepper Timeline */}
          <div style={styles.pipelineStepper}>
            <div style={styles.timelineLine}></div>

            {/* Step 1: Reading */}
            <div 
              style={{
                ...styles.stepRow,
                backgroundColor: step === 0 ? 'var(--amber-bg)' : 'transparent'
              }}
            >
              <div style={styles.stepIconWrapper}>
                {step > 0 ? (
                  <div style={styles.stepCompleteCircle}><Check size={12} /></div>
                ) : step === 0 ? (
                  <div style={styles.stepSpinner}></div>
                ) : (
                  <div style={styles.stepPendingCircle}></div>
                )}
              </div>
              <div style={styles.stepText}>
                <span style={styles.stepName}>Reading PDF</span>
                {step === 0 && <span style={styles.stepDetail}>Analyzing structure...</span>}
                {step > 0 && <span style={styles.stepDetailCompleted}>47 pages · 31,204 words</span>}
              </div>
            </div>

            {/* Step 2: Chunking */}
            <div 
              style={{
                ...styles.stepRow,
                backgroundColor: step === 1 ? 'var(--amber-bg)' : 'transparent'
              }}
            >
              <div style={styles.stepIconWrapper}>
                {step > 1 ? (
                  <div style={styles.stepCompleteCircle}><Check size={12} /></div>
                ) : step === 1 ? (
                  <div style={styles.stepSpinner}></div>
                ) : (
                  <div style={styles.stepPendingCircle}></div>
                )}
              </div>
              <div style={styles.stepText}>
                <span style={styles.stepName}>Chunking text</span>
                {step === 1 && <span style={styles.stepDetail}>Dividing nodes...</span>}
                {step > 1 && <span style={styles.stepDetailCompleted}>312 chunks · avg 128 tokens</span>}
              </div>
            </div>

            {/* Step 3: Embeddings */}
            <div 
              style={{
                ...styles.stepRow,
                backgroundColor: step === 2 ? 'var(--amber-bg)' : 'transparent',
                height: step === 2 ? '72px' : '48px'
              }}
            >
              <div style={styles.stepIconWrapper}>
                {step > 2 ? (
                  <div style={styles.stepCompleteCircle}><Check size={12} /></div>
                ) : step === 2 ? (
                  <div style={styles.stepSpinner}></div>
                ) : (
                  <div style={styles.stepPendingCircle}></div>
                )}
              </div>
              <div style={styles.stepText}>
                <span style={styles.stepName}>Generating embeddings</span>
                {step === 2 && (
                  <div style={styles.progressContainer}>
                    <span style={styles.stepDetail}>{embeddingProgress} / 312 embedded</span>
                    <div style={styles.progressBarTrack}>
                      <div 
                        style={{ 
                          ...styles.progressBarFill, 
                          width: `${progressPercent}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
                {step > 2 && <span style={styles.stepDetailCompleted}>312 vectors generated</span>}
              </div>
            </div>

            {/* Step 4: Storing */}
            <div 
              style={{
                ...styles.stepRow,
                backgroundColor: step === 3 ? 'var(--amber-bg)' : 'transparent'
              }}
            >
              <div style={styles.stepIconWrapper}>
                {step > 3 ? (
                  <div style={styles.stepCompleteCircle}><Check size={12} /></div>
                ) : step === 3 ? (
                  <div style={styles.stepSpinner}></div>
                ) : (
                  <div style={styles.stepPendingCircle}></div>
                )}
              </div>
              <div style={styles.stepText}>
                <span style={styles.stepName}>Storing vectors</span>
                {step === 3 && <span style={styles.stepDetail}>Indexing FAISS database...</span>}
                {step > 3 && <span style={styles.stepDetailCompleted}>Indices populated successfully</span>}
              </div>
            </div>

            {/* Step 5: Ready */}
            <div 
              style={{
                ...styles.stepRow,
                backgroundColor: step === 4 ? 'var(--green-bg)' : 'transparent'
              }}
            >
              <div style={styles.stepIconWrapper}>
                {step === 4 ? (
                  <div style={styles.stepCompleteCircle}><Check size={12} /></div>
                ) : (
                  <div style={styles.stepPendingCircle}></div>
                )}
              </div>
              <div style={styles.stepText}>
                <span style={{
                  ...styles.stepName,
                  color: step === 4 ? 'var(--green-accent)' : 'var(--text-muted)'
                }}>Ready</span>
                {step === 4 && <span style={styles.stepDetailCompleted}>RAG ingestion complete</span>}
              </div>
            </div>
          </div>

          {/* Footer countdown */}
          <div style={styles.pipelineFooter}>
            {step < 4 ? (
              <>
                <span style={styles.timeLeft}>~{timeLeft} seconds remaining</span>
                <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
              </>
            ) : (
              <span style={{ ...styles.timeLeft, color: 'var(--green-accent)' }}>Ingestion successful! Opening workspace...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  centerContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0'
  },
  uploadZone: {
    width: '640px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 'var(--radius-xl)',
    border: '1px dashed var(--border-default)',
    padding: '48px',
    cursor: 'pointer',
    transition: 'all 150ms var(--ease-snappy)'
  },
  uploadContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    transition: 'all 150ms var(--ease-snappy)'
  },
  heading: {
    color: 'var(--text-secondary)',
    marginBottom: '8px',
    fontWeight: 300
  },
  browseLink: {
    fontFamily: 'var(--font-primary)',
    fontSize: '13px',
    color: 'var(--accent-primary)',
    textDecoration: 'underline',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '12px'
  },
  captionText: {
    color: 'var(--text-muted)'
  },
  pipelineContainer: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  fileCard: {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  fileCardLeft: {
    display: 'flex',
    alignItems: 'center'
  },
  fileDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  fileName: {
    fontFamily: 'var(--font-primary)',
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--text-primary)'
  },
  fileSize: {
    color: 'var(--text-muted)'
  },
  removeBtn: {
    color: 'var(--text-muted)',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  pipelineStepper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '4px'
  },
  timelineLine: {
    position: 'absolute',
    left: '13px',
    top: '16px',
    bottom: '16px',
    width: '1px',
    borderLeft: '1px dashed var(--border-subtle)',
    zIndex: 1
  },
  stepRow: {
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    zIndex: 2,
    transition: 'all 200ms var(--ease-snappy)',
    minWidth: 0
  },
  stepIconWrapper: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  stepPendingCircle: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '1px solid var(--border-default)',
    backgroundColor: 'transparent'
  },
  stepCompleteCircle: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: 'var(--green-accent)',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepSpinner: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '2px solid transparent',
    borderTopColor: 'var(--amber-accent)',
    borderRightColor: 'var(--amber-accent)',
    animation: 'spin 1s linear infinite'
  },
  stepText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    flex: 1
  },
  stepName: {
    fontFamily: 'var(--font-primary)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    fontWeight: 500
  },
  stepDetail: {
    fontFamily: 'var(--font-primary)',
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  stepDetailCompleted: {
    fontFamily: 'var(--font-primary)',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
    marginTop: '2px'
  },
  progressBarTrack: {
    width: '100%',
    height: '3px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--amber-accent)',
    borderRadius: 'var(--radius-full)',
    transition: 'width 150ms ease-out'
  },
  pipelineFooter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px'
  },
  timeLeft: {
    fontFamily: 'var(--font-primary)',
    fontSize: '13px',
    color: 'var(--text-muted)'
  },
  cancelBtn: {
    fontFamily: 'var(--font-primary)',
    fontSize: '13px',
    color: 'var(--text-muted)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer'
  }
};
