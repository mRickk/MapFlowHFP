const iconMap = {
    'museum': 'bi-bank2',
    'park': 'bi-tree-fill',
    'restaurant': 'bi-fork-knife',
    'food': 'bi-egg-fried',
    'landmark': 'bi-buildings-fill',
    'square': 'bi-geo-alt-fill',
    'pin': 'bi-geo-alt-fill',
    'home': 'bi-house-door-fill',
    'star': 'bi-star-fill',
    'flag': 'bi-flag-fill',
    'heart': 'bi-heart-fill',
    'camera': 'bi-camera-fill',
    'parking': 'bi-p-circle-fill',
    'shopping': 'bi-bag-fill',
    'hotel': 'bi-building-fill',
    'cafe': 'bi-cup-fill',
    'theater': 'bi-film',
    'school': 'bi-mortarboard-fill',
    'hospital': 'bi-h-circle-fill',
    'cash': 'bi-cash-coin',
    'gas': 'bi-fuel-pump-fill',
    'airport': 'bi-airplane-fill',
    'train': 'bi-train-front-fill',
    'bus': 'bi-bus-front-fill',
    'bicycle': 'bi-bicycle',
    'walking': 'bi-person-walking',
    'car': 'bi-car-front-fill',
  };

const colorMap = { 
    "red": "#f36a73",
    "orange": "#f0a46f",
    "green": "#64b350",
    "cyan": "#83a9eb",
    "dark": "#66555F",
    "gray": "#8f8f8f",
    'blue': "#4a90e2",
    'purple': "#9b59b6",
    'pink': "#ff69b4",
    'brown': "#a0522d",
};

export const getIconClass = (iconId) => {
  return iconMap[iconId] || 'bi-geo-alt-fill';
};

export const getIconIds = () => {
    return Object.keys(iconMap);
};

export const getColorValue = (colorId) => {
  return colorMap[colorId] || '#555555';
};

export const getColorIds = () => {
  return Object.keys(colorMap);
};