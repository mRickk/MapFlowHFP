import usersObject from '@/assets/user.json';
import { getItem, setItem, initData, StorageKeys } from '@/services/storageService';

export function initializeUserStorage() {
    initData(StorageKeys.USER, usersObject);
}

export function getUser() {
    return getItem(StorageKeys.USER);
}

function saveUser(user) {
    setItem(StorageKeys.USER, user);
}

export function getMap(mapId) {
    const user = getUser();
    return user?.maps.find(map => map.id === mapId) || null;
}

export function selectMap(mapId) {
    const user = getUser();
    if (!user) return;

    const mapExists = user.maps.some(map => map.id === mapId);

    if (mapExists) {
        user.maps.forEach(map => {
            map.selected = (map.id === mapId);
        });
        saveUser(user);
    } else {
        console.error(`Error: Unabled to select map with ID ${mapId} because it doesn't exists`);
    }
}

export function addMap(mapName, startDate, leaveDate) {
    const user = getUser();
    if (!user) return;

    const newId = user.maps.length > 0
        ? Math.max(...user.maps.map(m => m.id)) + 1
        : 1;

    const newMap = {
        id: newId,
        name: mapName,
        starting_date: startDate,
        leaving_date: leaveDate,
        selected: false,
        saved_poi: []
    };

    user.maps.push(newMap);
    saveUser(user);

    return newMap;
}

export function deleteMap(mapId) {
    const user = getUser();
    if (!user) return;

    const mapIndex = user.maps.findIndex(map => map.id === mapId);
    if (mapIndex === -1) {
        console.error(`Error: Unabled to delete map with ID ${mapId} because it doesn't exists.`);
        return;
    }
    const wasSelected = user.maps[mapIndex].selected;
    user.maps.splice(mapIndex, 1);

    if (wasSelected && user.maps.length > 0) {
        user.maps[0].selected = true;
    }

    saveUser(user);
}

export function addPoiToMap(mapId, poiId, datetime) {
    const user = getUser();
    if (!user) return;

    const map = user.maps.find(m => m.id === mapId);

    if (map) {
        const exists = map.saved_poi.some(p => p.id === poiId);

        if (!exists) {
            map.saved_poi.push({
                id: poiId,
                datetime: datetime
            });
            saveUser(user);
        }
    }
}

export function removePoiFromMap(mapId, poiId) {
    const user = getUser();
    if (!user) return;

    const map = user.maps.find(m => m.id === mapId);

    if (map) {
        const originalLength = map.saved_poi.length;
        map.saved_poi = map.saved_poi.filter(p => p.id !== poiId);

        if (map.saved_poi.length !== originalLength) {
            saveUser(user);
        }
    }
}

export function isPoiSaved(mapId, poiId) {
    const user = getUser();
    if (!user) return false;
    const map = user.maps.find(m => m.id === mapId);
    if (!map) return false;

    return map.saved_poi.some(p => p.id === poiId);
}