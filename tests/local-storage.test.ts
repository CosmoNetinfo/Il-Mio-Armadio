import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readWardrobe, uploadClothingItem, updateProfileAvatar, saveOutfit, deleteClothingItem, subscribeWardrobe } from '../src/lib/localStorage';

beforeEach(() => {
  window.localStorage.clear();
  Object.defineProperty(navigator, 'storage', { configurable: true, value: {} });
});
afterEach(() => vi.restoreAllMocks());
const photo = () => new Blob(['image'], { type: 'image/png' });

describe('Device storage', () => {
  it('persists photos, avatar and fitting without a network request', async () => {
    const fetch = vi.spyOn(window, 'fetch').mockRejectedValue(new Error('offline'));
    const id = await uploadClothingItem('tops', photo());
    await updateProfileAvatar(photo());
    await saveOutfit('Lunedì', [id], '', { tops: { x: 10, y: 20, scale: 1.2 } });
    const data = await readWardrobe();
    expect(data.clothes[0].image_url).toMatch(/^data:image\/png;base64,/);
    expect(data.avatar).toMatch(/^data:image\/png;base64,/);
    expect(data.outfits[0].fitting.tops).toEqual({ x: 10, y: 20, scale: 1.2 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('does not lose simultaneous saves and cleans up outfits when a garment is deleted', async () => {
    const ids = await Promise.all([uploadClothingItem('tops', photo()), uploadClothingItem('shoes', photo())]);
    expect((await readWardrobe()).clothes).toHaveLength(2);
    await saveOutfit('Completo', ids);
    await deleteClothingItem(ids[0]);
    expect((await readWardrobe()).outfits[0].items).toEqual([ids[1]]);
    await deleteClothingItem(ids[1]);
    expect((await readWardrobe()).outfits).toEqual([]);
  });
  it('reports a full device and keeps the previous wardrobe intact', async () => {
    await uploadClothingItem('tops', photo());
    const original = await readWardrobe();
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Full', 'QuotaExceededError'); });
    await expect(uploadClothingItem('shoes', photo())).rejects.toThrow('Full');
    expect(await readWardrobe()).toEqual(original);
    write.mockRestore();
    await uploadClothingItem('hats', photo());
    expect((await readWardrobe()).clothes).toHaveLength(2);
  });
  it('uses a private device file when OPFS is available', async () => {
    let contents: string | null = null;
    const writer = { write: vi.fn(async (text: string) => { contents = text; }), close: vi.fn(), abort: vi.fn() };
    const file = { getFile: async () => ({ text: async () => contents }), createWritable: async () => writer };
    const getFileHandle = vi.fn(async (_: string, options?: { create?: boolean }) => {
      if (!options?.create && contents === null) throw new DOMException('Missing', 'NotFoundError');
      return file;
    });
    Object.defineProperty(navigator, 'storage', { configurable: true, value: { getDirectory: async () => ({ getFileHandle }) } });
    const id = await uploadClothingItem('bottoms', photo());
    expect((await readWardrobe()).clothes[0].id).toBe(id);
    expect(writer.close).toHaveBeenCalledOnce();
    expect(window.localStorage.length).toBe(0);
  });
  it('does not silently overwrite unreadable data', async () => {
    window.localStorage.setItem('il-mio-armadio.json', 'broken');
    await expect(uploadClothingItem('tops', photo())).rejects.toThrow();
    expect(window.localStorage.getItem('il-mio-armadio.json')).toBe('broken');
  });
  it('notifies subscribers after saves and stops after cleanup', async () => {
    const onData = vi.fn();
    const dispose = subscribeWardrobe(onData, vi.fn());
    await vi.waitFor(() => expect(onData).toHaveBeenCalledOnce());
    await uploadClothingItem('tops', photo());
    await vi.waitFor(() => expect(onData).toHaveBeenCalledTimes(2));
    dispose();
    await uploadClothingItem('shoes', photo());
    expect(onData).toHaveBeenCalledTimes(2);
  });
});
