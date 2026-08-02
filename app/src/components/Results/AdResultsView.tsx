
import { AdCard } from './AdCard';
import { AdDetailsModal } from './AdDetailsModal';
import { Layers, Download } from 'lucide-react';
import React, { useState } from 'react';

interface Bucket {
  angle: string;
  static_ads: StaticAd[];
}

interface Skeleton {
  strategy: string;
  campaign_dna: {
    visual_signature: {
      dominant_color: string;
      accent_color: string;
      lighting_mood: string;
      texture_vibe: string;
    };
    opening_pattern: string;
  };
}

import type { AdImageState } from '../../hooks/useAdGeneration';

interface AdResultsViewProps {
  skeleton: Skeleton | null;
  buckets: Bucket[];
  adImages?: Record<string, AdImageState>;
  onRetryImage?: (adId: string, prompt: string) => void;
  onSaveHistory?: (name: string) => void;
  onExport?: () => void;
}

export function AdResultsView({ skeleton, buckets, adImages = {}, onRetryImage, onSaveHistory, onExport }: AdResultsViewProps) {
  const [selectedAd, setSelectedAd] = useState<StaticAd | null>(null);

  if (!skeleton && buckets.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '3rem', animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers className="text-gradient" />
          <span className="text-gradient">Generated Pipeline</span>
        </h2>
        {buckets.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => onSaveHistory?.(window.prompt('Nom de la campagne ?') || 'Sans nom')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Sauvegarder l'historique
            </button>
            <button className="btn btn-secondary" onClick={onExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={16} />
              Export JSON
            </button>
          </div>
        )}
      </div>

      {skeleton && (
        <div className="glass" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Campaign DNA (Skeleton)</h3>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
            {typeof skeleton.strategy === 'string' 
              ? skeleton.strategy 
              : JSON.stringify(skeleton.strategy, null, 2)}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Dominant Color</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: skeleton.campaign_dna?.visual_signature?.dominant_color || 'transparent' }}></div>
                <span>{skeleton.campaign_dna?.visual_signature?.dominant_color || 'N/A'}</span>
              </div>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Lighting Mood</h4>
              <span>{skeleton.campaign_dna?.visual_signature?.lighting_mood || 'N/A'}</span>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Texture Vibe</h4>
              <span>{skeleton.campaign_dna?.visual_signature?.texture_vibe || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {buckets.map((bucket, idx) => (
        <div key={idx} style={{ marginBottom: '4rem' }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1.5rem', 
            paddingBottom: '0.5rem', 
            borderBottom: '1px solid var(--border-light)',
            textTransform: 'capitalize'
          }}>
            Bucket: {bucket.angle.replace('_', ' ')}
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '1.5rem',
            alignItems: 'stretch'
          }}>
            {bucket.static_ads.map((ad, adIndex) => (
              <AdCard 
                key={adIndex} 
                ad={ad} 
                imageState={adImages[ad.id]} 
                onRetryImage={() => onRetryImage?.(ad.id, ad.prompt)} 
                onExpand={(clickedAd) => setSelectedAd(clickedAd)}
              />
            ))}
          </div>
        </div>
      ))}
      {/* Full Ad Details Modal */}
      {selectedAd && (
        <AdDetailsModal 
          ad={selectedAd} 
          imageState={adImages[selectedAd.id]} 
          onClose={() => setSelectedAd(null)} 
        />
      )}
    </div>
  );
}
