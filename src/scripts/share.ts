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
    et: state.emojiText,
    ec: state.errorCorrection
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
        const newState: Partial<AppState> = {
          data: parsed.d,
          size: parsed.s,
          margin: parsed.m,
          fgColor: parsed.f,
          bgColor: parsed.b,
          transparentBg: parsed.t === 1,
          dotStyle: parsed.ds,
          emojiMode: parsed.em,
          emojiText: parsed.et,
          errorCorrection: parsed.ec,
        };
        store.update(newState);
        
        // Clean URL after loading to avoid sticking
        window.history.replaceState({}, '', url.pathname);
      }
    } catch (e) {
      console.error('Failed to parse share URL', e);
    }
  }
}
