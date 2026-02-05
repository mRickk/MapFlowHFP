import { getIconClass } from "./colorIcons";

export const htmlMarkerIcon = (icon = 'geo', color = '#555555', isMustHave = false, size = 12) => {
    return L.divIcon({
        html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid ${isMustHave ? color : 'white'};"></div>`,
        className: getIconClass(icon),
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};