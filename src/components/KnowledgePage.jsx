import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, File, Check, RefreshCw } from 'lucide-react';


export default function KnowledgePage({ indexedDocsCount, onUploadComplete }) {

  const [collections, setCollections] = useState([
    {
      id: "db",
      name: "Uploaded Documents",
      count: "0 docs",
      updated: "Just now",
      files: [],
    },
  ]);
  const [step, setStep] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [uploadingFilename, setUploadingFilename] = useState("");
  const fileInputRef = useRef(null);


  const handleFileUpload = async (e) => {
    console.log("handleFileUpload fired");

    const file = e.target.files[0];



    if (!file) {
      console.log("No file selected");
      return;
    }

    setUploadingFilename(file.name);
    setStep(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/ingest", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", res.status);

      if (res.ok) {
        await fetchDocuments();

        setProgress(100);
        setStep(4);

        if (onUploadComplete) {
          onUploadComplete(file.name);
        }
      }
      else {
        console.error("Upload failed");
        setStep(-1);
      }
    } catch (err) {
      console.error("Ingest error:", err);
      setStep(-1);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const fetchDocuments = async () => {
    try {


      const res = await fetch("http://127.0.0.1:8000/documents");

      console.log("Status:", res.status);

      const data = await res.json();



      setCollections([
        {
          id: "db",
          name: "Database Docs",
          count: `${data.documents.length} docs`,
          updated: "Just now",
          files: data.documents,
        },
      ]);


    } catch (err) {
      console.error("fetchDocuments error:", err);
    }
  };
  // Mobile viewport width listener
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Simulated stepper updates
  useEffect(() => {
    if (step === -1) return;

    let timer;
    if (step === 0) {
      timer = setTimeout(() => setStep(1), 1200);
    } else if (step === 1) {
      timer = setTimeout(() => {
        setStep(2);
        setProgress(0);
      }, 1000);
    } else if (step === 2) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep(3);
            return 100;
          }
          return prev + 10;
        });
      }, 120);
      return () => clearInterval(interval);
    } else if (step === 3) {
      timer = setTimeout(() => setStep(4), 1000);
    } else if (step === 4) {
      timer = setTimeout(() => {
        onUploadComplete(uploadingFilename);
        setStep(-1);
        setProgress(0);
        setUploadingFilename('');
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [step]);

  const triggerUpload = () => {

    console.log(fileInputRef.current);

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };


  return (
    <div style={{ ...styles.container, padding: isMobile ? '16px 16px 80px 16px' : '40px' }} className="custom-scrollbar">
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Knowledge</h2>
        <p style={styles.subtitle}>Manage your document collections and knowledge bases.</p>
      </div>

      {/* Grid of collections */}
      <div style={styles.grid}>
        {collections.map(col => (
          <div key={col.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardName}>{col.name}</span>
              <span style={styles.docPill} className="caption">{col.count}</span>
            </div>
            <div style={styles.cardBody}>
              <span style={styles.updatedText}>Last updated {col.updated}</span>
              <div style={styles.fileList}>
                {col.files.map((file, fIdx) => (
                  <div key={fIdx} style={styles.fileItem} className="chip-mono">
                    <File size={11} style={{ marginRight: '6px', color: 'var(--text-muted)' }} />
                    <span>{file}</span>
                  </div>
                ))}
                {col.id === 'project-docs' && indexedDocsCount > 3 && (
                  <div style={styles.fileItem} className="chip-mono">
                    <File size={11} style={{ marginRight: '6px', color: 'var(--text-muted)' }} />
                    <span>{uploadingFilename}</span>
                  </div>
                )}
              </div>
            </div>
            <div style={styles.cardFooter}>
              <button style={styles.ghostBtn} className="caption hover-color">
                <RefreshCw size={12} style={{ marginRight: '4px' }} /> Re-index
              </button>
              <button style={styles.ghostBtn} className="caption hover-color"
                onClick={triggerUpload}>
                + Add docs
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <div style={styles.uploadSection}>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          accept=".pdf,.docx,.doc,.txt,.md"
        />

        <div
          style={{ ...styles.uploadZone, padding: isMobile ? '24px' : '40px' }}
          onClick={triggerUpload}
        >
          <div style={styles.uploadIcon}>
            <UploadCloud size={32} />
          </div>

          <span style={styles.uploadTitle}>Drop files here</span>

          <button
            type="button"
            style={styles.browseLink}
            onClick={(e) => {
              e.stopPropagation();
              triggerUpload();
            }}
          >
            or browse files
          </button>

          <span style={styles.uploadCaption} className="caption">
            PDF · DOCX · TXT · MD · Max 50MB
          </span>
        </div>
        {/* Processing State Inline */}
        {step !== -1 && (
          <div style={styles.processingRow}>
            <div style={styles.processingFile}>
              <File size={16} style={{ color: '#818CF8', marginRight: '10px' }} />
              <span style={styles.processingName}>{uploadingFilename}</span>
            </div>

            <div style={styles.progressTimeline}>
              <span style={styles.stepIndicator}>
                {step === 0 ? 'Reading PDF...' :
                  step === 1 ? 'Chunking Nodes...' :
                    step === 2 ? `Embedding vectors (${progress}%)...` :
                      step === 3 ? 'Storing vectors...' :
                        'Ingestion Complete'}
              </span>

              {/* Progress bar track */}
              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: step === 4 ? '100%' : step === 2 ? `${progress}%` : step > 2 ? '100%' : '15%',
                    background: step === 4
                      ? 'linear-gradient(90deg, #818CF8, #38BDF8, #34D399, #A78BFA)'
                      : 'var(--amber-accent)'
                  }}
                />
              </div>

              {step === 4 ? (
                <div style={styles.completeIcon}><Check size={12} /></div>
              ) : (
                <span style={styles.percentText} className="token-mono">
                  {step === 2 ? `${progress}%` : '...'}
                </span>
              )}
            </div>
          </div>
        )}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '220px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px'
  },
  cardName: {
    fontFamily: 'var(--font-primary)',
    fontSize: '16px',
    fontWeight: 500,
    color: 'var(--text-primary)'
  },
  docPill: {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-faint)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--text-secondary)',
    padding: '2px 8px'
  },
  cardBody: {
    flex: 1,
    marginBottom: '16px'
  },
  updatedText: {
    fontFamily: 'var(--font-primary)',
    fontSize: '12px',
    color: 'var(--text-muted)',
    display: 'block',
    marginBottom: '10px'
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-faint)'
  },
  ghostBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    transition: 'color var(--t-micro)'
  },
  uploadSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  uploadZone: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px dashed var(--border-subtle)',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'border-color var(--t-normal)'
  },
  uploadIcon: {
    color: 'var(--text-muted)'
  },
  uploadTitle: {
    fontFamily: 'var(--font-primary)',
    fontSize: '16px',
    fontWeight: 300,
    color: 'var(--text-secondary)'
  },
  browseLink: {
    color: '#818CF8',
    backgroundColor: 'transparent',
    border: 'none',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '14px'
  },
  uploadCaption: {
    color: 'var(--text-muted)'
  },
  processingRow: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  processingFile: {
    display: 'flex',
    alignItems: 'center'
  },
  processingName: {
    fontFamily: 'var(--font-primary)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    fontWeight: 500
  },
  progressTimeline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px'
  },
  stepIndicator: {
    fontFamily: 'var(--font-primary)',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    width: '150px',
    flexShrink: 0
  },
  progressTrack: {
    flex: 1,
    height: '3px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 'var(--radius-full)',
    transition: 'width 150ms ease-out'
  },
  completeIcon: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: 'var(--green-accent)',
    color: '#070709',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  percentText: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    width: '28px',
    textAlign: 'right'
  }
};
