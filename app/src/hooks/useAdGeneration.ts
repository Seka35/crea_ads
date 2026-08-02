import { useState } from 'react';
import type { AdGenerationData } from '../components/Form/AdInputForm';

export function useAdGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [skeleton, setSkeleton] = useState<any>(null);
  const [buckets, setBuckets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generatePipeline = async (data: AdGenerationData, files?: File[]) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      let uploadedUrls: string[] = [];

      // 1. Upload images if any
      if (files && files.length > 0) {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        
        // Ensure you point to your actual VPS API in production (e.g. /api/upload)
        const uploadRes = await fetch('http://localhost:4523/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': localStorage.getItem('app_password') || ''
          },
          body: formData
        });
        
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        uploadedUrls = uploadData.urls;
      }

      // 2. Generate text pipeline
      const generateRes = await fetch('http://localhost:4523/api/generate-text', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('app_password') || ''
        },
        body: JSON.stringify({ ...data, input_urls: uploadedUrls })
      });

      if (!generateRes.ok) {
        const errData = await generateRes.json();
        throw new Error(errData.details || "Text generation failed");
      }

      const resultData = await generateRes.json();
      
      setSkeleton(resultData.skeleton);
      setBuckets(resultData.buckets);

    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportData = () => {
    const data = { skeleton, buckets };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meta-ads-campaign.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return { isGenerating, skeleton, buckets, error, generatePipeline, exportData };
}
