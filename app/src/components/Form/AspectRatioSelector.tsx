import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 (Square - Feed)', width: 18, height: 18 },
  { value: '4:5', label: '4:5 (Portrait - IG Feed)', width: 16, height: 20 },
  { value: '9:16', label: '9:16 (Story / Reels / TikTok)', width: 14, height: 24 },
  { value: '16:9', label: '16:9 (Landscape - Video)', width: 24, height: 14 },
  { value: '3:2', label: '3:2 (Classic Photo)', width: 22, height: 15 },
  { value: '2:3', label: '2:3 (Tall Photo)', width: 15, height: 22 },
  { value: '4:3', label: '4:3 (Standard Monitor)', width: 20, height: 15 },
  { value: '3:4', label: '3:4 (Vertical Photo)', width: 15, height: 20 },
  { value: '5:4', label: '5:4 (Wide Landscape)', width: 20, height: 16 },
  { value: '2:1', label: '2:1 (Panoramic)', width: 24, height: 12 },
  { value: '1:2', label: '1:2 (Ultra Vertical)', width: 12, height: 24 },
  { value: '3:1', label: '3:1 (Header Banner)', width: 24, height: 8 },
  { value: '1:3', label: '1:3 (Skyscraper)', width: 8, height: 24 },
  { value: '21:9', label: '21:9 (Ultrawide)', width: 25, height: 11 },
  { value: '9:21', label: '9:21 (Tall Mobile)', width: 11, height: 25 },
];

interface AspectRatioSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = ASPECT_RATIOS.find(r => r.value === value) || ASPECT_RATIOS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Selector Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.65rem 1rem', background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)',
          cursor: 'pointer', userSelect: 'none', color: 'var(--text-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Proportional Box Icon */}
          <div style={{
            width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(99, 102, 241, 0.15)', borderRadius: '4px'
          }}>
            <div style={{
              width: `${selected.width}px`, height: `${selected.height}px`,
              border: '2px solid var(--accent-primary)', borderRadius: '2px',
              background: 'rgba(99, 102, 241, 0.3)'
            }} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{selected.label}</span>
        </div>
        <ChevronDown size={18} color="var(--text-tertiary)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '6px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)', boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          maxHeight: '260px', overflowY: 'auto', zIndex: 100, padding: '0.35rem'
        }}>
          {ASPECT_RATIOS.map(item => {
            const isSelected = item.value === value;
            return (
              <div
                key={item.value}
                onClick={() => {
                  onChange(item.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 600 : 400, transition: 'background 0.15s'
                }}
              >
                {/* Proportional Box Icon */}
                <div style={{
                  width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px'
                }}>
                  <div style={{
                    width: `${item.width}px`, height: `${item.height}px`,
                    border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)'}`,
                    borderRadius: '2px', background: isSelected ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.1)'
                  }} />
                </div>
                <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
