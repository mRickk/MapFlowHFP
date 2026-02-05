import { getIconClass } from "./colorIcons";

export const htmlMarkerIcon = (icon = 'geo', color = '#555555', isMustHave = false, size = 12) => {
    return L.divIcon({
        html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid ${isMustHave ? color : 'white'};"></div>`,
        className: getIconClass(icon),
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

export const bubbleIcon = (size = 12) => {
    const pixelSize = size * 4;

    return L.divIcon({
        html: `
            <div class="relative flex items-center justify-center bg-bright shadow-lg" 
                 style="width: ${pixelSize}px; height: ${pixelSize}px; 
                        border-radius: 50% 50% 50% 0; 
                        transform: rotate(-45deg);">
                
                <i class="bi bi-file-play text-white flex items-center justify-center" 
                   style="transform: rotate(45deg); font-size: ${pixelSize / 2}px;">
                </i>
            </div>`,
        className: '',
        iconSize: [pixelSize, pixelSize],
        iconAnchor: [0, pixelSize], 
    });
};