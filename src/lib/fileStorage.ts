const databaseName = 'score-link-files';
const storeName = 'files';

type StoredFile = {
  name: string;
  type: string;
  lastModified: number;
  bytes: ArrayBuffer;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveStoredFile(key: string, file: File): Promise<void> {
  const database = await openDatabase();
  const storedFile: StoredFile = {
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
    bytes: await file.arrayBuffer(),
  };

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).put(storedFile, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function loadStoredFile(key: string): Promise<File | undefined> {
  const database = await openDatabase();
  const storedFile = await new Promise<StoredFile | undefined>((resolve, reject) => {
    const request = database.transaction(storeName, 'readonly').objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result as StoredFile | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();

  if (!storedFile) return undefined;
  return new File([storedFile.bytes], storedFile.name, {
    type: storedFile.type,
    lastModified: storedFile.lastModified,
  });
}
