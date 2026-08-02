import { useState } from 'react';

export default function DebugModal({ onClose }: { onClose: () => void }) {
  const [logs, setLogs] = useState<{ step: string; message: string; data?: any; error?: boolean }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  
  const addLog = (step: string, message: string, data?: any, error = false) => {
    setLogs(prev => [...prev, { step, message, data, error }]);
  };

  const runFullTest = async () => {
    setLogs([]);
    let uploadUrl = "";
    
    // STEP 1: UPLOAD
    addLog("1. UPLOAD", "Début du test. Vérification de l'image...");
    if (file) {
      try {
        const formData = new FormData();
        formData.append('images', file);
        addLog("1. UPLOAD", "Envoi de l'image au serveur...", { fileName: file.name });
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Authorization': localStorage.getItem('app_password') || '' },
          body: formData
        });
        
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Upload failed");
        
        uploadUrl = data.urls[0];
        addLog("1. UPLOAD", "✅ Succès ! URL publique de l'image :", uploadUrl);
      } catch (e: any) {
        addLog("1. UPLOAD", "❌ ÉCHEC", e.message, true);
        return; // Stop here if upload fails
      }
    } else {
      addLog("1. UPLOAD", "⚠️ Aucune image fournie. Test avec texte uniquement.");
    }

    // STEP 2: SKELETON (CLAUDE SONNET 5)
    addLog("2. SKELETON (CLAUDE SONNET 5)", "Demande de stratégie...");
    let skeletonData = null;
    try {
      const res = await fetch('/api/generate-skeleton', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('app_password') || ''
        },
        body: JSON.stringify({ 
          productName: "Test Product", category: "Test", niche: "Test", 
          currency: "$", price: "10", aiStrategy: "neutral", awarenessLevel: "unaware",
          input_urls: uploadUrl ? [uploadUrl] : []
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.details || data.error || "Skeleton failed");
      
      skeletonData = data;
      addLog("2. SKELETON (CLAUDE SONNET 5)", "✅ Succès ! Le JSON est bien formatté.", skeletonData);
    } catch (e: any) {
      addLog("2. SKELETON (CLAUDE SONNET 5)", "❌ ÉCHEC JSON Claude Sonnet 5", e.message, true);
      return;
    }

    // STEP 3: BUCKET (CLAUDE SONNET 5)
    addLog("3. BUCKET (CLAUDE SONNET 5)", "Demande d'une pub...");
    let promptKie = "A simple red apple on a white background, highly detailed";
    try {
      const res = await fetch('/api/generate-bucket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('app_password') || ''
        },
        body: JSON.stringify({
          formData: { productName: "Test Product", category: "Test", niche: "Test", input_urls: uploadUrl ? [uploadUrl] : [] },
          category: "problem_aware"
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.details || data.error || "Bucket failed");
      
      if (data.static_ads && data.static_ads[0] && data.static_ads[0].prompt) {
         promptKie = data.static_ads[0].prompt;
         addLog("3. BUCKET (MINIMAX)", "✅ Succès ! Prompt IA récupéré.", promptKie);
      } else {
         addLog("3. BUCKET (MINIMAX)", "⚠️ Succès mais l'IA n'a pas renvoyé de prompt.", data);
      }
    } catch (e: any) {
      addLog("3. BUCKET (MINIMAX)", "❌ ÉCHEC JSON MiniMax", e.message, true);
      return;
    }

    // STEP 4: KIE API (IMAGE)
    addLog("4. KIE API (IMAGE)", "Envoi de la tâche à KIE...");
    try {
      const payload = {
        prompt: promptKie,
        input_urls: uploadUrl ? [uploadUrl] : []
      };
      addLog("4. KIE API (IMAGE)", "Payload envoyé au backend :", payload);

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('app_password') || ''
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        addLog("4. KIE API (IMAGE)", "❌ ÉCHEC : KIE a refusé ou backend crash", data, true);
      } else {
        addLog("4. KIE API (IMAGE)", "✅ Succès TOTAL ! Image générée avec succès.", data.url);
      }
    } catch (e: any) {
      addLog("4. KIE API (IMAGE)", "❌ ÉCHEC HTTP", e.message, true);
    }
    
    addLog("🏁 FIN", "Test de pipeline terminé.");
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.9)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#1A1D24', padding: '2rem', borderRadius: '12px',
        width: '95%', maxWidth: '900px', height: '90vh', border: '1px solid #333',
        color: 'white', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>🔬 Pipeline Debugger (Upload ➜ MiniMax ➜ KIE)</h2>
          <button onClick={onClose} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button onClick={runFullTest} className="btn-primary" style={{ padding: '0.5rem 1rem', background: '#9D00FF' }}>
            ▶️ Lancer le Pipeline Test Complet
          </button>
        </div>

        <div style={{ 
          flex: 1, overflowY: 'auto', background: '#0B0D11', 
          padding: '1rem', borderRadius: '8px', border: '1px solid #222',
          fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '0.5rem'
        }}>
          {logs.map((log, i) => (
            <div key={i} style={{ 
              padding: '0.75rem', borderRadius: '4px', 
              background: log.error ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
              borderLeft: `4px solid ${log.error ? '#ff4444' : '#00F0FF'}`
            }}>
              <div style={{ fontWeight: 'bold', color: log.error ? '#ff4444' : '#00F0FF', marginBottom: '0.25rem' }}>
                {log.step}
              </div>
              <div style={{ color: '#ccc' }}>{log.message}</div>
              {log.data && (
                <pre style={{ 
                  marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.5)', 
                  borderRadius: '4px', fontSize: '0.8rem', color: log.error ? '#ffaaaa' : '#aaa',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all'
                }}>
                  {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
          {logs.length === 0 && <div style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>Cliquez sur le bouton pour lancer le test...</div>}
        </div>
      </div>
    </div>
  );
}
