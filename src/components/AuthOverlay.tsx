'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn } from 'lucide-react';

const AuthOverlay = () => {
  const { user, loading, loginWithGoogle } = useAuth();

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--background)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5000
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '50px', height: '50px', border: '3px solid rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          <div style={{ 
            position: 'absolute',
            top: 0,
            width: '50px', 
            height: '50px', 
            border: '3px solid var(--primary)', 
            borderTopColor: 'transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }} />
        </div>
        <style jsx>{` @keyframes spin { 100% { transform: rotate(360deg); } } `}</style>
      </div>
    );
  }

  if (user) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(13, 13, 18, 0.95)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      zIndex: 5000,
      textAlign: 'center'
    }}>
      <div className="glass" style={{ padding: '40px 20px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>IL MIO <span className="text-gradient">ARMADIO</span></h2>
        <p style={{ opacity: 0.7, marginBottom: '40px' }}>Benvenuto nel tuo guardaroba virtuale. Accedi per salvare i tuoi capi e creare outfit unici.</p>
        
        <button 
          onClick={loginWithGoogle}
          className="primary-button" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}
        >
          <LogIn size={20} />
          Accedi con Google
        </button>

        <p style={{ marginTop: '20px', fontSize: '10px', opacity: 0.3 }}>
          Continuando accetti i termini di servizio e la privacy policy.
        </p>
        <div style={{ marginTop: '10px', fontSize: '8px', opacity: 0.2 }}>
          Proxy Status: Ready | Persist: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "OK" : "Missing"}
        </div>
      </div>
    </div>
  );
};

export default AuthOverlay;
