/**
 * Utility per il caricamento di immagini su Cloudinary
 */

const CLOUD_NAME = "ddfml9fyn";
const UPLOAD_PRESET = "armadio_preset";

export const uploadToCloudinary = async (imageBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('file', imageBlob);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Errore durante l\'upload su Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
