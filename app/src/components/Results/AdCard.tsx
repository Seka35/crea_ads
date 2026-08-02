
import { Copy, ImageIcon, Eye, RefreshCw } from 'lucide-react';
import type { AdImageState } from '../../hooks/useAdGeneration';

export interface StaticAd {
  id: string;
  angle: string;
  format: string;
  visual_style: string;
  hook_visual: string;
  hero_element: string;
  text_overlay: {
    hook_line: string;
    support_line: string | null;
  };
  prompt: string;
  primary_text: string;
  headline: string;
}

interface AdCardProps {
  ad: StaticAd;
  imageState?: AdImageState;
  onRetryImage: () => void;
  onExpand?: (ad: StaticAd) => void;
  onRegenerate?: (ad: StaticAd) => void;
}

export function AdCard({ ad, imageState, onRetryImage, onExpand, onRegenerate }: AdCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            padding: '0.25rem 0.75rem', 
            borderRadius: '999px',
            background: 'rgba(99, 102, 241, 0.2)',
            color: 'var(--accent-primary)',
            textTransform: 'uppercase'
          }}>
            {ad.angle} • {ad.format}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {ad.id}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => onRegenerate?.(ad)} 
            className="btn btn-secondary" 
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
            title="Modifier le prompt et régénérer"
          >
            <RefreshCw size={14} />
          </button>
          <button 
            onClick={() => onExpand?.(ad)} 
            className="btn btn-secondary" 
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
          >
            Agrandir / Mockup
          </button>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {imageState?.url ? (
          <div style={{ marginBottom: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
            <img src={imageState.url} alt="Generated Ad" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        ) : (
          <div style={{ 
            height: '250px', 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '1rem',
            border: '1px dashed var(--border-light)'
          }}>
            {imageState?.loading ? (
              <>
                <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Génération KIE en cours... (~60s)</span>
              </>
            ) : imageState?.error ? (
              <>
                <span style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center', padding: '0 1rem' }}>Échec: {imageState.error}</span>
                <button onClick={onRetryImage} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <RefreshCw size={14} /> Réessayer
                </button>
              </>
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>En attente de génération...</span>
            )}
          </div>
        )}

        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ImageIcon size={14} /> GPT Image Prompt
        </h4>
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '1rem', 
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          maxHeight: '150px',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {ad.prompt}
          <button 
            onClick={() => copyToClipboard(ad.prompt)}
            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
            title="Copy Prompt"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye size={14} /> Text Overlays
        </h4>
        <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem' }}>"{ad.text_overlay?.hook_line || ad.headline || 'No hook provided'}"</p>
          {ad.text_overlay?.support_line && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{ad.text_overlay.support_line}</p>
          )}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Meta Copy</h4>
        <div style={{ fontSize: '0.85rem' }}>
          <p style={{ marginBottom: '0.5rem' }}><strong>Headline:</strong> {ad.headline}</p>
          <p style={{ color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {ad.primary_text}
          </p>
        </div>
      </div>
    </div>
  );
}
