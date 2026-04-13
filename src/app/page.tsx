'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Save, Camera, Check, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebaseConfig';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { saveOutfit } from '@/lib/firebaseUtils';
import Link from 'next/link';

interface ClothingItem {
  id: string;
  category: 'tops' | 'bottoms' | 'shoes' | 'accessories' | 'hats';
  image_url: string;
}

export default function Home() {
  const { user } = useAuth();
  const [clothes, setClothes] = useState<Record<string, ClothingItem[]>>({
    tops: [],
    bottoms: [],
    shoes: [],
    hats: [],
    accessories: []
  });
  
  const [selectedTop, setSelectedTop] = useState(0);
  const [selectedBottom, setSelectedBottom] = useState(0);
  const [selectedShoes, setSelectedShoes] = useState(0);
  const [selectedHat, setSelectedHat] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Stati per il Fitting Interattivo
  const [isEditMode, setIsEditMode] = useState(false);
  const [itemConfigs, setItemConfigs] = useState<Record<string, { x: number, y: number, scale: number }>>({
    hats: { x: 0, y: 0, scale: 1 },
    tops: { x: 0, y: 0, scale: 1 },
    bottoms: { x: 0, y: 0, scale: 1 },
    shoes: { x: 0, y: 0, scale: 1 }
  });

  useEffect(() => {
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
      }, { tops: [], bottoms: [], shoes: [], hats: [], accessories: [] } as Record<string, ClothingItem[]>);
      setClothes(grouped);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveOutfit = async () => {
    if (!user) return;
    const selectedItems = [
      clothes.tops[selectedTop],
      clothes.bottoms[selectedBottom],
      clothes.shoes[selectedShoes],
      clothes.hats[selectedHat]
    ].filter(Boolean);

    const itemIds = selectedItems.map(item => item.id);
    const previewUrl = selectedItems[0]?.image_url;
    
    await saveOutfit(user.uid, "Nuovo Outfit", itemIds, previewUrl);
    alert("Outfit salvato!");
  };

  const categories = [
    { key: 'hats', label: 'Berretti', state: selectedHat, setState: setSelectedHat },
    { key: 'tops', label: 'Maglie', state: selectedTop, setState: setSelectedTop },
    { key: 'bottoms', label: 'Pantaloni', state: selectedBottom, setState: setSelectedBottom },
    { key: 'shoes', label: 'Scarpe', state: selectedShoes, setState: setSelectedShoes },
  ];

  const updateScale = (key: string, scale: number) => {
    setItemConfigs(prev => ({
      ...prev,
      [key]: { ...prev[key], scale }
    }));
  };

  return (
    <div style={{ padding: '0 20px 20px' }}>
      {/* Area Visualizzazione Avatar */}
      <div className="glass" style={{ 
        width: '100%', 
        height: '480px', 
        position: 'relative', 
        overflow: isEditMode ? 'visible' : 'hidden', // Permette il drag fuori dai bordi in edit
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '24px',
        backgroundColor: '#000',
        borderRadius: '24px',
        border: isEditMode ? '2px solid var(--primary)' : '1px solid var(--card-border)'
      }}>
        
        {/* Tasto Regola Fitting */}
        <button 
          onClick={() => setIsEditMode(!isEditMode)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 100,
            padding: '8px 16px',
            borderRadius: '20px',
            backgroundColor: isEditMode ? 'var(--primary)' : 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(10px)'
          }}
        >
          {isEditMode ? <Check size={16} /> : <Plus size={16} />}
          {isEditMode ? 'Fine Regolazione' : '📐 Regola Fitting'}
        </button>

        {/* Overlay Istruzioni Edit */}
        {isEditMode && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 100,
            fontSize: '10px',
            opacity: 0.8,
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            Trascina i capi per posizionarli
          </div>
        )}

        {/* Avatar Display */}
        {avatarUrl ? (
          <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: isEditMode ? 0.5 : 1 }} />
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
             <Camera size={48} style={{ marginBottom: '12px' }} />
             <p>Carica il tuo Avatar nel profilo<br/>per iniziare</p>
          </div>
        )}

        {/* Layering Interattivo */}
        <AnimatePresence>
          {categories.map((cat, idx) => {
            const item = clothes[cat.key][cat.state];
            if (!item) return null;
            
            const config = itemConfigs[cat.key];
            const baseStyles: Record<string, any> = {
              hats: { top: '10%', width: '100px', zIndex: 50 },
              tops: { top: '22%', width: '160px', zIndex: 40 },
              bottoms: { top: '48%', width: '150px', zIndex: 30 },
              shoes: { bottom: '12%', width: '130px', zIndex: 20 },
            };

            return (
              <motion.img 
                key={`${cat.key}-${item.id}`}
                drag={isEditMode}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  setItemConfigs(prev => ({
                    ...prev,
                    [cat.key]: { ...prev[cat.key], x: prev[cat.key].x + info.offset.x, y: prev[cat.key].y + info.offset.y }
                  }));
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: config.scale,
                  x: config.x,
                  y: config.y
                }}
                src={item.image_url}
                style={{ 
                  position: 'absolute', 
                  ...baseStyles[cat.key],
                  cursor: isEditMode ? 'move' : 'default',
                  touchAction: 'none',
                  filter: isEditMode ? 'drop-shadow(0 0 10px var(--primary))' : 'none'
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Controlli di Ridimensionamento in Edit Mode */}
      {isEditMode && (
        <div className="glass" style={{ padding: '15px', marginBottom: '20px', animation: 'slideUp 0.3s ease-out' }}>
          <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', opacity: 0.7 }}>RIDIMENSIONA CAPI</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {categories.map(cat => (
              <div key={cat.key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '10px' }}>{cat.label}</span>
                <input 
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={itemConfigs[cat.key].scale}
                  onChange={(e) => updateScale(cat.key, parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--primary)' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selettore Categorie (Horizontal Carousels) */}
      {!isEditMode && categories.map((cat) => (
        <div key={cat.key} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.7 }}>{cat.label}</span>
            <span style={{ fontSize: '12px', color: 'var(--primary)' }}>Vedi tutti</span>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            <Link href="/closet/upload" className="glass" style={{ 
              minWidth: '80px', 
              height: '80px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              border: '1px dashed var(--primary)'
            }}>
              <Plus size={24} color="var(--primary)" />
            </Link>
            
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
                  transition: '0.2s',
                  backgroundColor: 'rgba(255,255,255,0.02)'
                }}
              >
                <img src={item.image_url} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Bottone Salva Outfit */}
      {!isEditMode && (
        <button 
          onClick={handleSaveOutfit}
          className="primary-button" 
          style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Save size={20} />
          Salva Outfit
        </button>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
