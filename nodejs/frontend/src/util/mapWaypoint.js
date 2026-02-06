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
            background-color: ${isSaved ? cVal : 'white'};
            ${isMustHave ? 'border: 2px solid #1d1b1c;' : ''}
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            color: ${isSaved ? 'white' : cVal};
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

export const bubbleIcon = (name = null, selected = false, index = 0) => {
    const pixelSize = 48;
    const textColor = '#333333';
    let bubbleColor = "bg-bright";
    let iconColor = "text-white";
    if (!selected) {
        bubbleColor = "bg-white border border-bright"
        iconColor = "text-bright"
    }
    const labelHtml = name ? `
        <div class="marker-label" style="
            display: none;
            position: absolute;
            left: ${pixelSize + 5}px;
            top: 50%;
            transform: translateY(-50%);
            background-color: ${selected ? '#ffcdba' : '#fffaf6'};
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            color: ${textColor};
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            z-index: 10;
        ">
            ${name ? name : 'Video'}
        </div>
    ` : '';

    const animStyle = !selected 
        ? `animation: pop-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards; animation-delay: ${(index * 0.1).toFixed(2)}s;`
        : '';
        
    const floatStyle = !selected
        ? `animation-delay: ${-(Math.random() * 2).toFixed(2)}s;`
        : '';
        
    const content = `
        <div class="relative flex items-center justify-center ${bubbleColor} shadow-lg" 
                style="width: ${pixelSize}px; height: ${pixelSize}px; 
                    border-radius: 50% 50% 50% 0; 
                    transform: rotate(-45deg);">
            
            <i class="bi bi-file-play-fill ${iconColor} flex items-center justify-center" 
                style="transform: rotate(45deg); font-size: ${pixelSize / 2}px;">
            </i>
        </div>
        ${labelHtml}
    `;

    return L.divIcon({
        html: !selected ? `
            <div style="${animStyle}">
                <div class="animate-float" style="${floatStyle}">
                    ${content}
                </div>
            </div>
        ` : content,
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
