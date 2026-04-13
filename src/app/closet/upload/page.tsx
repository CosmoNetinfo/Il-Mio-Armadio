'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/CameraCapture';
import { Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import { useAuth } from '@/context/AuthContext';
import { uploadClothingItem } from '@/lib/firebaseUtils';

const CATEGORIES = [
  { id: 'tops', label: 'Maglie' },
  { id: 'bottoms', label: 'Pantaloni' },
  { id: 'shoes', label: 'Scarpe' },
  { id: 'hats', label: 'Berretti' },
  { id: 'accessories', label: 'Accessori' },
];

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Category, 2: Camera, 3: Processing, 4: Success
  const [category, setCategory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleCapture = async (blob: Blob) => {
    setStep(3);
    setIsProcessing(true);
    try {
      // Configurazione rimozione sfondo
      const config = {
        progress: (key: string, current: number, total: number) => {
          console.log(`Processing ${key}: ${current}/${total}`);
        },
      };

      const resultBlob = await removeBackground(blob, config);
      const url = URL.createObjectURL(resultBlob);
      setPreviewUrl(url);
      
      if (user) {
        await uploadClothingItem(user.uid, category, resultBlob);
      }
      
      setStep(4);
    } catch (err) {
      console.error("Errore rimozione sfondo:", err);
      alert("C' stato un errore durante l'elaborazione dell'immagine.");
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '0 20px 20px', minHeight: '100vh', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', marginTop: '10px' }}>
        <ChevronLeft onClick={() => router.back()} size={24} />
        <h2 style={{ fontSize: '20px', margin: 0 }}>Nuovo Capo</h2>
      </div>

      {step === 1 && (
        <div className="motion-div">
          <p style={{ opacity: 0.7, marginBottom: '20px' }}>Seleziona la categoria del capo che vuoi caricare:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {CATEGORIES.map((cat) => (
              <div 
                key={cat.id} 
                onClick={() => { setCategory(cat.id); setStep(2); }}
                className="glass"
                style={{ 
                  padding: '24px', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <CameraCapture 
          title={`Scatta foto: ${CATEGORIES.find(c => c.id === category)?.label}`}
          onClose={() => setStep(1)}
          onCapture={handleCapture}
        />
      )}

      {step === 3 && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '60vh' 
        }}>
          <Loader2 size={48} className="spin" style={{ color: 'var(--primary)', marginBottom: '20px' }} />
          <h3 style={{ fontSize: '20px', textAlign: 'center' }}>Sto rimuovendo lo sfondo...</h3>
          <p style={{ opacity: 0.6, marginTop: '10px' }}>Questo richiede qualche secondo</p>
          
          <style jsx>{`
            .spin { animation: spin 2s linear infinite; }
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      {step === 4 && (
        <div style={{ textAlign: 'center', paddingTop: '40px' }}>
          <CheckCircle2 size={80} color="#4caf50" style={{ marginBottom: '24px' }} />
          <h2 style={{ marginBottom: '16px' }}>Capo aggiunto!</h2>
          {previewUrl && (
            <div className="glass" style={{ width: '200px', height: '200px', margin: '0 auto 30px', overflow: 'hidden' }}>
              <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}
          <button className="primary-button" onClick={() => router.push('/closet')} style={{ width: '100%' }}>
            Torna al Guardaroba
          </button>
        </div>
      )}
    </div>
  );
}
