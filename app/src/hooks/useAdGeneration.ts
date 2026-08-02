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
  const queueRef = useRef<{ adId: string, prompt: string, text_overlay?: string }[]>([]);
  const activeCountRef = useRef(0);
  const uploadedUrlsRef = useRef<string[]>([]);

  const processQueue = async () => {
    if (queueRef.current.length === 0 || activeCountRef.current >= 15) {
      return; // Queue is empty or max concurrency (15) reached
    }

    const item = queueRef.current.shift();
    if (!item) return;

    activeCountRef.current++;
    
    setAdImages(prev => ({
      ...prev,
      [item.adId]: { loading: true }
    }));

    try {
      const fullPrompt = item.text_overlay 
        ? `${item.prompt} IMPORTANT: You must write this exact text typography prominently in the image: "${item.text_overlay}". Place the text in the upper or center area of the image ONLY — never in the bottom third, as that area will be covered by a Meta Ads overlay.`
        : item.prompt;

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('app_password') || ''
        },
        body: JSON.stringify({ prompt: fullPrompt, input_urls: uploadedUrlsRef.current })
      });

      if (!res.ok) {
        let errData: any = {};
        try {
          errData = await res.json();
        } catch (e) {}
        console.error("Backend Image Error:", errData);
        throw new Error(errData.details || "Image generation failed");
      }
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

  const queueImageGeneration = (ads: StaticAd[], data?: AdGenerationData) => {
    const newItems = ads.map(ad => {
      let overlay = typeof ad.text_overlay === 'string' ? ad.text_overlay : (ad.text_overlay?.hook_line || '');
      if (typeof ad.text_overlay === 'object' && ad.text_overlay?.support_line && ad.text_overlay.support_line.toLowerCase() !== "none") {
        overlay += ` - ${ad.text_overlay.support_line}`;
      }
      if (data && !data.isPostMode && data.price) {
        overlay += ` - Price: ${data.currency}${data.price}`;
      }
      return {
        adId: ad.id, 
        prompt: ad.prompt, 
        text_overlay: overlay 
      };
    });
    queueRef.current.push(...newItems);
    // Kick off up to 15 parallel workers if not already running
    for (let i = activeCountRef.current; i < 15; i++) {
      processQueue();
    }
  };

  const retryImage = (adId: string, prompt: string, text_overlay?: string) => {
    queueRef.current.push({ adId, prompt, text_overlay });
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
          if (bucket.static_ads) {
            bucket.static_ads.forEach((ad: any, index: number) => {
              ad.id = `${category}_ad_${index + 1}_${Date.now()}`;
            });
          }
          setBuckets(prev => [...prev, bucket]);
          
          // Queue the newly generated ads for image generation
          if (bucket.static_ads) {
            queueImageGeneration(bucket.static_ads, data);
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

  const saveToHistory = async (productName: string) => {
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('app_password') || ''
        },
        body: JSON.stringify({ productName, skeleton, buckets, adImages })
      });
      if (res.ok) {
        alert('Campagne sauvegardée avec succès dans l\'historique !');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const loadFromHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, {
        headers: { 'Authorization': localStorage.getItem('app_password') || '' }
      });
      if (!res.ok) throw new Error("Failed to load history");
      const item = await res.json();
      setSkeleton(item.skeleton);
      setBuckets(item.buckets || []);
      setAdImages(item.adImages || {});
      setError(null);
    } catch (e) {
      console.error(e);
      alert('Erreur lors du chargement');
    }
  };

  const getHistoryList = async () => {
    try {
      const res = await fetch('/api/history', {
        headers: { 'Authorization': localStorage.getItem('app_password') || '' }
      });
      if (!res.ok) throw new Error("Failed to fetch history list");
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  return { isGenerating, progressText, skeleton, buckets, adImages, error, generatePipeline, exportData, retryImage, saveToHistory, loadFromHistory, getHistoryList };
}
