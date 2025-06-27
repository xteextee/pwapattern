// Acest script gestioneaza interactiunea cu IndexedDB
let db;

function initDB() {
    return new Promise((resolve, reject) => {
        // Deschidem (sau cream) baza de date. Versiunea 1.
        const request = indexedDB.open('NotiteDB', 1);

        // Se executa daca structura bazei de date trebuie creata sau actualizata
        request.onupgradeneeded = event => {
            db = event.target.result;
            // Cream un "object store" (similar cu un tabel in SQL)
            // `id` va fi cheia primara cu auto-incrementare
            if (!db.objectStoreNames.contains('notite_nesincronizate')) {
                db.createObjectStore('notite_nesincronizate', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = event => {
            db = event.target.result;
            console.log('Baza de date IndexedDB a fost deschisă cu succes.');
            resolve(db);
        };

        request.onerror = event => {
            console.error('Eroare la deschiderea IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Functie pentru a adauga o notita in IndexedDB
function adaugaNotitaInDB(notita) {
    const transaction = db.transaction(['notite_nesincronizate'], 'readwrite');
    const store = transaction.objectStore('notite_nesincronizate');
    store.add(notita);
}

// Functie pentru a prelua toate notitele din IndexedDB
function preiaToateNotiteleDinDB() {
    return new Promise(resolve => {
        const transaction = db.transaction(['notite_nesincronizate'], 'readonly');
        const store = transaction.objectStore('notite_nesincronizate');
        const request = store.getAll();
        request.onsuccess = () => {
            resolve(request.result);
        };
    });
}

// Functie pentru a sterge o notita din IndexedDB dupa sincronizare
function stergeNotitaDinDB(id) {
    const transaction = db.transaction(['notite_nesincronizate'], 'readwrite');
    const store = transaction.objectStore('notite_nesincronizate');
    store.delete(id);
}