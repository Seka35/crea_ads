import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, History, LogOut, Download, Eye, CheckCircle2, Cpu, Layers } from 'lucide-react';
import { AdDetailsModal } from '../Results/AdDetailsModal';
import { AspectRatioSelector } from '../Form/AspectRatioSelector';
import type { ClientProfile } from './ClientManagementModal';

interface ClientPortalProps {
  client: ClientProfile;
  onLogout: () => void;
}

const LOADING_STEPS_EN = [
  "Connecting to Private Brand Cluster & Initializing Secure Engine...",
  "Loading Proprietary Brand Guidelines, Audience Data & Identity Rules...",
  "Mining Brand-Specific Angle Frameworks & Hook Structures...",
  "Synthesizing Precision Copywriting (Headline & Primary Positioning)...",
  "Executing High-Definition Visual Composition & Lighting Pass...",
  "Applying Custom Brand Assets, Typographic Overlays & Aspect Ratios...",
  "Final Quality Control & Encrypted Render Delivery..."
];

const STEP_PROGRESS_TARGETS = [14, 28, 42, 56, 70, 84, 96];

export function ClientPortal({ client, onLogout }: ClientPortalProps) {
  const [promptInput, setPromptInput] = useState('');
  const [isPostMode, setIsPostMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(client.defaultAspectRatio || '1:1');
  const [creativeCount, setCreativeCount] = useState<number>(1);
  const [price, setPrice] = useState(client.price || '47');
  const [currency] = useState(client.currency || '$');

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [resultCreatives, setResultCreatives] = useState<any[]>([]);
  const [selectedMockupCreative, setSelectedMockupCreative] = useState<any>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [clientHistory, setClientHistory] = useState<any[]>([]);

  const pendingResultsRef = useRef<any[]>([]);
  const stepTimerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);
  const isApiDoneRef = useRef<boolean>(false);

  const fetchHistory = async () => {
    if (!client.id) return;
    try {
      const res = await fetch(`/api/client-history/${client.id}`, {
        headers: { 'Authorization': localStorage.getItem('app_password') || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setClientHistory(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [client.id]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(stepTimerRef.current);
      clearInterval(progressTimerRef.current);
    };
  }, []);

  const stepIndexRef = useRef(0);

  const advanceStep = (stepIdx: number) => {
    setCurrentStepIndex(stepIdx);
    stepIndexRef.current = stepIdx;
    
    // Ensure progress percent matches or exceeds step proportion
    const minPercent = Math.round(((stepIdx + 1) / LOADING_STEPS_EN.length) * 92);
    setProgressPercent(prev => Math.max(prev, minPercent - 10));

    // Mark previous steps as completed
    const completed = [];
    for (let i = 0; i < stepIdx; i++) {
      completed.push(i);
    }
    setCompletedSteps(completed);

    const isApiFinished = isApiDoneRef.current;
    const isLastStep = stepIdx >= LOADING_STEPS_EN.length - 1;

    if (isLastStep) {
      if (isApiFinished) {
        finishGeneration();
      } else {
        // Poll continuously every 500ms on last step until API finishes
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = setInterval(() => {
          if (isApiDoneRef.current) {
            clearInterval(stepTimerRef.current);
            finishGeneration();
          }
        }, 500);
      }
    } else {
      // Step pace: ~8.5s per step normally, or ~1.2s if API already finished
      const nextDelay = isApiFinished ? 1200 : 8500;
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = setTimeout(() => {
        advanceStep(stepIdx + 1);
      }, nextDelay);
    }
  };

  const finishGeneration = () => {
    clearInterval(stepTimerRef.current);
    clearInterval(progressTimerRef.current);
    setCompletedSteps(LOADING_STEPS_EN.map((_, i) => i));
    setCurrentStepIndex(LOADING_STEPS_EN.length - 1);
    stepIndexRef.current = LOADING_STEPS_EN.length - 1;
    setProgressPercent(100);

    setTimeout(() => {
      setIsGenerating(false);
      if (pendingResultsRef.current && pendingResultsRef.current.length > 0) {
        setResultCreatives(pendingResultsRef.current);
      }
      fetchHistory();
    }, 500);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsGenerating(true);
    setResultCreatives([]);
    pendingResultsRef.current = [];
    isApiDoneRef.current = false;
    setCurrentStepIndex(0);
    stepIndexRef.current = 0;
    setProgressPercent(4);
    setCompletedSteps([]);

    // Continuous ultra-smooth progress bar ticker
    clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setProgressPercent(prev => {
        const target = STEP_PROGRESS_TARGETS[stepIndexRef.current] || 96;
        if (isApiDoneRef.current) {
          return prev < 99 ? prev + 1.5 : 100;
        }
        if (prev < target) {
          return prev + 0.8;
        }
        return prev;
      });
    }, 300);

    // Start realistic step timer chain
    advanceStep(0);

    try {
      const res = await fetch('/api/client-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('app_password') || ''
        },
        body: JSON.stringify({
          clientId: client.id,
          promptInput,
          isPostMode,
          price: isPostMode ? undefined : price,
          currency,
          aspectRatio,
          count: creativeCount
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await res.json();
      pendingResultsRef.current = data.items || [data.item];
      isApiDoneRef.current = true;

      // Force instant finish trigger if steps reached last step
      finishGeneration();

    } catch (e: any) {
      console.error(e);
      clearInterval(stepTimerRef.current);
      clearTimeout(stepTimerRef.current);
      clearInterval(progressTimerRef.current);
      alert('Error: ' + (e.message || 'Generation failed'));
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, title?: string) => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${title || 'creative-asset'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const displayHandle = client.instaHandle ? client.instaHandle.replace(/^@/, '') : client.username;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {client.logoUrl ? (
            <img src={client.logoUrl} alt={client.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} />
          ) : (
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.3rem' }}>
              {client.name.substring(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{client.name}</h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>@{displayHandle} • Creative Portal</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              fetchHistory();
              setIsHistoryOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
          >
            <History size={18} />
            My History ({clientHistory.length})
          </button>
          <button 
            onClick={onLogout} 
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flex: 1, padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        
        {/* Form Card */}
        <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Generate Your Creative Assets ✨
            </h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>
              Select your format and number of variations. Leave prompt blank to use your default brand strategy.
            </p>
          </div>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Format Toggle (Ads vs Post) */}
            <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <button 
                type="button" 
                onClick={() => setIsPostMode(false)}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: !isPostMode ? 'var(--accent-primary)' : 'transparent',
                  color: !isPostMode ? '#fff' : 'var(--text-tertiary)',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                📢 Sponsored Ad
              </button>
              <button 
                type="button" 
                onClick={() => setIsPostMode(true)}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: isPostMode ? 'var(--accent-primary)' : 'transparent',
                  color: isPostMode ? '#fff' : 'var(--text-tertiary)',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                📸 Organic Post
              </button>
            </div>

            {/* Quantity & Format Selection Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Aspect Ratio Selector */}
              <div className="form-group">
                <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                  Image Format / Aspect Ratio
                </label>
                <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
              </div>

              {/* Creative Quantity Picker */}
              <div className="form-group">
                <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={16} color="var(--accent-primary)" /> Number of Creatives to Generate
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCreativeCount(num)}
                      style={{
                        flex: 1, padding: '0.65rem 0.5rem', borderRadius: 'var(--radius-sm)',
                        border: creativeCount === num ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
                        background: creativeCount === num ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                        color: creativeCount === num ? '#ffffff' : 'var(--text-secondary)',
                        fontWeight: creativeCount === num ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {num} {num === 1 ? 'Asset' : 'Assets'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!isPostMode && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Displayed Offer Price:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{currency}</span>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    style={{ width: '100px', padding: '0.4rem 0.8rem' }} 
                  />
                </div>
              </div>
            )}

            {/* Prompt Input Textarea - OPTIONAL */}
            <div className="form-group">
              <label style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Describe your specific idea or offer (Optional)
              </label>
              <textarea 
                rows={4}
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                placeholder="Optional - Enter a specific campaign topic, promo code, or seasonal offer (leave blank to let our system use your pre-configured brand strategy)."
                style={{ fontSize: '1rem', padding: '1rem', lineHeight: '1.5' }}
              />
            </div>

            {/* Big Action Button */}
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isGenerating}
              style={{
                padding: '1.25rem', fontSize: '1.15rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                borderRadius: 'var(--radius-md)', boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Sparkles size={22} />
              Generate {creativeCount} Creative{creativeCount > 1 ? 's' : ''}
            </button>
          </form>
        </div>

        {/* Latest Results Section */}
        {resultCreatives.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <CheckCircle2 color="var(--success)" /> {resultCreatives.length} Creative{resultCreatives.length > 1 ? 's' : ''} Ready!
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: resultCreatives.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem' }}>
              {resultCreatives.map((item, idx) => (
                <div key={item.id || idx} className="glass-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  <div style={{ width: '100%', aspectRatio: '1/1', background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={item.imageUrl} alt={`Result ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Option #{idx + 1} • {item.isPostMode ? 'Organic Post' : `Ad (${item.currency}${item.price})`} • Format {item.aspectRatio || '1:1'}
                      </span>
                      <h4 style={{ fontSize: '1.15rem', margin: '0.25rem 0 0.5rem 0' }}>
                        {item.creative?.headline || `Creative Visual #${idx + 1}`}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {item.creative?.primary_text}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                      <button 
                        onClick={() => setSelectedMockupCreative(item)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.65rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600 }}
                      >
                        <Eye size={16} /> Mockup
                      </button>

                      <button 
                        onClick={() => handleDownload(item.imageUrl, item.creative?.headline)}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '0.65rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600 }}
                      >
                        <Download size={16} /> Download
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* HIGH-TECH FUTURISTIC LOADING OVERLAY */}
      {isGenerating && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(8, 10, 20, 0.94)', backdropFilter: 'blur(16px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: '640px', padding: '3rem 2.5rem',
            textAlign: 'center', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 0 80px rgba(99, 102, 241, 0.25)', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            {/* Glowing top line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)' }} />

            {/* Central Icon Spinner */}
            <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 1.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
                border: '3px solid transparent', borderTopColor: 'var(--accent-primary)', borderRightColor: '#a855f7',
                animation: 'spin 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
              }} />
              <div style={{
                position: 'absolute', width: '70%', height: '70%', borderRadius: '50%',
                border: '2px solid transparent', borderBottomColor: '#ec4899',
                animation: 'spin 2s linear infinite reverse'
              }} />
              <Cpu size={36} color="var(--accent-primary)" />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Proprietary Engine Processing...
            </h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', margin: '0 0 1.25rem 0' }}>
              Generating {creativeCount} custom visual asset{creativeCount > 1 ? 's' : ''} for {client.name}
            </p>

            {/* Live Active Pulse Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '100px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: '0.82rem', marginBottom: '1.75rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 10px #4ade80', animation: 'pulse 1.5s infinite' }} />
              <span>Private Brand Cluster active • Processing custom rules</span>
            </div>

            {/* Progress Bar Container */}
            <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '100px', height: '14px', overflow: 'hidden', marginBottom: '2rem', padding: '2px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{
                height: '100%', width: `${progressPercent.toFixed(1)}%`, borderRadius: '100px',
                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                transition: 'width 0.3s ease-out', boxShadow: '0 0 15px rgba(168, 85, 247, 0.6)'
              }} />
            </div>

            {/* Multi-step Status Logs */}
            <div style={{
              width: '100%', background: 'rgba(0, 0, 0, 0.4)', borderRadius: 'var(--radius-md)', padding: '1.25rem',
              textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {LOADING_STEPS_EN.map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                const isCurrent = currentStepIndex === idx;
                if (idx > currentStepIndex) return null;

                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem',
                    color: isCurrent ? '#ffffff' : isDone ? '#4ade80' : 'var(--text-tertiary)',
                    opacity: isCurrent ? 1 : 0.85, transition: 'all 0.3s'
                  }}>
                    {isDone ? (
                      <CheckCircle2 size={16} color="#4ade80" />
                    ) : (
                      <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    )}
                    <span style={{ fontWeight: isCurrent ? 600 : 400 }}>{step}</span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* Instagram Mockup Modal for Client */}
      {selectedMockupCreative && (
        <AdDetailsModal 
          ad={selectedMockupCreative.creative}
          imageState={{ url: selectedMockupCreative.imageUrl, loading: false }}
          clientLogoUrl={client.logoUrl}
          clientInstaHandle={client.instaHandle || client.username}
          onClose={() => setSelectedMockupCreative(null)}
        />
      )}

      {/* Client History Modal */}
      {isHistoryOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)', width: '90%', maxWidth: '700px',
            maxHeight: '85vh', borderRadius: 'var(--radius-lg)', padding: '2rem',
            overflowY: 'auto', border: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <History /> Past Creative History
              </h2>
              <button onClick={() => setIsHistoryOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {clientHistory.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '3rem 0' }}>
                No past creatives found in your history.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {clientHistory.map(item => (
                  <div key={item.id} className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '70px', height: '70px', background: '#000', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={item.imageUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        {item.isPostMode ? 'Organic Post' : `Ad (${item.currency}${item.price})`} • Format {item.aspectRatio || '1:1'}
                      </span>
                      <h4 style={{ margin: '0.2rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {item.creative?.headline || item.promptInput || 'Creative Asset'}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
                        {new Date(item.date).toLocaleString()}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedMockupCreative(item);
                          setIsHistoryOpen(false);
                        }}
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleDownload(item.imageUrl, item.creative?.headline)}
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
