import { Capacitor } from '@capacitor/core';

export type FittingConfig = Record<string, { x: number; y: number; scale: number }>;
export interface ClothingItem { id: string; category: string; image_url: string; created_at: string }
export interface Outfit { id: string; name: string; items: string[]; preview_url: string; fitting: FittingConfig; created_at: string }
export interface Wardrobe { version: 1; clothes: ClothingItem[]; outfits: Outfit[]; avatar: string | null }
const FILE = 'il-mio-armadio.json';
const EVENT = 'wardrobe-changed';
const empty = (): Wardrobe => ({ version: 1, clothes: [], outfits: [], avatar: null });

// A private file on this device (OPFS), with localStorage for older browsers.
// No account, database server or image upload is involved.
async function readText(): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const listing = await Filesystem.readdir({ path: '', directory: Directory.Data });
    if (!listing.files.some(file => file.name === FILE)) return null;
    const file = await Filesystem.readFile({ path: FILE, directory: Directory.Data, encoding: Encoding.UTF8 });
    return file.data as string;
  }
  if (navigator.storage?.getDirectory) {
    const directory = await navigator.storage.getDirectory();
    try { return await (await (await directory.getFileHandle(FILE)).getFile()).text(); }
    catch (error) { if ((error as DOMException).name === 'NotFoundError') return null; throw error; }
  }
  return window.localStorage.getItem(FILE);
}

export async function readWardrobe(): Promise<Wardrobe> {
  const text = await readText();
  if (text === null) return empty();
  const data = JSON.parse(text) as Wardrobe;
  if (data.version !== 1 || !Array.isArray(data.clothes) || !Array.isArray(data.outfits)) {
    throw new Error('Archivio locale non riconosciuto.');
  }
  return data;
}

async function writeWardrobe(data: Wardrobe) {
  const text = JSON.stringify(data);
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    await Filesystem.writeFile({ path: FILE + '.tmp', data: text, directory: Directory.Data, encoding: Encoding.UTF8 });
    await Filesystem.rename({ from: FILE + '.tmp', to: FILE, directory: Directory.Data, toDirectory: Directory.Data });
  } else if (navigator.storage?.getDirectory) {
    const directory = await navigator.storage.getDirectory();
    const handle = await directory.getFileHandle(FILE, { create: true });
    const writer = await handle.createWritable();
    try { await writer.write(text); await writer.close(); }
    catch (error) { await writer.abort().catch(() => {}); throw error; }
  } else {
    window.localStorage.setItem(FILE, text);
  }
  window.dispatchEvent(new Event(EVENT));
  // Best effort: browsers may decline protection against automatic eviction.
  void navigator.storage?.persist?.().catch(() => {});
}

let pending: Promise<unknown> = Promise.resolve();
function mutate(change: (data: Wardrobe) => void): Promise<void> {
  const run = async () => {
    const update = async () => { const data = await readWardrobe(); change(data); await writeWardrobe(data); };
    if (navigator.locks?.request) await navigator.locks.request(FILE, update);
    else await update();
  };
  const next = pending.then(run, run);
  pending = next;
  return next;
}

export function subscribeWardrobe(onData: (data: Wardrobe) => void, onError: (error: unknown) => void) {
  let active = true;
  let revision = 0;
  const refresh = () => {
    const current = ++revision;
    void readWardrobe().then(data => { if (active && current === revision) onData(data); }, error => {
      if (active && current === revision) onError(error);
    });
  };
  window.addEventListener(EVENT, refresh);
  window.addEventListener('storage', refresh);
  window.addEventListener('focus', refresh);
  refresh();
  return () => {
    active = false;
    window.removeEventListener(EVENT, refresh);
    window.removeEventListener('storage', refresh);
    window.removeEventListener('focus', refresh);
  };
}

async function imageData(blob: Blob): Promise<string> {
  if (!blob.type.startsWith('image/') || !blob.size || blob.size > 20 * 1024 * 1024) throw new Error('Scegli un’immagine fino a 20 MB.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function uploadClothingItem(category: string, blob: Blob) {
  if (!['tops', 'bottoms', 'shoes', 'hats', 'accessories'].includes(category)) throw new Error('Categoria non valida.');
  const image_url = await imageData(blob);
  const id = crypto.randomUUID();
  await mutate(data => { data.clothes.push({ id, category, image_url, created_at: new Date().toISOString() }); });
  return id;
}

export async function updateProfileAvatar(blob: Blob) {
  const image = await imageData(blob);
  await mutate(data => { data.avatar = image; });
  return image;
}

export async function saveOutfit(name: string, items: string[], preview_url = '', fitting: FittingConfig = {}) {
  if (!items.length) throw new Error('Seleziona almeno un capo.');
  const id = crypto.randomUUID();
  await mutate(data => {
    if (!items.every(item => data.clothes.some(clothing => clothing.id === item))) throw new Error('Un capo non è più disponibile.');
    data.outfits.push({ id, name, items, preview_url, fitting, created_at: new Date().toISOString() });
  });
  return id;
}

export const deleteClothingItem = (id: string) => mutate(data => {
  data.clothes = data.clothes.filter(item => item.id !== id);
  data.outfits = data.outfits.map(outfit => {
    const items = outfit.items.filter(item => item !== id);
    return { ...outfit, items, preview_url: data.clothes.find(item => item.id === items[0])?.image_url || '' };
  }).filter(outfit => outfit.items.length > 0);
});
export const deleteOutfit = (id: string) => mutate(data => { data.outfits = data.outfits.filter(item => item.id !== id); });

