import L from 'leaflet';
import { getIconClass, getColorValue } from "./colorIcons";

export const htmlMarkerIcon = (icon = "pin", color = '#555555', isMustHave = false, isSaved = false, size = 30, name = null) => {
    if (!isSaved) { isMustHave = false; }
    if (isMustHave) { isSaved = true; }

    const pinSize = size;

    const cVal = getColorValue(color);

    const pinBg = isSaved ? cVal : 'white';
    const innerBg = cVal;
    const iconColor = 'white';
    const borderColor = isMustHave ? '#1d1b1c' : 'rgba(0,0,0,0)';

    const iconClass = getIconClass(icon);

    const labelHtml = name ? `
        <div class="marker-label" style="
            display: none;
            position: absolute;
            left: ${pinSize + 8}px;
            top: 50%;
            transform: translateY(-50%);
            background-color: #fffaf6;
            ${isMustHave ? 'border: 2px solid #1d1b1c;' : ''}
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            color: ${cVal};
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            z-index: 10;
        ">
            ${name}
        </div>
    ` : '';

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
                ${labelHtml}
            </div>
        `,
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize * 1.2],
        popupAnchor: [0, -pinSize * 1.2],
        tooltipAnchor: [pinSize / 2, -pinSize * 0.5]
    });
};

export const bubbleIcon = (size = 12, name = null) => {
    const pixelSize = size * 4;
    const textColor = '#333333';

    const labelHtml = name ? `
        <div class="marker-label" style="
            display: none;
            position: absolute;
            left: ${pixelSize + 5}px;
            top: 50%;
            transform: translateY(-50%);
            background-color: #ffcdba;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            color: ${textColor};
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            z-index: 10;
        ">
            ${name}
        </div>
    ` : '';

    return L.divIcon({
        html: `
            <div style="position: relative; width: ${pixelSize}px; height: ${pixelSize}px;">
                <div class="relative flex items-center justify-center bg-brighter shadow-lg" 
                     style="width: 100%; height: 100%; 
                            border-radius: 50% 50% 50% 0; 
                            transform: rotate(-45deg);">
                    
                    <i class="bi bi-file-play-fill text-white flex items-center justify-center" 
                       style="transform: rotate(45deg); font-size: ${pixelSize / 2}px;">
                    </i>
                </div>
                ${labelHtml}
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

export const minZoomForLabels = 14;