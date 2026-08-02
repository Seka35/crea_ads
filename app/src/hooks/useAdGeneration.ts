import { useState } from 'react';
import type { AdGenerationData } from '../components/Form/AdInputForm';

export function useAdGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [skeleton, setSkeleton] = useState<any>(null);
  const [buckets, setBuckets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generatePipeline = async (data: AdGenerationData, files?: File[]) => {
    setIsGenerating(true);
    setError(null);
    setSkeleton(null);
    setBuckets([]);
    setProgressText('Initialisation...');
    
    try {
      let uploadedUrls: string[] = [];

      // 1. Upload images if any
      if (files && files.length > 0) {
        setProgressText(`Upload de ${files.length} image(s)...`);
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        
        const uploadRes = await fetch('/api/upload', {
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

      // 2. Generate Skeleton
      setProgressText('Génération de la stratégie (Skeleton)...');
      const skeletonRes = await fetch('/api/generate-skeleton', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('app_password') || ''
        },
        body: JSON.stringify({ ...data, input_urls: uploadedUrls })
      });

      if (!skeletonRes.ok) {
        const errData = await skeletonRes.json();
        throw new Error(errData.details || "Skeleton generation failed");
      }

      const { skeleton: generatedSkeleton } = await skeletonRes.json();
      setSkeleton(generatedSkeleton);

      // 3. Generate Buckets progressively
      const allCategories = ['problem_aware', 'solution_aware', 'identity', 'social_proof', 'pattern_interrupt', 'pro_creative', 'organic_native'];
      let categoriesToGenerate = allCategories;

      if (data.categorySelection && data.categorySelection !== 'all') {
        categoriesToGenerate = [data.categorySelection];
      }

      for (let i = 0; i < categoriesToGenerate.length; i++) {
        const category = categoriesToGenerate[i];
        setProgressText(`Génération de la catégorie ${i + 1}/${categoriesToGenerate.length} : ${category}...`);
        
        const bucketRes = await fetch('/api/generate-bucket', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('app_password') || ''
          },
          body: JSON.stringify({ formData: { ...data, input_urls: uploadedUrls }, category })
        });

        if (bucketRes.ok) {
          const bucket = await bucketRes.json();
          setBuckets(prev => [...prev, bucket]);
        } else {
          console.error(`Failed to generate bucket ${category}`);
        }
      }

      setProgressText('');
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      setProgressText('');
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

  return { isGenerating, progressText, skeleton, buckets, error, generatePipeline, exportData };
}
