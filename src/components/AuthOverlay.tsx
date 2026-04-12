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
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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

        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={() => { /* Logic to bypass or set a fake user */ }}
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: '1px solid var(--card-border)',
              color: 'var(--foreground)',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Entra come Ospite (Test)
          </button>
        )}
        
        <p style={{ fontSize: '12px', marginTop: '24px', opacity: 0.4 }}>
          Continuando accetti i termini di servizio e la privacy policy.
        </p>
      </div>
    </div>
  );
};

export default AuthOverlay;
