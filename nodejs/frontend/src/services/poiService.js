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

export function deletePoi(poiId) {
    const pois = getPOIs() || [];
    const updatedPois = pois.filter(p => p.id !== poiId);

    if (pois.length !== updatedPois.length) {
        setItem(StorageKeys.POI, updatedPois);
        return;
    }
}