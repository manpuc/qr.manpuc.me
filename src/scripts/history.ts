import { type AppState, store } from './store';

export interface HistoryItem {
  id: string; // timestamp based
  date: number;
  state: Partial<AppState>; // The configuration used to create it
  svg: string; // Serialized SVG representation
}

const HISTORY_KEY = 'qr_maker_history_v1';
const MAX_HISTORY = 30;

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse history', e);
  }
  return [];
}

function getVisualFingerprint(s: Partial<AppState>): string {
  return JSON.stringify({
    data: s.data,
    margin: s.margin,
    fgColor: s.fgColor,
    bgColor: s.bgColor,
    transparentBg: s.transparentBg,
    dotStyle: s.dotStyle,
    emojiMode: s.emojiMode,
    emojiText: s.emojiMode && s.emojiMode !== 'none' ? s.emojiText : '',
    emojiFont: s.emojiMode === 'text' ? s.emojiFont : '',
    emojiFontWeight: s.emojiMode === 'text' ? s.emojiFontWeight : 0,
    emojiHue: s.emojiMode && s.emojiMode !== 'none' ? s.emojiHue : 0,
    emojiSize: s.emojiMode && s.emojiMode !== 'none' ? s.emojiSize : 0,
    errorCorrection: s.errorCorrection,
    qrRadius: s.qrRadius,
  });
}

export function saveToHistory(state: AppState, svg: string) {
  const current = getHistory();

  // Clone relevant state to save
  const stateToSave: Partial<AppState> = {
    data: state.data,
    size: state.size,
    margin: state.margin,
    fgColor: state.fgColor,
    bgColor: state.bgColor,
    transparentBg: state.transparentBg,
    dotStyle: state.dotStyle,
    emojiMode: state.emojiMode,
    emojiText: state.emojiText,
    emojiFont: state.emojiFont,
    emojiFontWeight: state.emojiFontWeight,
    emojiHue: state.emojiHue,
    emojiSize: state.emojiSize,
    errorCorrection: state.errorCorrection,
    qrRadius: state.qrRadius
  };

  const targetFp = getVisualFingerprint(stateToSave);

  // Deduplicate across all existing history items with the same visual fingerprint
  const deduplicated = current.filter(item => getVisualFingerprint(item.state) !== targetFp);

  const newItem: HistoryItem = {
    id: Date.now().toString(),
    date: Date.now(),
    state: stateToSave,
    svg: svg
  };

  deduplicated.unshift(newItem);
  const trimmed = deduplicated.slice(0, MAX_HISTORY);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));

  // Dispatch custom event to let UI update
  window.dispatchEvent(new Event('qr-history-updated'));
}

export function deleteHistoryItem(id: string) {
  const current = getHistory();
  const filtered = current.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('qr-history-updated'));
}

export function loadHistoryItem(id: string) {
  const current = getHistory();
  const item = current.find(i => i.id === id);
  if (item) {
    store.update(item.state);
  }
}
