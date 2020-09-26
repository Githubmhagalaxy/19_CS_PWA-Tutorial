const DB_NAME = 'module-19-indexeddb';
const DB_VERSION = 1;
const DB_STORE_NAME = 'transactions';

var db;

console.log('opening db ...');
let req = indexedDB.open(DB_NAME, DB_VERSION);

req.onsuccess = function (event) {
    db = req.result;
    console.log('database opened successfully');
}

req.onerror = function (event) {
    console.error('database error:', event.target.errorCode);
}

req.onupgradeneeded = function (event) {
    console.log("database onupgradeneeded");
    var store = event.currentTarget.result.createObjectStore(DB_STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true
    });
    store.createIndex('name', 'name', {unique: false});
    store.createIndex('value', 'value', {unique: false});
    store.createIndex('date', 'date', {unique: false});
}

function getObjectStore(storeName, mode) {
    // return db.transaction(storeName, mode).objectStore(storeName);
    var tmp = db.transaction([storeName], mode);
    return tmp.objectStore(storeName);
}


function clearObjectStore() {
    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    var req = store.clear();
    req.onsuccess = (event) => {
        console.log('store cleared');
    }
    req.onerror = event => {
        console.error("clearObjectStore:", event.target.errorCode);
    }
}

async function syncData() {
    try {
        let objectStore = getObjectStore(DB_STORE_NAME, 'readwrite');
        let request = objectStore.getAll();
        request.onerror = (event) => {
            console.error(event);
        }
        request.onsuccess = async (event) => {
            const result = await fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(event.target.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            });
            console.log('data synced successfully');
            clearObjectStore();
        }
    } catch (e) {
        console.error(e.message);
    }
}
