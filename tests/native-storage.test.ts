import { beforeEach, expect, it, vi } from 'vitest';
import { readWardrobe, uploadClothingItem } from '../src/lib/localStorage';

const state = vi.hoisted(() => ({ files: new Map<string, string>(), fail: false }));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true } }));
vi.mock('@capacitor/filesystem', () => ({
  Directory: { Data: 'DATA' }, Encoding: { UTF8: 'utf8' },
  Filesystem: {
    readdir: async () => ({ files: [...state.files.keys()].map(name => ({ name })) }),
    readFile: async ({ path }: { path: string }) => ({ data: state.files.get(path) }),
    writeFile: async ({ path, data }: { path: string; data: string }) => {
      if (state.fail) throw new Error('Device full');
      state.files.set(path, data);
    },
    rename: async ({ from, to }: { from: string; to: string }) => {
      state.files.set(to, state.files.get(from)!); state.files.delete(from);
    },
  },
}));
beforeEach(() => { state.files.clear(); state.fail = false; });

it('stores Android photos in a private file and reads them again', async () => {
  await uploadClothingItem('tops', new Blob(['photo'], { type: 'image/png' }));
  expect((await readWardrobe()).clothes).toHaveLength(1);
  expect([...state.files.keys()]).toEqual(['il-mio-armadio.json']);
});

it('keeps the original Android file if the device runs out of space', async () => {
  await uploadClothingItem('tops', new Blob(['photo'], { type: 'image/png' }));
  const previous = state.files.get('il-mio-armadio.json');
  state.fail = true;
  await expect(uploadClothingItem('shoes', new Blob(['photo'], { type: 'image/png' }))).rejects.toThrow('Device full');
  expect(state.files.get('il-mio-armadio.json')).toBe(previous);
});
