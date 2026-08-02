import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { AspectRatioSelector } from './AspectRatioSelector';

export interface AdGenerationData {
  productName: string;
  category: string;
  niche: string;
  price: string;
  currency: string;
  aiStrategy: string;
  awarenessLevel: string;
  uniqueMechanism: string;
  bigIdea: string;
  adsPerCategory: number;
  categorySelection: string;
  isPostMode: boolean;
  aspectRatio: string;
}

interface AdInputFormProps {
  onGenerate: (data: AdGenerationData, files?: File[]) => void;
  isGenerating: boolean;
  progressText?: string;
}

export function AdInputForm({ onGenerate, isGenerating, progressText }: AdInputFormProps) {
  const [formData, setFormData] = useState<AdGenerationData>({
    productName: '',
    category: '',
    niche: '',
    price: '',
    currency: '$',
    aiStrategy: 'neutral',
    awarenessLevel: 'unaware',
    uniqueMechanism: '',
    bigIdea: '',
    adsPerCategory: 5,
    categorySelection: 'all',
    isPostMode: false,
    aspectRatio: '1:1'
  });
  
  const [images, setImages] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData, images);
  };

  return (
    <form className="glass" style={{ padding: '2rem', marginBottom: '2rem' }} onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="text-gradient">Business Details</span>
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Product Details Column */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Product</h3>
          
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input 
              type="checkbox" 
              id="isPostMode"
              name="isPostMode" 
              checked={formData.isPostMode} 
              onChange={handleChange} 
              style={{ width: 'auto', cursor: 'pointer' }}
            />
            <label htmlFor="isPostMode" style={{ marginBottom: 0, cursor: 'pointer', color: 'var(--accent-primary)' }}>
              Activer le Mode "Post Organique" (Pas de prix)
            </label>
          </div>

          <div className="form-group">
            <label>Product Name *</label>
            <input required type="text" name="productName" value={formData.productName} onChange={handleChange} placeholder="e.g. ZenDesk AI" />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. B2B SaaS" />
          </div>

          <div className="form-group">
            <label>Niche / Target Audience</label>
            <input type="text" name="niche" value={formData.niche} onChange={handleChange} placeholder="e.g. Customer Support Managers" />
          </div>

          {!formData.isPostMode && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange}>
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Price *</label>
                <input required={!formData.isPostMode} type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 47" />
              </div>
            </div>
          )}
        </div>

        {/* Persuasion Framework Column */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Persuasion Framework</h3>
          
          <div className="form-group">
            <label>AI Strategy</label>
            <select name="aiStrategy" value={formData.aiStrategy} onChange={handleChange}>
              <option value="assumed">Assumed (Futuristic/Data)</option>
              <option value="hidden">Hidden (Human textures/Warm)</option>
              <option value="neutral">Neutral (Free choice)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Awareness Level</label>
            <select name="awarenessLevel" value={formData.awarenessLevel} onChange={handleChange}>
              <option value="unaware">Unaware (Storytelling/Identity)</option>
              <option value="problem_aware">Problem Aware (Pain-mirror)</option>
              <option value="solution_aware">Solution Aware (Mechanism reveal)</option>
              <option value="product_aware">Product Aware (Risk-reversal/Proof)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Unique Mechanism</label>
            <input type="text" name="uniqueMechanism" value={formData.uniqueMechanism} onChange={handleChange} placeholder="The thing that makes it different" />
          </div>

          <div className="form-group">
            <label>Big Idea</label>
            <textarea name="bigIdea" value={formData.bigIdea} onChange={handleChange} placeholder="One-liner big idea..." rows={2}></textarea>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '2rem 0' }} />

      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="text-gradient">Assets & Settings</span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <ImageUploader onImagesChange={(newImages) => setImages(newImages)} />
        
        <div>
          <div className="form-group">
            <label>Image Aspect Ratio / Format</label>
            <AspectRatioSelector 
              value={formData.aspectRatio} 
              onChange={(val) => setFormData(prev => ({ ...prev, aspectRatio: val }))} 
            />
          </div>

          <div className="form-group">
            <label>Catégorie (Angle/Style) à générer</label>
            <select name="categorySelection" value={formData.categorySelection} onChange={handleChange}>
              <option value="all">Tout générer (7 Catégories)</option>
              <option value="problem_aware">Problem Aware</option>
              <option value="solution_aware">Solution Aware</option>
              <option value="identity">Identity</option>
              <option value="social_proof">Social Proof</option>
              <option value="pattern_interrupt">Pattern Interrupt</option>
              <option value="pro_creative">Style: Pro Creative</option>
              <option value="organic_native">Style: Organic Native</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ads par Catégorie</label>
            <input 
              type="number" 
              name="adsPerCategory" 
              value={formData.adsPerCategory} 
              onChange={handleChange} 
              min={1} 
              max={10} 
            />
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary" disabled={isGenerating} style={{ width: '100%', minHeight: '50px' }}>
              {isGenerating ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  {progressText || 'Generating Pipeline...'}
                </>
              ) : (
                'Generate Creative Pipeline'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
