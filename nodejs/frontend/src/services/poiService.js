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
    return pois.find(poi => poi.id === POIId) || null;
}

export function createPOI(name, address, city, country, category = null) {
    const pois = getPOIs() || [];

    const newId = pois.length > 0
        ? Math.max(...pois.map(p => p.id)) + 1
        : 1;

    const newPoi = {
        id: newId,
        name: name || "New POI " + newId,
        address: address || "",
        city: city,
        country: country,
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
}