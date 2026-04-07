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

export function saveToHistory(state: AppState, svg: string) {
  const current = getHistory();
  
  // Clone relevant state to save
  const stateToSave = {
    data: state.data,
    size: state.size,
    margin: state.margin,
    fgColor: state.fgColor,
    bgColor: state.bgColor,
    transparentBg: state.transparentBg,
    dotStyle: state.dotStyle,
    emojiMode: state.emojiMode,
    emojiText: state.emojiText,
    errorCorrection: state.errorCorrection,
    qrRadius: state.qrRadius
  };

  // Avoid saving exactly same state if it's the latest
  if (current.length > 0) {
    const last = current[0].state;
    if (JSON.stringify(last) === JSON.stringify(stateToSave)) {
      return; // Skip duplicate consecutive saves
    }
  }

  const newItem: HistoryItem = {
    id: Date.now().toString(),
    date: Date.now(),
    state: stateToSave,
    svg: svg
  };

  current.unshift(newItem);
  const trimmed = current.slice(0, MAX_HISTORY);

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
