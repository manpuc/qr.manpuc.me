import qrCodeStylingModule from 'qr-code-styling';
import { type AppState } from './store';

// Handle Vite/CJS default export quirk
const QRCodeStyling = (qrCodeStylingModule as any).default || qrCodeStylingModule;

// Keep reference to recreate or update
let qrCode: any = null;

// Offscreen canvas for rendering text as image
function createTextEmojiImage(text: string, size: number = 64, fontFamily: string = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif', weight: number = 700, hue: number = 0): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve('');

    const textLen = [...text].length;

    // Better dynamic scaling
    let fontSize = size * 0.8;
    ctx.font = `${weight} ${fontSize}px ${fontFamily}`;

    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;

    // Shrink if horizontal scale exceeds bounds
    if (textWidth > size * 0.9) {
      fontSize = Math.floor(fontSize * (size * 0.9 / textWidth));
      ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
    }

    // Apply hue rotate
    if (hue !== 0) {
      ctx.filter = `hue-rotate(${hue}deg)`;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic'; // Reliable for manual calculation
    ctx.fillStyle = '#000000';

    // Mathematically perfect centering using font metrics
    // Center point - (total height / 2) + ascent = top-aligned pos + ascent
    const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const yPos = (size / 2) + (actualHeight / 2) - metrics.actualBoundingBoxDescent;

    ctx.fillText(text, size / 2, yPos);

    resolve(canvas.toDataURL('image/png'));
  });
}

// Generate URL for image-mode emoji (Noto Emoji from CDN)
// using unicode hex point and apply hue rotation via canvas
async function createSvgEmojiImage(text: string, size: number = 64, hue: number = 0): Promise<string> {
  const codePoints = [...text]
    .map(c => c.codePointAt(0)?.toString(16).toLowerCase())
    .filter(cp => cp !== undefined && cp !== 'fe0f'); // Noto often omits FE0F for single chars but keep check

  if (codePoints.length === 0) return '';

  // Noto Emoji naming: emoji_u[cp1]_[cp2]...
  const hexName = codePoints.join('_');
  const url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u${hexName}.svg`;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const fallback = async () => {
      const fb = await createTextEmojiImage(text, size, undefined, undefined, hue);
      resolve(fb);
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return fallback();

      ctx.clearRect(0, 0, size, size);
      if (hue !== 0) {
        ctx.filter = `hue-rotate(${hue}deg)`;
      }
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      // Try fallback without FE0F first? 
      // Actually most modern combinations like 🧑‍💻 or 🐈‍⬛ are complex.
      // If perfectly matching SVG is not found, fallback to system font (Text Mode)
      fallback();
    };

    img.src = url;

    // Safety timeout for slow network
    setTimeout(() => {
      if (img.complete) return;
      img.src = '';
      fallback();
    }, 2500);
  });
}

export async function generateQR(state: AppState, container: HTMLElement) {
  // Build options for qr-code-styling

  let imageSource = '';
  // Set image if emoji is enabled
  if (state.emojiMode !== 'none' && state.emojiText) {
    if (state.emojiMode === 'text') {
      // 解像度をQRコードの出力サイズに比例させて設定 (高DPIにも耐えうる0.8倍サイズ)
      const renderRes = Math.max(64, Math.round(state.size * 0.8));
      imageSource = await createTextEmojiImage(state.emojiText, renderRes, state.emojiFont, state.emojiFontWeight, state.emojiHue);
    } else {
      // 解像度をQRコードの出力サイズに比例させて設定 (高DPIにも耐えうる0.8倍サイズ)
      const renderRes = Math.max(64, Math.round(state.size * 0.8));
      imageSource = await createSvgEmojiImage(state.emojiText, renderRes, state.emojiHue);
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
      imageSize: state.emojiSize,
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
}

export async function getRawBlob(ext: 'png' | 'svg'): Promise<Blob | null> {
  if (!qrCode) return null;
  return await qrCode.getRawData(ext);
}
