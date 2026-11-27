import { Capacitor } from '@capacitor/core';
import { readWardrobe } from './localStorage';

export async function exportBackup() {
  const data = JSON.stringify(await readWardrobe());
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const file = await Filesystem.writeFile({ path: 'il-mio-armadio-backup.json', data, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: 'Backup Il Mio Armadio', files: [file.uri] });
    return;
  }
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'il-mio-armadio-backup.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
