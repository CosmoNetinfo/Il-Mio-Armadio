'use client';
import React from 'react';
import Header from '@/components/Header';
import { Plus, Filter, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

interface ClothingItem {
  id: string;
  category: string;
  image_url: string;
}

export default function ClosetPage() {
  const { user } = useAuth();
  const [clothes, setClothes] = React.useState<ClothingItem[]>([]);
  const [filter, setFilter] = React.useState('Tutto');
  const categoriesMap: Record<string, string> = {
    'Maglie': 'tops',
    'Pantaloni': 'bottoms',
    'Scarpe': 'shoes',
    'Accessori': 'accessories'
  };
  const categories = ['Tutto', 'Maglie', 'Pantaloni', 'Scarpe', 'Accessori'];

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'clothes'), where('user_id', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClothes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClothingItem)));
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo capo?")) {
      await deleteDoc(doc(db, 'clothes', id));
    }
  };

  const filteredClothes = filter === 'Tutto' 
    ? clothes 
    : clothes.filter(c => c.category === categoriesMap[filter]);

  return (
    <div style={{ padding: '0 20px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Il Mio <span className="text-gradient">Guardaroba</span></h2>
        <div className="glass" style={{ padding: '8px' }}>
          <Filter size={20} opacity={0.7} />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' }}>
        {categories.map((cat) => (
          <div 
            key={cat} 
            onClick={() => setFilter(cat)}
            className="glass" 
            style={{ 
              padding: '8px 16px', 
              fontSize: '14px', 
              whiteSpace: 'nowrap',
              background: filter === cat ? 'var(--primary)' : 'var(--card-bg)',
              color: filter === cat ? 'white' : 'inherit',
              border: filter === cat ? 'none' : '1px solid var(--card-border)',
              cursor: 'pointer'
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Grid of Clothes */}
      <div className="closet-grid">
        <Link href="/closet/upload" style={{
          height: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: '2px dashed var(--primary)',
          borderRadius: '20px',
          gap: '12px',
          color: 'var(--primary)'
        }}>
          <Plus size={32} />
          <span style={{ fontWeight: '600' }}>Aggiungi</span>
        </Link>

        {/* Real items */}
        {filteredClothes.map((item) => (
          <div key={item.id} className="glass" style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
            <img src={item.image_url} alt="capo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              background: 'rgba(0,0,0,0.5)', 
              padding: '4px 8px', 
              borderRadius: '8px',
              fontSize: '10px'
            }}>
              {item.category}
            </div>
            <button 
              onClick={() => handleDelete(item.id)}
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: 'rgba(255,50,50,0.5)',
                border: 'none',
                borderRadius: '50%',
                padding: '6px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
