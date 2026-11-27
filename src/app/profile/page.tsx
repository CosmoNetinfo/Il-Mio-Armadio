'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, LogOut, ChevronLeft, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/CameraCapture';
import { subscribeWardrobe, updateProfileAvatar } from '@/lib/localStorage';
import { exportBackup } from '@/lib/backup';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const [removeBackdrop, setRemoveBackdrop] = useState(true);

  useEffect(() => {
    return subscribeWardrobe(data => {
      setAvatarUrl(data.avatar);
      setLoading(false);
    }, () => { setLoading(false); alert('Impossibile leggere la memoria del dispositivo.'); });
  }, []);

  const handleCapture = async (blob: Blob) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setShowCamera(false);
    try {
      setLoading(true);
      setIsProcessing(true);
      
      console.log("Rimozione sfondo avatar in corso...");
      const config = {
        progress: (key: string, current: number, total: number) => {
          console.log(`Processing ${key}: ${current}/${total}`);
        },
      };

      const resultBlob = removeBackdrop
        ? await (await import('@imgly/background-removal')).removeBackground(blob, config)
        : blob;
      
      const url = await updateProfileAvatar(resultBlob);
      setAvatarUrl(url);
      setShowCamera(false);
    } catch (err) {
      console.error(err);
      alert("Errore durante l'elaborazione o il caricamento.");
    } finally {
      setLoading(false);
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <div style={{ padding: '0 20px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', marginTop: '10px' }}>
        <ChevronLeft onClick={() => router.back()} size={24} />
        <h2 style={{ fontSize: '20px', margin: 0 }}>Profilo</h2>
      </div>

      <div className="glass" style={{ padding: '30px', textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ 
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          margin: '0 auto 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid var(--primary)'
        }}>
            <UserIcon size={48} opacity={0.3} />
        </div>
        <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>Il tuo armadio, su questo dispositivo</h3>
        <p style={{ fontSize: '14px', opacity: 0.7 }}>Foto e outfit restano nella memoria del browser. Nessun account richiesto.</p>
      </div>

      <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>Il Tuo Avatar Base</h3>
      <label style={{ display: 'block', marginBottom: '16px' }}>
        <input type="checkbox" disabled={isProcessing} checked={removeBackdrop} onChange={event => setRemoveBackdrop(event.target.checked)} /> Rimuovi sfondo (modello da scaricare al primo utilizzo)
      </label>
      <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px' }}>
        Questa è la foto su cui verranno sovrapposti i vestiti. Scegli una foto a figura intera con abbigliamento aderente.
      </p>

      <div 
        className="glass" 
        style={{ 
          width: '100%', 
          height: '400px', // Aumentato per l'avatar intero
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: '30px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#000'
        }}
      >
        {isProcessing && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            backdropFilter: 'blur(5px)'
          }}>
            <Loader2 size={40} className="spin" style={{ color: 'var(--primary)' }} />
            <p style={{ fontWeight: '600', fontSize: '14px' }}>{removeBackdrop ? 'Rimozione sfondo…' : 'Salvataggio sul dispositivo…'}</p>
            <style jsx>{`
              .spin { animation: spin 2s linear infinite; }
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}

        {avatarUrl ? (
          <>
            <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <button 
              onClick={() => setShowCamera(true)}
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                background: 'rgba(124, 77, 255, 0.5)',
                border: 'none',
                borderRadius: '50%',
                padding: '12px',
                color: 'white',
                backdropFilter: 'blur(10px)',
                zIndex: 10
              }}
            >
              <Camera size={24} />
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
             <UserIcon size={64} style={{ opacity: 0.1, marginBottom: '20px' }} />
             <button onClick={() => setShowCamera(true)} className="primary-button" style={{ display: 'flex', gap: '8px' }}>
              <Camera size={20} />
              Crea Avatar Base
            </button>
          </div>
        )}
      </div>

      <p style={{ marginBottom: '16px', opacity: 0.7 }}>Cancellando i dati del browser perderai il guardaroba. Scarica una copia delle tue foto e dei tuoi outfit.</p>
      <button onClick={async () => {
        try {
          await exportBackup();
        } catch { alert('Non è stato possibile esportare il guardaroba.'); }
      }} className="primary-button" style={{ width: '100%' }}>
        Scarica backup
      </button>

      {showCamera && (
        <CameraCapture 
          title="Scatta Foto Base (Avatar)"
          mode="avatar"
          onClose={() => setShowCamera(false)}
          onCapture={handleCapture}
        />
      )}
    </div>
  );
}
