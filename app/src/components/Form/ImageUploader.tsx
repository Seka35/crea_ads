import React, { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';

interface ImageUploaderProps {
  onImagesChange: (images: File[]) => void;
}

export function ImageUploader({ onImagesChange }: ImageUploaderProps) {
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    if (images.length + newFiles.length > 16) {
      alert('You can only upload up to 16 images in total.');
      return;
    }
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    const newImages = [...images, ...validFiles].slice(0, 16); // Limit to 16 images
    setImages(newImages);
    onImagesChange(newImages);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="form-group">
      <label>Reference Images (Max 5)</label>
      
      <div 
        className="glass-card" 
        style={{
          padding: '2rem',
          textAlign: 'center',
          borderStyle: isDragging ? 'solid' : 'dashed',
          borderColor: isDragging ? 'var(--accent-primary)' : 'var(--border-light)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud size={40} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Drag & drop images here, or click to browse
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          JPG, PNG or WEBP (Max 5MB each)
        </p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          multiple 
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {images.map((file, idx) => (
            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <img 
                src={URL.createObjectURL(file)} 
                alt="preview" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
