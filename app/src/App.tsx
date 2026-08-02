import React, { useState, useEffect } from 'react';
import { AdInputForm } from './components/Form/AdInputForm';
import { AdResultsView } from './components/Results/AdResultsView';
import { useAdGeneration } from './hooks/useAdGeneration';
import { Zap, Lock, History, X, Wrench } from 'lucide-react';
import DebugModal from './components/DebugModal';

function App() {
  const { isGenerating, progressText, skeleton, buckets, adImages, error, generatePipeline, exportData, retryImage, saveToHistory, loadFromHistory, getHistoryList } = useAdGeneration();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  useEffect(() => {
    if (isHistoryOpen) {
      getHistoryList().then(setHistoryList);
    }
  }, [isHistoryOpen]);

  useEffect(() => {
    if (localStorage.getItem('app_password')) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('app_password', password);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('app_password');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <form className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }} onSubmit={handleLogin}>
          <Lock size={48} color="var(--accent-primary)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '2rem' }}>Accès Sécurisé</h2>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Mot de passe..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Entrer</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 1.5rem' }}>
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Zap size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Meta Ads AI Generator</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Powered by MiniMax & KIE</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsDebugOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <Wrench size={16} />
            Debug KIE
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsHistoryOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <History size={16} />
            Historique
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">
            Déconnexion
          </button>
        </div>
      </header>

      <main>
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', border: '1px solid rgba(239,68,68,0.3)' }}>
            <strong>Erreur:</strong> {error}
          </div>
        )}

        <AdInputForm onGenerate={generatePipeline} isGenerating={isGenerating} progressText={progressText} />
        
        <AdResultsView 
          skeleton={skeleton} 
          buckets={buckets} 
          adImages={adImages}
          onRetryImage={retryImage}
          onSaveHistory={(productName) => saveToHistory(productName)}
          onExport={exportData} 
        />
      </main>

      {/* History Modal */}
      {isHistoryOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-secondary)', width: '90%', maxWidth: '600px',
            maxHeight: '80vh', borderRadius: 'var(--radius-lg)', padding: '2rem',
            overflowY: 'auto', border: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History /> Mes Campagnes
              </h2>
              <button onClick={() => setIsHistoryOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            {historyList.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0' }}>Aucun historique disponible.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {historyList.map((item) => (
                  <div key={item.id} className="glass" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0' }}>{item.productName || 'Sans nom'}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
                        {new Date(item.date).toLocaleString()} • {item.bucketCount} angles
                      </p>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        loadFromHistory(item.id);
                        setIsHistoryOpen(false);
                      }}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      Ouvrir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isDebugOpen && (
        <DebugModal onClose={() => setIsDebugOpen(false)} />
      )}

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem', paddingBottom: '2rem' }}>
        <p>© 2026 Ad Creative Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
