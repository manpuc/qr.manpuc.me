import qrCodeStylingModule from 'qr-code-styling';
import { type AppState } from './store';

// Handle Vite/CJS default export quirk
const QRCodeStyling = (qrCodeStylingModule as any).default || qrCodeStylingModule;

// Keep reference to recreate or update
let qrCode: any = null;

// Offscreen canvas for rendering text as image
function createTextEmojiImage(text: string, size: number = 64): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve('');

    // Clear background
    ctx.clearRect(0, 0, size, size);
    
    // Draw text centered
    // Note: Canvas ctx.font does not evaluate CSS var() natively, 
    // leading to fallback 10px font. Use exact font stacks for Emojis.
    ctx.font = `${Math.floor(size * 0.85)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2 + (size * 0.05)); // slight vertical adjust

    resolve(canvas.toDataURL('image/png'));
  });
}

// Generate URL for image-mode emoji (Noto Emoji from CDN)
// using unicode hex point
function getEmojiImageUrl(text: string): string {
  // Extract hex code of first emoji roughly
  const codePoint = text.codePointAt(0);
  if (!codePoint) return '';
  const hex = codePoint.toString(16).toLowerCase();
  // Using direct svg from unpkg or cdnjs or github raw
  return `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u${hex}.svg`;
}

export async function generateQR(state: AppState, container: HTMLElement) {
  // Build options for qr-code-styling
  
  let imageSource = '';
  // Set image if emoji is enabled
  if (state.emojiMode !== 'none' && state.emojiText) {
    if (state.emojiMode === 'text') {
      // 解像度をQRコードの出力サイズに比例させて設定 (高DPIにも耐えうる0.8倍サイズ)
      const renderRes = Math.max(64, Math.round(state.size * 0.8));
      imageSource = await createTextEmojiImage(state.emojiText, renderRes);
    } else {
      imageSource = getEmojiImageUrl(state.emojiText);
    }
  }

  // Handle rounded dots logic
  let typeNumber: 0 | undefined = 0; // auto
  const dotType = state.dotStyle === 'rounded' ? 'rounded' : (state.dotStyle === 'dots' ? 'dots' : 'square');
  const cornerSquareType = dotType === 'rounded' ? 'extra-rounded' : (dotType === 'dots' ? 'dot' : 'square');

  const options = {
    width: state.size,
    height: state.size,
    type: 'svg', // fast rendering
    data: state.data || 'https://qr.manpuc.me/',
    margin: state.margin,
    qrOptions: {
      typeNumber,
      mode: 'Byte',
      errorCorrectionLevel: state.errorCorrection
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 4,
      crossOrigin: 'anonymous'
    },
    dotsOptions: {
      color: state.fgColor,
      type: dotType
    },
    backgroundOptions: {
      color: state.transparentBg ? 'transparent' : state.bgColor,
    },
    cornersSquareOptions: {
      color: state.fgColor,
      type: cornerSquareType
    },
    cornersDotOptions: {
      color: state.fgColor,
      type: dotType === 'dots' ? 'dot' : 'square'
    }
  };

  if (imageSource) {
    // @ts-ignore
    options.image = imageSource;
  } else {
    // @ts-ignore
    options.image = null; // Explicitly remove image if disabled
  }

  if (!qrCode) {
    qrCode = new QRCodeStyling(options);
    container.innerHTML = ''; // clear
    qrCode.append(container);
  } else {
    qrCode.update(options);
  }

  // Return the SVG as data URL for history/preview
  const blob = await qrCode.getRawData('svg');
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function downloadQR(state: AppState, ext: 'png' | 'svg', sizeMultiplier: number = 1) {
  if (!qrCode) return;
  // Temporary update size for download
  const origSize = state.size;
  await qrCode.update({ width: origSize * sizeMultiplier, height: origSize * sizeMultiplier });
  await qrCode.download({
    name: 'qrmaker-' + Date.now(),
    extension: ext
  });
  // Restore size
  await qrCode.update({ width: origSize, height: origSize });
}
