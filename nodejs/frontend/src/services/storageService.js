const KEYS = {
    USER: 'user',
    POI: 'poi'
};

export const StorageKeys = KEYS;

export function getItem(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

export function setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function initData(key, defaultValue) {
    if (!localStorage.getItem(key)) {
        setItem(key, defaultValue);
    }
}