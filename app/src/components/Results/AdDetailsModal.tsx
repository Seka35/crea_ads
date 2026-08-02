
import { useState } from 'react';
import { X, Heart, MessageCircle, Send, Bookmark, Copy, Download } from 'lucide-react';
import type { StaticAd } from './AdCard';
import type { AdImageState } from '../../hooks/useAdGeneration';

interface AdDetailsModalProps {
  ad: StaticAd;
  imageState?: AdImageState;
  clientLogoUrl?: string;
  clientInstaHandle?: string;
  onClose: () => void;
}

export function AdDetailsModal({ ad, imageState, clientLogoUrl, clientInstaHandle, onClose }: AdDetailsModalProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(1428);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    if (!imageState?.url) return;
    const a = document.createElement('a');
    a.href = imageState.url;
    a.download = `${ad.headline || 'ad-creation'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const displayHandle = clientInstaHandle ? clientInstaHandle.replace(/^@/, '') : 'My_Brand';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100,
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-secondary)', width: '100%', maxWidth: '1050px',
        maxHeight: '90vh', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>Aperçu & Détails de la Création</h2>
            {imageState?.url && (
              <button onClick={handleDownload} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                <Download size={14} /> Télécharger l'image
              </button>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexWrap: 'wrap' }}>
          
          {/* Left: Instagram Mockup */}
          <div style={{ flex: '1 1 400px', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ 
              width: '100%', maxWidth: '380px', background: '#ffffff', borderRadius: '12px', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)', color: '#000000', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
            }}>
              {/* IG Header */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', gap: '10px', borderBottom: '1px solid #efefef' }}>
                {clientLogoUrl ? (
                  <img src={clientLogoUrl} alt={displayHandle} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e6683c' }} />
                ) : (
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', padding: '2px' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#111' }} />
                    </div>
                  </div>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: '600', fontSize: '13px', lineHeight: '1.2' }}>{displayHandle}</span>
                  <span style={{ fontSize: '11px', color: '#666' }}>Sponsorisé • Ad</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', color: '#262626' }}>•••</span>
              </div>
              
              {/* IG Image - Uncropped 1:1 Box */}
              <div style={{ width: '100%', aspectRatio: '1/1', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {imageState?.url ? (
                  <img src={imageState.url} alt="Ad content" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : imageState?.loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: '#888' }}>
                    <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid #444', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '12px' }}>Génération du visuel...</span>
                  </div>
                ) : (
                  <span style={{ color: '#888', fontSize: '13px' }}>Image non disponible</span>
                )}
              </div>

              {/* IG Actions */}
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <Heart 
                      size={24} 
                      color={isLiked ? "#ed4956" : "#262626"} 
                      fill={isLiked ? "#ed4956" : "none"} 
                      onClick={handleLike} 
                      style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }} 
                    />
                    <MessageCircle size={24} color="#262626" style={{ cursor: 'pointer' }} />
                    <Send size={24} color="#262626" style={{ cursor: 'pointer' }} />
                  </div>
                  <Bookmark 
                    size={24} 
                    color="#262626" 
                    fill={isSaved ? "#262626" : "none"} 
                    onClick={() => setIsSaved(!isSaved)} 
                    style={{ cursor: 'pointer' }} 
                  />
                </div>

                {/* Likes count */}
                <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px', color: '#262626' }}>
                  {likeCount.toLocaleString('fr-FR')} J'aime
                </div>

                {/* IG Caption: Username + Meta Headline + Primary Text */}
                <div style={{ fontSize: '13px', lineHeight: '1.45', color: '#262626' }}>
                  <span style={{ fontWeight: '700', marginRight: '6px' }}>{displayHandle}</span>
                  {ad.headline && (
                    <div style={{ fontWeight: '700', fontSize: '13.5px', marginTop: '4px', marginBottom: '4px', color: '#111' }}>
                      🔥 {ad.headline}
                    </div>
                  )}
                  <div style={{ whiteSpace: 'pre-wrap', marginTop: '2px', color: '#333' }}>
                    {ad.primary_text}
                  </div>
                </div>

                {/* Comments link & date */}
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8e8e8e', cursor: 'pointer' }}>
                  Voir les 42 commentaires
                </div>
                <div style={{ marginTop: '4px', fontSize: '10px', color: '#8e8e8e', textTransform: 'uppercase' }}>
                  Il y a 2 heures
                </div>
              </div>
            </div>
          </div>

          {/* Right: Data & Text details */}
          <div style={{ flex: '1 1 400px', padding: '2rem', overflowY: 'auto', borderLeft: '1px solid var(--border-light)' }}>
            
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Text Overlays (Sur l'image)</h3>
                <button onClick={() => copyToClipboard(ad.text_overlay?.hook_line || '')} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}><Copy size={14} /> Hook</button>
              </div>
              <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>"{ad.text_overlay?.hook_line}"</p>
                {ad.text_overlay?.support_line && (
                  <p style={{ color: 'var(--text-tertiary)' }}>{ad.text_overlay.support_line}</p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Meta Headline (Titre)</h3>
                <button onClick={() => copyToClipboard(ad.headline)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}><Copy size={14} /> Titre</button>
              </div>
              <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {ad.headline}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Meta Primary Text (Texte principal)</h3>
                <button onClick={() => copyToClipboard(ad.primary_text)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}><Copy size={14} /> Texte</button>
              </div>
              <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {ad.primary_text}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Angle & Style Visuel</h3>
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

