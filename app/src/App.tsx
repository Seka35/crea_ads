import React, { useState, useEffect } from 'react';
import { AdInputForm } from './components/Form/AdInputForm';
import { AdResultsView } from './components/Results/AdResultsView';
import { useAdGeneration } from './hooks/useAdGeneration';
import { Zap, Lock, History, X, Wrench, Users } from 'lucide-react';
import DebugModal from './components/DebugModal';
import { ClientManagementModal } from './components/Client/ClientManagementModal';
import { ClientPortal } from './components/Client/ClientPortal';
import type { ClientProfile } from './components/Client/ClientManagementModal';

function App() {
  const { isGenerating, progressText, skeleton, buckets, adImages, error, generatePipeline, exportData, retryImage, saveToHistory, loadFromHistory, getHistoryList } = useAdGeneration();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'client'>('admin');
  const [clientData, setClientData] = useState<ClientProfile | null>(null);

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isClientsModalOpen, setIsClientsModalOpen] = useState(false);

  useEffect(() => {
    if (isHistoryOpen) {
      getHistoryList().then(setHistoryList);
    }
  }, [isHistoryOpen]);

  useEffect(() => {
    const savedToken = localStorage.getItem('app_password');
    const savedRole = localStorage.getItem('app_role') as 'admin' | 'client';
    const savedClient = localStorage.getItem('app_client_data');

    if (savedToken) {
      setIsAuthenticated(true);
      if (savedRole) setUserRole(savedRole);
      if (savedClient) {
        try {
          setClientData(JSON.parse(savedClient));
        } catch (e) {}
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoginSubmitting(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Identifiants incorrects');
      }

      const data = await res.json();
      localStorage.setItem('app_password', data.token);
      localStorage.setItem('app_role', data.role);
      
      setUserRole(data.role);
      if (data.client) {
        localStorage.setItem('app_client_data', JSON.stringify(data.client));
        setClientData(data.client);
      } else {
        localStorage.removeItem('app_client_data');
        setClientData(null);
      }

      setIsAuthenticated(true);
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || 'Échec de la connexion');
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('app_password');
    localStorage.removeItem('app_role');
    localStorage.removeItem('app_client_data');
    setIsAuthenticated(false);
    setClientData(null);
    setUserRole('admin');
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem' }}>
        <form className="glass-card" style={{ padding: '3rem 2.5rem', width: '100%', maxWidth: '420px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }} onSubmit={handleLogin}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Lock size={32} color="var(--accent-primary)" />
          </div>
          
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Connexion Plateforme</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            Accès Admin & Portail Client
          </p>

          {loginError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(239,68,68,0.3)' }}>
              {loginError}
            </div>
          )}

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem' }}>Nom d'utilisateur (Optionnel pour Admin)</label>
            <input 
              type="text" 
              placeholder="ex: bullswipe" 
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.85rem' }}>Mot de passe *</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoginSubmitting} style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 600 }}>
            {isLoginSubmitting ? 'Vérification...' : 'Se connecter'}
          </button>
        </form>
      </div>
    );
  }

  // Render Client Portal View if authenticated as Client
  if (userRole === 'client' && clientData) {
    return <ClientPortal client={clientData} onLogout={handleLogout} />;
  }

  // Render Admin View
  return (
    <div className="container" style={{ padding: '4rem 1.5rem' }}>
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Zap size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Meta Ads AI Generator</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Espace Admin & Machine à Créas</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsClientsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.15)', borderColor: 'var(--accent-primary)', color: '#fff' }}
          >
            <Users size={16} color="var(--accent-primary)" />
            Onglet Clients
          </button>
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

      {/* Admin Clients Modal */}
      {isClientsModalOpen && (
        <ClientManagementModal onClose={() => setIsClientsModalOpen(false)} />
      )}

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

