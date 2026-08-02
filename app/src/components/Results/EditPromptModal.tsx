import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import type { StaticAd } from './AdCard';

interface EditPromptModalProps {
  ad: StaticAd;
  onClose: () => void;
  onSubmit: (newPrompt: string) => void;
}

export function EditPromptModal({ ad, onClose, onSubmit }: EditPromptModalProps) {
  const [prompt, setPrompt] = useState(ad.prompt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200,
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        width: '100%', maxWidth: '600px',
        padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={20} className="text-gradient" />
            <span className="text-gradient">Régénérer l'Image</span>
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
          Vous pouvez modifier le prompt envoyé à l'IA (KIE) pour ajuster l'image générée. Le texte d'accroche y sera toujours automatiquement ajouté.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Prompt IA</label>
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              style={{ width: '100%', resize: 'vertical' }}
              required
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} />
              Générer la nouvelle image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
