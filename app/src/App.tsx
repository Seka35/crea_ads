import React, { useState, useEffect } from 'react';
import { AdInputForm } from './components/Form/AdInputForm';
import { AdResultsView } from './components/Results/AdResultsView';
import { useAdGeneration } from './hooks/useAdGeneration';
import { Zap, Lock } from 'lucide-react';

function App() {
  const { isGenerating, progressText, skeleton, buckets, error, generatePipeline, exportData } = useAdGeneration();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

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
      <header style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative' }}>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ position: 'absolute', top: 0, right: 0 }}>
          Déconnexion
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.1)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--accent-glow)'
          }}>
            <Zap size={40} color="var(--accent-primary)" />
          </div>
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Meta Creative <span className="text-gradient">Generator</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Generate a complete 35-ad creative pipeline based on the Andromeda-era strategy. Input your business details and let the system build your angles, hooks, and visual prompts.
        </p>
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
          onExport={exportData} 
        />
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem', paddingBottom: '2rem' }}>
        <p>© 2026 Ad Creative Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
