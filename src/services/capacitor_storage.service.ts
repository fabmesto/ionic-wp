import { Injectable } from '@angular/core';
import { MigrateResult, Preferences as Storage } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class CapacitorStorageService {

  constructor(
  ) {

  }

  migrate(): Promise<MigrateResult> {
    return Storage.migrate();
  }

  async set(key: string, value: any): Promise<void> {
    if (typeof value != 'string') {
      value = JSON.stringify(value);
    }
    await Storage.set({
      key: key,
      value: value
    });
  }

  async get(key: string): Promise<string | null> {
    const item = await Storage.get({ key: key });
    return item.value;
  }

  async remove(key: string): Promise<void> {
    await Storage.remove({
      key: key
    });
  }

  async removes(startkey: string): Promise<void> {
    let keys = await this.keys();
    if (keys['keys']) {
      for (let index in keys['keys']) {
        let key = keys['keys'][index];
        if (key.startsWith(startkey)) {
          this.remove(key);
        }
      }
    }
  }

  async clear(): Promise<void> {
    await Storage.clear();
  }

  async keys(): Promise<{ keys: string[] }> {
    return await Storage.keys();
  }
}
