import qrCodeStylingModule from 'qr-code-styling';
import { type AppState, store } from './store';

// Handle Vite/CJS default export quirk
const QRCodeStyling = (qrCodeStylingModule as any).default || qrCodeStylingModule;

// Keep reference to latest instance
let qrCode: any = null;

// Offscreen canvas for rendering text as image
function createTextEmojiImage(
  text: string,
  size: number = 64,
  fontFamily: string = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  weight: number = 700,
  hue: number = 0,
  fillColor: string = '#000000'
): Promise<string> {
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
    ctx.fillStyle = fillColor || '#000000';

    // Mathematically perfect centering using font metrics with fallback
    const refreshedMetrics = ctx.measureText(text);
    const actualAscent = refreshedMetrics.actualBoundingBoxAscent ?? (fontSize * 0.8);
    const actualDescent = refreshedMetrics.actualBoundingBoxDescent ?? (fontSize * 0.2);
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
    .filter(cp => cp !== undefined && cp !== 'fe0f');

  if (codePoints.length === 0) return '';

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return createTextEmojiImage(text, size, undefined, undefined, hue);
  }

  // Noto Emoji naming: emoji_u[cp1]_[cp2]...
  const hexName = codePoints.join('_');
  const url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/v2.042/svg/emoji_u${hexName}.svg`;

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
      fallback();
    };

    img.src = url;

    // Safety timeout for slow network
    setTimeout(() => {
      if (img.complete) return;
      img.src = '';
      fallback();
    }, 1500);
  });
}

export async function generateQR(state: AppState, container: HTMLElement): Promise<string> {
  try {
    let imageSource = '';
    // Set image if emoji/text is enabled
    if (state.emojiMode !== 'none' && state.emojiText) {
      const renderRes = Math.max(64, Math.round(state.size * 0.8));
      if (state.emojiMode === 'text') {
        imageSource = await createTextEmojiImage(
          state.emojiText,
          renderRes,
          state.emojiFont,
          state.emojiFontWeight,
          state.emojiHue,
          state.fgColor
        );
      } else {
        imageSource = await createSvgEmojiImage(state.emojiText, renderRes, state.emojiHue);
      }
    }

    let typeNumber: 0 | undefined = 0; // auto
    const dotType = state.dotStyle === 'rounded' ? 'rounded' : (state.dotStyle === 'dots' ? 'dots' : 'square');
    const cornerSquareType = dotType === 'rounded' ? 'extra-rounded' : (dotType === 'dots' ? 'dot' : 'square');

    const options: any = {
      width: state.size,
      height: state.size,
      type: 'svg',
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
      options.image = imageSource;
    }

    // Always build in an offscreen staging container so image changes (e.g. 🌟 -> 🚀)
    // and SVG clip-path wrapping never collide with stale DOM nodes.
    const staging = document.createElement('div');
    const nextQr = new QRCodeStyling(options);
    nextQr.append(staging);
    if (nextQr._svgDrawingPromise) {
      await nextQr._svgDrawingPromise;
    }
    qrCode = nextQr;

    const svg = staging.querySelector('svg');
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

      container.replaceChildren(svg);
    }

    // Container border-radius reflects the corner radius on preview card boundary and shadow
    container.style.borderRadius = `${state.qrRadius * 0.5}%`;
    container.style.overflow = 'hidden';

    // Synchronously serialize SVG for history thumbnail - ensures xmlns for valid image decoding
    const renderedSvg = container.querySelector('svg');
    if (renderedSvg) {
      const svgStr = serializeSvg(renderedSvg, state.size);
      const fullSvgStr = '<?xml version="1.0" standalone="no"?>\r\n' + svgStr;
      const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fullSvgStr);
      // Pre-render PNG blob asynchronously so clicking "PNG 保存" downloads 100% synchronously
      svgToPngBlob(svgStr, state.size).then((blob) => {
        cachedPngBlob = blob;
      }).catch(() => {});
      return svgDataUri;
    }
    return '';
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
}

let cachedPngBlob: Blob | null = null;

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

export function svgToPngBlob(svgStr: string, size: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Canvas 2D context not available'));
      }
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/png');
    };
    img.onerror = (e) => {
      reject(e);
    };
    img.src = dataUri;
  });
}

export async function getRawBlob(ext: 'png' | 'svg'): Promise<Blob | null> {
  const preview = document.getElementById('qr-preview');
  const svg = preview?.querySelector('svg');

  if (svg) {
    const size = store.state.size || 256;
    const svgStr = serializeSvg(svg, size);

    if (ext === 'svg') {
      const fullSvgStr = '<?xml version="1.0" standalone="no"?>\r\n' + svgStr;
      return new Blob([fullSvgStr], { type: 'image/svg+xml;charset=utf-8' });
    } else {
      try {
        return await svgToPngBlob(svgStr, size);
      } catch (err) {
        console.warn('Canvas export failed, falling back to qrCode.getRawData:', err);
      }
    }
  }

  if (qrCode) {
    return await qrCode.getRawData(ext);
  }
  return null;
}

export function downloadBlob(blob: Blob, filename: string) {
  let file: File;
  try {
    file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
  } catch (e) {
    file = blob as any;
  }

  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.setAttribute('download', filename);
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);

  a.click();

  setTimeout(() => {
    if (a.parentNode) {
      a.parentNode.removeChild(a);
    }
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 120000);
  }, 500);
}

export async function downloadQR(state: AppState, ext: 'png' | 'svg', _sizeMultiplier: number = 1) {
  const filename = `qrmaker-${Date.now()}.${ext}`;

  if (ext === 'svg') {
    const preview = document.getElementById('qr-preview');
    const svg = preview?.querySelector('svg');
    if (svg) {
      const size = store.state.size || 256;
      const svgStr = serializeSvg(svg, size);
      const fullSvgStr = '<?xml version="1.0" standalone="no"?>\r\n' + svgStr;
      const blob = new Blob([fullSvgStr], { type: 'image/svg+xml;charset=utf-8' });
      downloadBlob(blob, filename);
      return;
    }
  } else {
    if (cachedPngBlob) {
      downloadBlob(cachedPngBlob, filename);
      return;
    }

    const preview = document.getElementById('qr-preview');
    const svg = preview?.querySelector('svg');
    if (svg) {
      const size = store.state.size || 256;
      const svgStr = serializeSvg(svg, size);
      try {
        const blob = await svgToPngBlob(svgStr, size);
        cachedPngBlob = blob;
        downloadBlob(blob, filename);
        return;
      } catch (err) {
        console.warn('PNG generation failed:', err);
      }
    }
  }

  const blob = await getRawBlob(ext);
  if (blob) {
    downloadBlob(blob, filename);
  }
}
