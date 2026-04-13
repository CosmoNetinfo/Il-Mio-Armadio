'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Camera, LogOut, ChevronLeft, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/CameraCapture';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { updateProfileAvatar } from '@/lib/firebaseUtils';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      const url = await updateProfileAvatar(user.uid, blob);
      setAvatarUrl(url);
      setShowCamera(false);
    } catch (err) {
      console.error(err);
      alert("Errore durante il caricamento.");
    } finally {
      setLoading(false);
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
          height: '250px', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: '30px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {avatarUrl ? (
          <>
            <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button 
              onClick={() => setShowCamera(true)}
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '50%',
                padding: '12px',
                color: 'white'
              }}
            >
              <Camera size={24} />
            </button>
          </>
        ) : (
          <button onClick={() => setShowCamera(true)} className="primary-button" style={{ display: 'flex', gap: '8px' }}>
            <Camera size={20} />
            Scatta Foto Avatar
          </button>
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
