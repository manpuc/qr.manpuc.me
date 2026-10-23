import qrCodeStylingModule from 'qr-code-styling';
import { type AppState, store } from './store';

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

    // Mathematically perfect centering using font metrics with fallback
    const actualAscent = metrics.actualBoundingBoxAscent ?? (fontSize * 0.8);
    const actualDescent = metrics.actualBoundingBoxDescent ?? (fontSize * 0.2);
    const actualHeight = actualAscent + actualDescent;
    const yPos = (size / 2) + (actualHeight / 2) - actualDescent;

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

function applyCornerRadiusToSvg(container: HTMLElement, qrRadius: number) {
  const svg = container.querySelector('svg');
  if (!svg) return;
  const bgRect = svg.querySelector('rect');
  if (bgRect) {
    if (qrRadius > 0) {
      bgRect.setAttribute('rx', qrRadius.toString());
      bgRect.setAttribute('ry', qrRadius.toString());
    } else {
      bgRect.removeAttribute('rx');
      bgRect.removeAttribute('ry');
    }
  }
}

export async function generateQR(state: AppState, container: HTMLElement): Promise<string> {
  try {
    let imageSource = '';
    // Set image if emoji is enabled
    if (state.emojiMode !== 'none' && state.emojiText) {
      if (state.emojiMode === 'text') {
        const renderRes = Math.max(64, Math.round(state.size * 0.8));
        imageSource = await createTextEmojiImage(state.emojiText, renderRes, state.emojiFont, state.emojiFontWeight, state.emojiHue);
      } else {
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
      margin: Math.round(state.size * (state.margin / 100)),
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
        round: state.transparentBg ? 0 : (state.qrRadius / 100),
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
    }

    // Re-create QRCodeStyling if mode transitioned between having an image and not having an image
    const hasImage = Boolean(imageSource);
    const wasWithImage = qrCode && qrCode._options && Boolean(qrCode._options.image);
    const needsRecreate = !qrCode || (wasWithImage !== hasImage);

    if (needsRecreate) {
      qrCode = new QRCodeStyling(options);
      container.innerHTML = '';
      qrCode.append(container);
    } else {
      qrCode.update(options);
    }

    // Await async drawing promise from qr-code-styling if present
    if (qrCode._svgDrawingPromise) {
      await qrCode._svgDrawingPromise;
    }

    // Fix SVG scaling: Add viewBox so SVG always scales 100% sharply without jumping or squishing
    const svg = container.querySelector('svg');
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${state.size} ${state.size}`);
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.display = 'block';

      // Remove any erroneous root clip-path on <svg> itself
      svg.removeAttribute('clip-path');

      // When corner radius > 0, clip internal graphics cleanly inside SVG viewBox space
      if (state.qrRadius > 0) {
        const radiusPx = (state.size / 2) * (state.qrRadius / 100);
        const clipId = 'qr-frame-clip-' + Math.random().toString(36).slice(2, 8);
        const defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), svg.firstChild);
        
        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', clipId);
        const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        clipRect.setAttribute('x', '0');
        clipRect.setAttribute('y', '0');
        clipRect.setAttribute('width', state.size.toString());
        clipRect.setAttribute('height', state.size.toString());
        clipRect.setAttribute('rx', radiusPx.toString());
        clipRect.setAttribute('ry', radiusPx.toString());
        clipPath.appendChild(clipRect);
        defs.appendChild(clipPath);

        // Group all visual children in an inner <g clip-path="..."> so coordinates match SVG viewBox
        const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        contentGroup.setAttribute('clip-path', `url(#${clipId})`);
        const children = Array.from(svg.childNodes);
        for (const child of children) {
          if (child !== defs && child !== contentGroup) {
            contentGroup.appendChild(child);
          }
        }
        svg.appendChild(contentGroup);
      }
    }

    // Container border-radius reflects the corner radius on preview card boundary and shadow
    container.style.borderRadius = `${state.qrRadius * 0.5}%`;
    container.style.overflow = 'hidden';

    // Synchronously serialize SVG for history thumbnail - ensures xmlns for valid image decoding
    if (svg) {
      let svgStr = serializeSvg(svg, state.size);
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    }
    return '';
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
}

export function serializeSvg(svg: SVGSVGElement, size: number): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width', size.toString());
  clone.setAttribute('height', size.toString());
  clone.setAttribute('viewBox', `0 0 ${size} ${size}`);
  clone.style.width = `${size}px`;
  clone.style.height = `${size}px`;
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  return new XMLSerializer().serializeToString(clone);
}

export async function svgToPngBlob(svgStr: string, size: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Canvas 2D context not available'));
      }
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/png');
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export async function getRawBlob(ext: 'png' | 'svg'): Promise<Blob | null> {
  const preview = document.getElementById('qr-preview');
  if (!preview) return null;
  const svg = preview.querySelector('svg');
  if (!svg) return null;

  const size = store.state.size;
  const svgStr = serializeSvg(svg, size);

  if (ext === 'svg') {
    return new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  } else {
    try {
      return await svgToPngBlob(svgStr, size);
    } catch (err) {
      console.error('Failed to export PNG from SVG:', err);
      if (qrCode) return await qrCode.getRawData('png');
      return null;
    }
  }
}

export async function downloadQR(state: AppState, ext: 'png' | 'svg', _sizeMultiplier: number = 1) {
  const blob = await getRawBlob(ext);
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `qrmaker-${Date.now()}.${ext}`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}
