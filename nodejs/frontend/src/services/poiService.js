import poiObject from '@/assets/poi.json';
import {getItem, initData, setItem, StorageKeys} from '@/services/storageService';

export function initializePoiStorage() {
    initData(StorageKeys.POI, poiObject);
}

export function getPOIs() {
    return getItem(StorageKeys.POI);
}

export function getPOI(POIId) {
    const pois = getPOIs() || [];

    const poiIndex = pois.findIndex(poi => poi.id === POIId);
    if (poiIndex === -1) {
        console.error(`Errore: Impossibile ottenere il POI con ID ${mapId} poichè non esiste.`);
        return;
    }
    return pois[poiIndex];
}

export function createPOI(name, address, category) {
    const pois = getPOIs() || [];

    const newId = pois.length > 0
        ? Math.max(...pois.map(p => p.id)) + 1
        : 1;

    const newPoi = {
        id: newId,
        name: name || "New POI " + newId,
        address: address || "",
        category: category || "Generic",
    };

    pois.push(newPoi);
    setItem(StorageKeys.POI, pois);

    return newPoi;
}

export function deletePoi(poiId) {
    const pois = getPOIs() || [];
    const updatedPois = pois.filter(p => p.id !== poiId);

    if (pois.length !== updatedPois.length) {
        setItem(StorageKeys.POI, updatedPois);
        return;
    }

    console.warn(`POI con ID ${poiId} non trovato.`);
}