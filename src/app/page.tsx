'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Save, Camera, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { saveOutfit } from '@/lib/firebaseUtils';

interface ClothingItem {
  id: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'accessories';
  image_url: string;
}

export default function Home() {
  const { user } = useAuth();
  const [clothes, setClothes] = React.useState<Record<string, ClothingItem[]>>({
    tops: [],
    bottoms: [],
    shoes: [],
    accessories: []
  });
  const [selectedTop, setSelectedTop] = useState(0);
  const [selectedBottom, setSelectedBottom] = useState(0);
  const [selectedShoes, setSelectedShoes] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;

    // Fetch Avatar from Profile
    const fetchAvatar = async () => {
      const docSnap = await getDoc(doc(db, 'profiles', user.uid));
      if (docSnap.exists()) {
        setAvatarUrl(docSnap.data().body_photo_url);
      }
    };
    fetchAvatar();

    const q = query(collection(db, 'clothes'), where('user_id', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClothingItem));
      const grouped = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, { tops: [], bottoms: [], shoes: [], accessories: [] } as Record<string, ClothingItem[]>);
      setClothes(grouped);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveOutfit = async () => {
    if (!user) return;
    const selectedItems = [
      clothes.tops[selectedTop],
      clothes.bottoms[selectedBottom],
      clothes.shoes[selectedShoes]
    ].filter(Boolean);

    const itemIds = selectedItems.map(item => item.id);
    const previewUrl = selectedItems[0]?.image_url;
    
    await saveOutfit(user.uid, "Nuovo Outfit", itemIds, previewUrl);
    alert("Outfit salvato!");
  };

  const categories = [
    { key: 'tops', label: 'Maglie', state: selectedTop, setState: setSelectedTop },
    { key: 'bottoms', label: 'Pantaloni', state: selectedBottom, setState: setSelectedBottom },
    { key: 'shoes', label: 'Scarpe', state: selectedShoes, setState: setSelectedShoes },
  ];

  return (
    <div style={{ padding: '0 20px 20px' }}>
      {/* Area Visualizzazione Avatar */}
      <div className="glass" style={{ 
        width: '100%', 
        height: '450px', 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        {/* Avatar Display */}
        {avatarUrl ? (
          <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
             <Camera size={48} style={{ marginBottom: '12px' }} />
             <p>Carica il tuo Avatar nel profilo<br/>per iniziare</p>
          </div>
        )}

        {/* Qui verranno renderizzate le immagini sovrapposte (Layering) */}
        <AnimatePresence>
          {clothes.tops[selectedTop] && (
            <motion.img 
              key={`top-${selectedTop}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={clothes.tops[selectedTop].image_url}
              style={{ position: 'absolute', top: '20%', width: '150px', zIndex: 3 }}
            />
          )}
          {clothes.bottoms[selectedBottom] && (
            <motion.img 
              key={`bottom-${selectedBottom}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={clothes.bottoms[selectedBottom].image_url}
              style={{ position: 'absolute', top: '45%', width: '140px', zIndex: 2 }}
            />
          )}
          {clothes.shoes[selectedShoes] && (
            <motion.img 
              key={`shoes-${selectedShoes}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={clothes.shoes[selectedShoes].image_url}
              style={{ position: 'absolute', bottom: '10%', width: '120px', zIndex: 1 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Selettore Categorie (Horizontal Carousels) */}
      {categories.map((cat) => (
        <div key={cat.key} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.7 }}>{cat.label}</span>
            <span style={{ fontSize: '12px', color: 'var(--primary)' }}>Vedi tutti</span>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            <div className="glass" style={{ 
              minWidth: '80px', 
              height: '80px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              border: '1px dashed var(--primary)'
            }}>
              <Plus size={24} color="var(--primary)" />
            </div>
            
            {clothes[cat.key].map((item: any, idx: number) => (
              <div 
                key={item.id} 
                onClick={() => cat.setState(idx)}
                style={{ 
                  minWidth: '80px', 
                  height: '80px', 
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: cat.state === idx ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                  transition: '0.2s'
                }}
              >
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Bottone Salva Outfit */}
      <button 
        onClick={handleSaveOutfit}
        className="primary-button" 
        style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <Save size={20} />
        Salva Outfit
      </button>
    </div>
  );
}
