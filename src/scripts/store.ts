export type DotType = 'square' | 'dots' | 'rounded';
export type EmojiMode = 'text' | 'image' | 'none';
export type ErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface AppState {
  data: string;
  size: number;
  margin: number;
  fgColor: string;
  bgColor: string;
  transparentBg: boolean;
  dotStyle: DotType;
  emojiMode: EmojiMode;
  emojiText: string;
  emojiFont: string;
  emojiFontWeight: number;
  emojiHue: number;
  emojiSize: number;
  errorCorrection: ErrorCorrection;
  theme: 'light' | 'dark' | 'auto';
  language: 'ja' | 'en';
  qrRadius: number; // QRコード背景の角丸
}

const defaultState: AppState = {
  data: 'https://qr.manpuc.me/',
  size: 256,
  margin: 10,
  fgColor: '#000000',
  bgColor: '#ffffff',
  transparentBg: false,
  dotStyle: 'rounded',
  emojiMode: 'none',
  emojiText: '🌟',
  emojiFont: 'sans-serif',
  emojiFontWeight: 700,
  emojiHue: 0,
  emojiSize: 0.4,
  errorCorrection: 'M',
  theme: 'auto',
  language: 'ja',
  qrRadius: 12,
};

type Listener = (state: AppState) => void;

class Store {
  public state: AppState;
  private listeners: Listener[] = [];

  constructor() {
    this.state = { ...defaultState };
  }

  load() {
    try {
      const saved = localStorage.getItem('qr_maker_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      }

      const savedTheme = localStorage.getItem('qr_maker_theme') as 'light' | 'dark' | 'auto';
      if (savedTheme) {
        this.state.theme = savedTheme;
      }

      const savedLang = localStorage.getItem('qr_maker_lang') as 'ja' | 'en';
      if (savedLang) {
        this.state.language = savedLang;
      } else if (typeof navigator !== 'undefined') {
        const isJa = navigator.language.startsWith('ja');
        this.state.language = isJa ? 'ja' : 'en';
      }
    } catch (e) {
      console.error('Failed to load state', e);
    }
  }

  save() {
    try {
      localStorage.setItem('qr_maker_state_v1', JSON.stringify({
        data: this.state.data,
        size: this.state.size,
        margin: this.state.margin,
        fgColor: this.state.fgColor,
        bgColor: this.state.bgColor,
        transparentBg: this.state.transparentBg,
        dotStyle: this.state.dotStyle,
        emojiMode: this.state.emojiMode,
        emojiText: this.state.emojiText,
        emojiFont: this.state.emojiFont,
        emojiFontWeight: this.state.emojiFontWeight,
        emojiHue: this.state.emojiHue,
        emojiSize: this.state.emojiSize,
        errorCorrection: this.state.errorCorrection,
        qrRadius: this.state.qrRadius,
      }));
      localStorage.setItem('qr_maker_theme', this.state.theme);
      localStorage.setItem('qr_maker_lang', this.state.language);
    } catch (e) {
      console.error('Failed to save state', e);
    }
  }

  update(partial: Partial<AppState>, noNotify = false) {
    this.state = { ...this.state, ...partial };
    this.save();
    if (!noNotify) {
      this.notify();
    }
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l(this.state));
  }
}

export const store = new Store();
