import { storage, db } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const uploadClothingItem = async (
  userId: string,
  category: string,
  imageBlob: Blob
) => {
  try {
    // 1. Caricamento immagine su Firebase Storage
    const fileName = `${userId}/${category}_${Date.now()}.png`;
    const storageRef = ref(storage, `clothes/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, imageBlob);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 2. Salvataggio metadati su Firestore
    const docRef = await addDoc(collection(db, 'clothes'), {
      user_id: userId,
      category,
      image_url: downloadURL,
      scale: 1.0,
      pos_x: 0,
      pos_y: 0,
      created_at: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error("Errore durante l'upload:", error);
    throw error;
  }
};

export const saveOutfit = async (userId: string, name: string, items: any[], previewUrl?: string) => {
  try {
    const docRef = await addDoc(collection(db, 'outfits'), {
      user_id: userId,
      name,
      items,
      preview_url: previewUrl || '',
      created_at: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Errore salvataggio outfit:", error);
    throw error;
  }
};
