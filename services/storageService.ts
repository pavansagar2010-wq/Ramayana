
import { SeriesLore, Book, BookPage } from "../types";

export class StorageService {
  private static DB_NAME = 'RamayanaUniverseDB_v5';
  private static STORE_COVERS = 'covers';
  private static STORE_PAGES = 'pages';
  private static STORE_SCRIPTS = 'scripts';
  private static STORE_LORE = 'lore';
  private static DB_VERSION = 1;
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        [this.STORE_COVERS, this.STORE_PAGES, this.STORE_SCRIPTS, this.STORE_LORE].forEach(store => {
          if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
        });
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        this.dbPromise = null;
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  static async syncCoverToCloud(bookId: number | string, base64: string): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE_COVERS, 'readwrite');
    return new Promise((res, rej) => {
      const req = tx.objectStore(this.STORE_COVERS).put(base64, String(bookId));
      req.onsuccess = () => res();
      req.onerror = rej;
    });
  }

  static async getCoverFromCloud(bookId: number | string): Promise<string | null> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE_COVERS, 'readonly');
    return new Promise((res) => {
      const req = tx.objectStore(this.STORE_COVERS).get(String(bookId));
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => res(null);
    });
  }

  static async syncBookScriptToCloud(bookId: number | string, pages: BookPage[]): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE_SCRIPTS, 'readwrite');
    return new Promise((res, rej) => {
      const req = tx.objectStore(this.STORE_SCRIPTS).put(pages, String(bookId));
      req.onsuccess = () => res();
      req.onerror = rej;
    });
  }

  static async getBookScriptFromCloud(bookId: number | string): Promise<BookPage[] | null> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE_SCRIPTS, 'readonly');
    return new Promise((res) => {
      const req = tx.objectStore(this.STORE_SCRIPTS).get(String(bookId));
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => res(null);
    });
  }

  static async syncPageToCloud(bookId: number | string, pageNumber: number | string, base64: string): Promise<void> {
    const db = await this.getDB();
    const key = `${String(bookId)}_${String(pageNumber)}`;
    const tx = db.transaction(this.STORE_PAGES, 'readwrite');
    return new Promise((res, rej) => {
      const req = tx.objectStore(this.STORE_PAGES).put(base64, key);
      req.onsuccess = () => res();
      req.onerror = rej;
    });
  }

  static async getPageFromCloud(bookId: number | string, pageNumber: number | string): Promise<string | null> {
    const db = await this.getDB();
    const key = `${String(bookId)}_${String(pageNumber)}`;
    const tx = db.transaction(this.STORE_PAGES, 'readonly');
    return new Promise((res) => {
      const req = tx.objectStore(this.STORE_PAGES).get(key);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => res(null);
    });
  }

  static async syncLoreToCloud(lore: SeriesLore): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE_LORE, 'readwrite');
    return new Promise((res, rej) => {
      const req = tx.objectStore(this.STORE_LORE).put(lore, 'main');
      req.onsuccess = () => res();
      req.onerror = rej;
    });
  }

  static async getLoreFromCloud(): Promise<SeriesLore | null> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE_LORE, 'readonly');
    return new Promise((res) => {
      const req = tx.objectStore(this.STORE_LORE).get('main');
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => res(null);
    });
  }

  static async clearUniverse(): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction([this.STORE_COVERS, this.STORE_PAGES, this.STORE_SCRIPTS, this.STORE_LORE], 'readwrite');
    tx.objectStore(this.STORE_COVERS).clear();
    tx.objectStore(this.STORE_PAGES).clear();
    tx.objectStore(this.STORE_SCRIPTS).clear();
    tx.objectStore(this.STORE_LORE).clear();
    return new Promise((res) => { tx.oncomplete = () => res(); });
  }
}
