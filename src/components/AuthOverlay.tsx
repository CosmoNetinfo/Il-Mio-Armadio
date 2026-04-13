'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn } from 'lucide-react';

const AuthOverlay = () => {
  const { user, loading, error, loginWithGoogle } = useAuth();
  const [showDebug, setShowDebug] = React.useState(false);

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
      <div className="glass" style={{ padding: '40px 20px', width: '100%', maxWidth: '400px', position: 'relative' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>IL MIO <span className="text-gradient">ARMADIO</span></h2>
        <p style={{ opacity: 0.7, marginBottom: '40px' }}>Benvenuto nel tuo guardaroba virtuale. Accedi per salvare i tuoi capi e creare outfit unici.</p>
        
        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: 'rgba(255, 71, 87, 0.1)', 
            border: '1px solid #ff4757', 
            borderRadius: '12px', 
            color: '#ff4757',
            fontSize: '12px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <strong>Errore:</strong> {error}
          </div>
        )}

        <button 
          onClick={loginWithGoogle}
          className="primary-button" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}
        >
          <LogIn size={20} />
          Accedi con Google
        </button>

        <button 
          onClick={() => setShowDebug(!showDebug)}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '10px', textDecoration: 'underline', cursor: 'pointer', marginTop: '10px' }}
        >
          {showDebug ? "Nascondi Info Tecnica" : "Mostra Info Tecnica"}
        </button>

        {showDebug && (
          <div style={{ 
            marginTop: '20px', 
            padding: '10px', 
            backgroundColor: 'rgba(0,0,0,0.3)', 
            borderRadius: '8px', 
            fontSize: '9px', 
            textAlign: 'left',
            color: '#aaa',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            <div>URL: {typeof window !== 'undefined' ? window.location.href : ''}</div>
            <div>Key: ...{process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(-5)}</div>
            <div>Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}</div>
            <div>Proxy: /__/auth/ active</div>
          </div>
        )}

        <p style={{ marginTop: '20px', fontSize: '10px', opacity: 0.3 }}>
          Continuando accetti i termini di servizio e la privacy policy.
        </p>
      </div>
    </div>
  );
};

export default AuthOverlay;
