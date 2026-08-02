import React from 'react';
import { X, Heart, MessageCircle, Send, Bookmark, Copy } from 'lucide-react';
import type { StaticAd } from './AdCard';
import type { AdImageState } from '../../hooks/useAdGeneration';

interface AdDetailsModalProps {
  ad: StaticAd;
  imageState?: AdImageState;
  onClose: () => void;
}

export function AdDetailsModal({ ad, imageState, onClose }: AdDetailsModalProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100,
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-secondary)', width: '100%', maxWidth: '1000px',
        maxHeight: '90vh', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border-light)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Aperçu & Détails de la Création</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexWrap: 'wrap' }}>
          
          {/* Left: Instagram Mockup */}
          <div style={{ flex: '1 1 400px', padding: '2rem', display: 'flex', justifyContent: 'center', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ 
              width: '100%', maxWidth: '380px', background: '#fff', borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#000', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
            }}>
              {/* IG Header */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', padding: '2px' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#333' }} />
                  </div>
                </div>
                <span style={{ fontWeight: '600', fontSize: '14px', flex: 1 }}>My_Brand</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', paddingBottom: '8px' }}>...</span>
              </div>
              
              {/* IG Image */}
              <div style={{ width: '100%', aspectRatio: '4/5', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {imageState?.url ? (
                  <img src={imageState.url} alt="Ad content" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : imageState?.loading ? (
                  <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid #ccc', borderTop: '3px solid #333', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <span style={{ color: '#999', fontSize: '14px' }}>Image non disponible</span>
                )}
              </div>

              {/* IG Actions */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <Heart size={24} color="#000" />
                    <MessageCircle size={24} color="#000" />
                    <Send size={24} color="#000" />
                  </div>
                  <Bookmark size={24} color="#000" />
                </div>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>
                  Aimé par de nombreuses personnes
                </div>
                {/* IG Caption */}
                <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                  <span style={{ fontWeight: '600', marginRight: '6px' }}>My_Brand</span>
                  <span style={{ whiteSpace: 'pre-wrap' }}>{ad.primary_text}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Data & Text details */}
          <div style={{ flex: '1 1 400px', padding: '2rem', overflowY: 'auto', borderLeft: '1px solid var(--border-light)' }}>
            
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Text Overlays</h3>
                <button onClick={() => copyToClipboard(ad.text_overlay?.hook_line || '')} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}><Copy size={14} /> Hook</button>
              </div>
              <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>"{ad.text_overlay?.hook_line}"</p>
                {ad.text_overlay?.support_line && (
                  <p style={{ color: 'var(--text-tertiary)' }}>{ad.text_overlay.support_line}</p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Meta Headline</h3>
                <button onClick={() => copyToClipboard(ad.headline)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}><Copy size={14} /> Titre</button>
              </div>
              <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                {ad.headline}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Meta Primary Text</h3>
                <button onClick={() => copyToClipboard(ad.primary_text)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}><Copy size={14} /> Texte</button>
              </div>
              <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {ad.primary_text}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Angle & Visual Style</h3>
              </div>
              <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <p><strong>Angle:</strong> {ad.angle}</p>
                <p style={{ marginTop: '0.5rem' }}><strong>Hero Element:</strong> {ad.hero_element}</p>
                <p style={{ marginTop: '0.5rem' }}><strong>Visual Style:</strong> {ad.visual_style}</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
