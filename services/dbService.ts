
const DB_NAME = 'LuminaDB';
const STORE_NAME = 'pdfs';

export interface StoredPDF {
  id: string;
  name: string;
  data: Blob;
  size: number;
  date: number;
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const savePDF = async (file: File): Promise<StoredPDF> => {
  const db = await initDB();
  const id = crypto.randomUUID();
  const storedFile: StoredPDF = {
    id,
    name: file.name,
    data: file,
    size: file.size,
    date: Date.now()
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(storedFile);

    request.onsuccess = () => resolve(storedFile);
    request.onerror = () => reject(request.error);
  });
};

export const getAllPDFs = async (): Promise<StoredPDF[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result as StoredPDF[];
      // Ordenar por fecha descendente (más nuevos primero)
      resolve(results.sort((a, b) => b.date - a.date));
    };
    request.onerror = () => reject(request.error);
  });
};

export const deletePDF = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
