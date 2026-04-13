'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Camera, LogOut, ChevronLeft, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/CameraCapture';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { updateProfileAvatar } from '@/lib/firebaseUtils';
import { removeBackground } from '@imgly/background-removal';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAvatarUrl(docSnap.data().body_photo_url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async (blob: Blob) => {
    if (!user) return;
    try {
      setLoading(true);
      setIsProcessing(true);
      
      console.log("Rimozione sfondo avatar in corso...");
      const config = {
        progress: (key: string, current: number, total: number) => {
          console.log(`Processing ${key}: ${current}/${total}`);
        },
      };

      const resultBlob = await removeBackground(blob, config);
      
      const url = await updateProfileAvatar(user.uid, resultBlob);
      setAvatarUrl(url);
      setShowCamera(false);
    } catch (err) {
      console.error(err);
      alert("Errore durante l'elaborazione o il caricamento.");
    } finally {
      setLoading(false);
      setIsProcessing(false);
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
          {user?.photoURL ? (
            <img src={user.photoURL} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          ) : (
            <UserIcon size={48} opacity={0.3} />
          )}
        </div>
        <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{user?.displayName || 'Utente'}</h3>
        <p style={{ fontSize: '14px', opacity: 0.5 }}>{user?.email}</p>
      </div>

      <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>Il Tuo Avatar Base</h3>
      <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px' }}>
        Questa  la foto su cui verranno "indossati" i vestiti. Scattala preferibilmente in intimo o abbigliamento molto aderente.
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
            <p style={{ fontWeight: '600', fontSize: '14px' }}>Rimuovendo lo sfondo...</p>
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

      <button onClick={logout} className="glass" style={{ width: '100%', color: '#ff4b4b', border: '1px solid rgba(255, 75, 75, 0.2)', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
        <LogOut size={20} />
        Disconnetti
      </button>

      {showCamera && (
        <CameraCapture 
          title="Scatta Foto Base (Avatar)"
          onClose={() => setShowCamera(false)}
          onCapture={handleCapture}
        />
      )}
    </div>
  );
}
