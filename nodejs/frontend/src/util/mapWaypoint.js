import L from 'leaflet';
import { getIconClass, getColorValue } from "./colorIcons";

export const htmlMarkerIcon = (icon = "pin", color = '#555555', isMustHave = false, isSaved = false, size = 30) => {
    if (!isSaved) { isMustHave = false; }
    if (isMustHave) { isSaved = true; }

    const pinSize = size;

    const cVal = getColorValue(color);

    const pinBg = isSaved ? cVal : 'white';
    const innerBg = cVal;
    const iconColor = 'white';
    const borderColor = isMustHave ? '#1d1b1c' : 'rgba(0,0,0,0)';

    const iconClass = getIconClass(icon);

    return L.divIcon({
        className: '',
        html: `
            <div style="position: relative; width: ${pinSize}px; height: ${pinSize}px;">
                <div style="
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-color: ${pinBg};
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    box-shadow: 1px 1px 4px rgba(0,0,0,0.3);
                    border: 2px solid ${borderColor};
                    z-index: 1;
                "></div>
                
                <div style="
                    position: absolute;
                    width: ${pinSize * 0.80}px;
                    height: ${pinSize * 0.80}px;
                    background-color: ${innerBg};
                    border-radius: 50%;
                    top: 50%; 
                    left: 50%; 
                    transform: translate(-50%, -55%);
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 0 2px rgba(0,0,0,0.1);
                ">
                    <i class="bi ${iconClass}" style="color: ${iconColor}; font-size: ${pinSize * 0.50}px;"></i>
                </div>
            </div>
        `,
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize * 1.2],
        popupAnchor: [0, -pinSize * 1.2],
        tooltipAnchor: [pinSize / 2, -pinSize * 0.5]
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

export const temporaryMarkerIcon = () => L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
