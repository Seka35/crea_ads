import { useState, useRef } from 'react';
import type { AdGenerationData } from '../components/Form/AdInputForm';
import type { StaticAd } from '../components/Results/AdCard';

export interface AdImageState {
  url?: string;
  loading: boolean;
  error?: string;
}

export function useAdGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [skeleton, setSkeleton] = useState<any>(null);
  const [buckets, setBuckets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [adImages, setAdImages] = useState<Record<string, AdImageState>>({});
  
  // Ref to hold the queue and concurrency state without triggering re-renders unnecessarily
  const queueRef = useRef<{ adId: string, prompt: string }[]>([]);
  const activeCountRef = useRef(0);
  const uploadedUrlsRef = useRef<string[]>([]);

  const processQueue = async () => {
    if (queueRef.current.length === 0 || activeCountRef.current >= 5) {
      return; // Queue is empty or max concurrency (5) reached
    }

    const item = queueRef.current.shift();
    if (!item) return;

    activeCountRef.current++;
    
    setAdImages(prev => ({
      ...prev,
      [item.adId]: { loading: true }
    }));

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('app_password') || ''
        },
        body: JSON.stringify({ prompt: item.prompt, input_urls: uploadedUrlsRef.current })
      });

      if (!res.ok) throw new Error("Image generation failed");
      const data = await res.json();

      setAdImages(prev => ({
        ...prev,
        [item.adId]: { loading: false, url: data.url }
      }));
    } catch (err: any) {
      console.error(err);
      setAdImages(prev => ({
        ...prev,
        [item.adId]: { loading: false, error: err.message }
      }));
    } finally {
      activeCountRef.current--;
      // Recursively process the next item
      processQueue();
    }
  };

  const queueImageGeneration = (ads: StaticAd[]) => {
    const newItems = ads.map(ad => ({ adId: ad.id, prompt: ad.prompt }));
    queueRef.current.push(...newItems);
    // Kick off up to 5 parallel workers if not already running
    for (let i = activeCountRef.current; i < 5; i++) {
      processQueue();
    }
  };

  const retryImage = (adId: string, prompt: string) => {
    queueRef.current.push({ adId, prompt });
    processQueue();
  };

  const generatePipeline = async (data: AdGenerationData, files?: File[]) => {
    setIsGenerating(true);
    setError(null);
    setSkeleton(null);
    setBuckets([]);
    setAdImages({});
    queueRef.current = [];
    activeCountRef.current = 0;
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
      uploadedUrlsRef.current = uploadedUrls;

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
          
          // Queue the newly generated ads for image generation
          if (bucket.static_ads) {
            queueImageGeneration(bucket.static_ads);
          }
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

  return { isGenerating, progressText, skeleton, buckets, adImages, error, generatePipeline, exportData, retryImage };
}
