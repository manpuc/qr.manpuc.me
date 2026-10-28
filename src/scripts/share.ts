import LZString from 'lz-string';
import { store, type AppState } from './store';

export function getShareUrl(): string {
  const state = store.state;
  const minimalState = {
    d: state.data,
    s: state.size,
    m: state.margin,
    f: state.fgColor,
    b: state.bgColor,
    t: state.transparentBg ? 1 : 0,
    ds: state.dotStyle,
    em: state.emojiMode,
    et: state.emojiText ? encodeURIComponent(state.emojiText) : "", // Prevent Unicode mangling
    ef: state.emojiFont,
    efw: state.emojiFontWeight,
    eh: state.emojiHue,
    es: state.emojiSize,
    ec: state.errorCorrection,
    qrRadius: state.qrRadius
  };

  const jsonStr = JSON.stringify(minimalState);
  const compressed = LZString.compressToEncodedURIComponent(jsonStr);
  const url = new URL(window.location.href);
  url.searchParams.set('q', compressed);
  return url.toString();
}

export function loadFromUrl() {
  const url = new URL(window.location.href);
  const q = url.searchParams.get('q');
  if (q) {
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(q);
      if (decompressed) {
        const parsed = JSON.parse(decompressed);
        if (!parsed || typeof parsed !== 'object') return;

        const newState: Partial<AppState> = {};

        if (typeof parsed.d === 'string') {
          newState.data = parsed.d.slice(0, 4096);
        }
        if (typeof parsed.s === 'number' && Number.isFinite(parsed.s) && parsed.s >= 64 && parsed.s <= 2048) {
          newState.size = Math.round(parsed.s);
        }
        if (typeof parsed.m === 'number' && Number.isFinite(parsed.m) && parsed.m >= 0 && parsed.m <= 25) {
          newState.margin = Math.round(parsed.m);
        }
        if (typeof parsed.f === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(parsed.f)) {
          newState.fgColor = parsed.f;
        }
        if (typeof parsed.b === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(parsed.b)) {
          newState.bgColor = parsed.b;
        }
        if (parsed.t === 1 || parsed.t === 0) {
          newState.transparentBg = parsed.t === 1;
        }
        if (['square', 'dots', 'rounded'].includes(parsed.ds)) {
          newState.dotStyle = parsed.ds;
        }
        if (['text', 'image', 'none'].includes(parsed.em)) {
          newState.emojiMode = parsed.em;
        }
        if (typeof parsed.et === 'string') {
          try {
            newState.emojiText = decodeURIComponent(parsed.et).slice(0, 50);
          } catch {
            newState.emojiText = parsed.et.slice(0, 50);
          }
        }
        if (typeof parsed.ef === 'string' && parsed.ef.length <= 100) {
          newState.emojiFont = parsed.ef;
        }
        if (typeof parsed.efw === 'number' && Number.isFinite(parsed.efw) && parsed.efw >= 100 && parsed.efw <= 900) {
          newState.emojiFontWeight = parsed.efw;
        }
        if (typeof parsed.eh === 'number' && Number.isFinite(parsed.eh) && parsed.eh >= 0 && parsed.eh <= 360) {
          newState.emojiHue = parsed.eh;
        }
        if (typeof parsed.es === 'number' && Number.isFinite(parsed.es) && parsed.es >= 0.1 && parsed.es <= 0.6) {
          newState.emojiSize = parsed.es;
        }
        if (['L', 'M', 'Q', 'H'].includes(parsed.ec)) {
          newState.errorCorrection = parsed.ec;
        }
        if (typeof parsed.qrRadius === 'number' && Number.isFinite(parsed.qrRadius) && parsed.qrRadius >= 0 && parsed.qrRadius <= 100) {
          newState.qrRadius = Math.round(parsed.qrRadius);
        }

        if (Object.keys(newState).length > 0) {
          store.update(newState);
        }

        // Clean URL after loading to avoid sticking
        window.history.replaceState({}, '', url.pathname);
      }
    } catch (e) {
      console.error('Failed to parse share URL', e);
    }
  }
}
