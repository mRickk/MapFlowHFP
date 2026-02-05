import { getIconClass, getColorValue } from "./colorIcons";

export const htmlMarkerIcon = (icon = "pin", color = '#555555', isMustHave = false, isSaved = false, size = 15) => {
    const mustHaveSize = parseInt(size*1.5);
    return L.divIcon({
        html: `<div style="background-color: ${getColorValue(color)}; width: ${isMustHave ? mustHaveSize : size}px; height: ${isMustHave ? mustHaveSize : size}px; border-radius: 50%; border: 2px solid ${isSaved ? getColorValue(color) : 'white'};"></div>`,
        className: icon == "pin" ? '' : `bi ${getIconClass(icon)}`,
        iconSize: [size, isMustHave ? mustHaveSize : size],
        iconAnchor: isMustHave ? [mustHaveSize / 2, mustHaveSize / 2] : [size / 2, size / 2],
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

export const redMarkerIcon = () => L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
