import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { uploadToCloudinary } from './cloudinary';

export const uploadClothingItem = async (
  userId: string,
  category: string,
  imageBlob: Blob
) => {
  try {
    // 1. Caricamento immagine su Cloudinary (GRATUITO, no piano Blaze)
    const downloadURL = await uploadToCloudinary(imageBlob);

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

/**
 * Aggiorna l'avatar del profilo caricando la foto su Cloudinary
 */
export const updateProfileAvatar = async (userId: string, imageBlob: Blob) => {
  try {
    const downloadURL = await uploadToCloudinary(imageBlob);
    
    await setDoc(doc(db, 'profiles', userId), {
      body_photo_url: downloadURL,
      updated_at: serverTimestamp()
    }, { merge: true });

    return downloadURL;
  } catch (error) {
    console.error("Errore aggiornamento avatar:", error);
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
