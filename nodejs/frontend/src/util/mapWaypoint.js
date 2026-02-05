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

export const bubbleIcon = (selected = false) => {
    const pixelSize = 48;
    let bubbleColor = "bg-bright";
    let iconColor = "text-white";
    if (!selected) {
        bubbleColor = "bg-white border border-bright"
        iconColor = "text-bright"
    }
    return L.divIcon({
        html: `
            <div class="relative flex items-center justify-center ${bubbleColor} shadow-lg" 
                 style="width: ${pixelSize}px; height: ${pixelSize}px; 
                        border-radius: 50% 50% 50% 0; 
                        transform: rotate(-45deg);">
                
                <i class="bi bi-file-play ${iconColor} flex items-center justify-center" 
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

export const userIcon = L.divIcon({
    className: '!bg-transparent !border-0', 
    html: `
        <div class="relative flex items-center justify-center w-full h-full">
            <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-blue-400"></span>
            
            <span class="relative inline-flex w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-sm"></span>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});