import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit, Upload, UserCheck, Shield, Sparkles, Image as ImageIcon } from 'lucide-react';

export interface ClientProfile {
  id?: string;
  name: string;
  username: string;
  password: string;
  instaHandle: string;
  logoUrl: string;
  defaultPrompt: string;
  niche: string;
  category: string;
  aiStrategy: string;
  awarenessLevel: string;
  uniqueMechanism: string;
  bigIdea: string;
  referenceImages: string[];
  price: string;
  currency: string;
}

interface ClientManagementModalProps {
  onClose: () => void;
}

export function ClientManagementModal({ onClose }: ClientManagementModalProps) {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingRef, setIsUploadingRef] = useState(false);

  const emptyClient: ClientProfile = {
    name: '',
    username: '',
    password: '',
    instaHandle: '',
    logoUrl: '',
    defaultPrompt: '',
    niche: '',
    category: '',
    aiStrategy: 'neutral',
    awarenessLevel: 'solution_aware',
    uniqueMechanism: '',
    bigIdea: '',
    referenceImages: [],
    price: '47',
    currency: '$'
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clients', {
        headers: { 'Authorization': localStorage.getItem('app_password') || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append('images', files[0]);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': localStorage.getItem('app_password') || '' },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data.urls && data.urls.length > 0) {
          setEditingClient(prev => prev ? { ...prev, logoUrl: data.urls[0] } : null);
        }
      }
    } catch (e) {
      console.error("Logo upload failed", e);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingRef(true);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': localStorage.getItem('app_password') || '' },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data.urls) {
          setEditingClient(prev => prev ? { 
            ...prev, 
            referenceImages: [...(prev.referenceImages || []), ...data.urls] 
          } : null);
        }
      }
    } catch (e) {
      console.error("Ref upload failed", e);
    } finally {
      setIsUploadingRef(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('app_password') || '' 
        },
        body: JSON.stringify(editingClient)
      });
      if (res.ok) {
        alert('Client account saved successfully!');
        setEditingClient(null);
        fetchClients();
      } else {
        alert('Failed to save client profile');
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client account?')) return;

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': localStorage.getItem('app_password') || '' }
      });
      if (res.ok) {
        fetchClients();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100,
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'var(--bg-secondary)', width: '100%', maxWidth: '950px',
        maxHeight: '90vh', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserCheck size={24} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
              Client Accounts & Portal Management
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          
          {editingClient ? (
            /* Create / Edit Form */
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', margin: 0 }}>
                  {editingClient.id ? 'Edit Client Profile' : 'Create New Client Profile'}
                </h3>
                <button type="button" onClick={() => setEditingClient(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  Cancel
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                
                {/* Identity & Credentials */}
                <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                    <Shield size={16} /> Identity & Access Credentials
                  </h4>
                  
                  <div className="form-group">
                    <label>Client / Brand Name *</label>
                    <input required type="text" value={editingClient.name} onChange={e => setEditingClient({ ...editingClient, name: e.target.value })} placeholder="e.g. BullSwipe" />
                  </div>

                  <div className="form-group">
                    <label>Instagram Handle (@username)</label>
                    <input type="text" value={editingClient.instaHandle} onChange={e => setEditingClient({ ...editingClient, instaHandle: e.target.value })} placeholder="e.g. bullswipe_official" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Portal Username *</label>
                      <input required type="text" value={editingClient.username} onChange={e => setEditingClient({ ...editingClient, username: e.target.value })} placeholder="Username" />
                    </div>
                    <div className="form-group">
                      <label>Portal Password *</label>
                      <input required type="text" value={editingClient.password} onChange={e => setEditingClient({ ...editingClient, password: e.target.value })} placeholder="Client Secret" />
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label>Brand Logo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {editingClient.logoUrl ? (
                        <img src={editingClient.logoUrl} alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon size={20} color="var(--text-tertiary)" />
                        </div>
                      )}
                      <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload size={14} />
                        {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Admin Configurations & Prompts */}
                <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                    <Sparkles size={16} /> Admin Master Prompt & Positioning Settings
                  </h4>

                  <div className="form-group">
                    <label>Admin Master Prompt Instructions for this Client</label>
                    <textarea rows={3} value={editingClient.defaultPrompt} onChange={e => setEditingClient({ ...editingClient, defaultPrompt: e.target.value })} placeholder="Client specific guidelines (tone, forbidden words, mandatory branding rules...)" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Niche / Audience</label>
                      <input type="text" value={editingClient.niche} onChange={e => setEditingClient({ ...editingClient, niche: e.target.value })} placeholder="e.g. Crypto Traders" />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <input type="text" value={editingClient.category} onChange={e => setEditingClient({ ...editingClient, category: e.target.value })} placeholder="e.g. FinTech SaaS" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Default Price</label>
                      <input type="number" value={editingClient.price} onChange={e => setEditingClient({ ...editingClient, price: e.target.value })} placeholder="47" />
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select value={editingClient.currency} onChange={e => setEditingClient({ ...editingClient, currency: e.target.value })}>
                        <option value="$">USD ($)</option>
                        <option value="€">EUR (€)</option>
                        <option value="£">GBP (£)</option>
                      </select>
                    </div>
                  </div>

                  {/* Reference Images Upload */}
                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label>Reference Images (Brand assets / Product packshots)</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {editingClient.referenceImages?.map((url, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={url} alt={`ref-${i}`} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            onClick={() => {
                              const updated = editingClient.referenceImages.filter((_, idx) => idx !== i);
                              setEditingClient({ ...editingClient, referenceImages: updated });
                            }} 
                            style={{ position: 'absolute', top: -4, right: -4, background: 'var(--error)', border: 'none', borderRadius: '50%', color: '#fff', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Upload size={12} />
                      {isUploadingRef ? 'Uploading...' : '+ Add Brand Visual Assets'}
                      <input type="file" multiple accept="image/*" onChange={handleReferenceUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                  Save Client Profile
                </button>
              </div>
            </form>
          ) : (
            /* Clients List View */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>
                  Manage client accounts, authentication credentials, and pre-configured AI master prompts.
                </p>
                <button 
                  onClick={() => setEditingClient(emptyClient)} 
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
                >
                  <Plus size={16} /> Add New Client
                </button>
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>Loading client accounts...</p>
              ) : clients.length === 0 ? (
                <div className="glass" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <UserCheck size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>No Client Accounts Yet</h3>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Create your first client account to provide them direct access to their simplified creation portal.
                  </p>
                  <button onClick={() => setEditingClient(emptyClient)} className="btn btn-primary">
                    <Plus size={16} /> Create Client Account
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {clients.map(client => (
                    <div key={client.id} className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                          {client.logoUrl ? (
                            <img src={client.logoUrl} alt={client.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} />
                          ) : (
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                              {client.name.substring(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{client.name}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>@{client.instaHandle || client.username}</span>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                          <div><strong>Username:</strong> {client.username}</div>
                          <div><strong>Password:</strong> {client.password}</div>
                          <div><strong>Brand Visuelle Assets:</strong> {client.referenceImages?.length || 0} image(s)</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => setEditingClient(client)} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => client.id && handleDelete(client.id)} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

