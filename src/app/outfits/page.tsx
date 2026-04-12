'use client';
import React from 'react';
import Header from '@/components/Header';
import { Bookmark, Heart, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

interface Outfit {
  id: string;
  name: string;
  items: string[];
  preview_url: string;
  created_at: any;
}

export default function OutfitsPage() {
  const { user } = useAuth();
  const [outfits, setOutfits] = React.useState<Outfit[]>([]);

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'outfits'), where('user_id', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOutfits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Outfit)));
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo outfit?")) {
      await deleteDoc(doc(db, 'outfits', id));
    }
  };

  return (
    <div style={{ padding: '0 20px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>I Miei <span className="text-gradient">Outfit</span></h2>
        <div className="glass" style={{ padding: '8px' }}>
          <Heart size={20} opacity={0.7} />
        </div>
      </div>

      {/* Grid of Outfits */}
      <div className="closet-grid" style={{ gridTemplateColumns: '1fr' }}>
        {outfits.map((outfit) => (
          <div key={outfit.id} className="glass" style={{ 
            height: '180px', 
            display: 'flex', 
            padding: '16px', 
            gap: '16px',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{ 
              width: '100px', 
              height: '100%', 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              {outfit.preview_url ? (
                <img src={outfit.preview_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.2 }}>
                  <Bookmark size={24} />
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{outfit.name}</h3>
              <p style={{ fontSize: '14px', opacity: 0.5 }}>
                Creato il {outfit.created_at?.toDate().toLocaleDateString('it-IT') || '...'}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                 <div className="glass" style={{ padding: '4px 8px', fontSize: '10px' }}>{outfit.items.length} Capi</div>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(outfit.id)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,75,75,0.5)',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        {/* Empty state if no outfits */}
        {outfits.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            opacity: 0.3,
            border: '1px dashed var(--card-border)',
            borderRadius: '20px'
          }}>
            <Bookmark size={48} style={{ marginBottom: '16px' }} />
            <p>Non hai ancora salvato nessun outfit</p>
          </div>
        )}
      </div>
    </div>
  );
}
