import usersObject from '@/assets/users.json';
import poiObject from '@/assets/poi.json';

export const KEYS = {
    USERS: 'users',
    POI: 'poi'
};

const DEFAULTS = {
    [KEYS.USERS]: usersObject,
    [KEYS.POI]: poiObject
};

export function initializeStorageIfNecessary() {
    for (const [key, value] of Object.entries(DEFAULTS)) {
        console.log(value);
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }
}

export const StorageManager = {
    getAll: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    setAll: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    },

    get: (key, id) => {
        const list = StorageManager.getAll(key);
        return list.find(item => item.id === id) || null;
    },

    add: (key, item) => {
        const list = StorageManager.getAll(key);
        const maxId = list.length > 0 ? Math.max(...list.map(i => i.id)) : 0;
        item.id = maxId + 1;
        list.push(item);
        StorageManager.setAll(key, list);
        return item;
    },

    update: (key, id, payload) => {
        const list = StorageManager.getAll(key);
        const index = list.findIndex(i => i.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...payload };
            StorageManager.setAll(key, list);
            return list[index];
        }
        return null;
    },

    remove: (key, id) => {
        const list = StorageManager.getAll(key);
        const newList = list.filter(i => i.id !== id);
        StorageManager.setAll(key, newList);
    }
};