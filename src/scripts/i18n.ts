import { store } from './store';

export const dictionaries = {
  ja: {
    appTitle: 'QRメーカー',
    dataLabel: 'データ (URLやテキスト)',
    sizeLabel: '出力サイズ (px)',
    marginLabel: '余白設定 (px)',
    errorCorrectionLabel: '誤り訂正レベル',
    styleLabel: 'ドットスタイル',
    styleSquare: '四角',
    styleDots: '丸',
    styleRounded: '角丸',
    fgColorLabel: '前景色 (QRコードの色)',
    bgColorLabel: '背景色',
    transparentBgLabel: '背景を透過する (PNG保存用)',
    emojiModeLabel: '中央絵文字 (Noto Emoji)',
    emojiNone: 'なし',
    emojiText: 'テキスト描画方式',
    emojiImage: '画像化方式',
    emojiInputLabel: '絵文字入力',
    historyTitle: '作成履歴',
    downloadPng: 'PNG 保存',
    downloadSvg: 'SVG 保存',
    shareLabel: '共有 URL',
    deleteLabel: '削除',
    copiedMsg: 'URLをコピーしました',
    downloadTitle: 'ダウンロード & 共有',
    settingsTitle: 'デザイン設定',
    previewTitle: 'プレビュー',
    applyBtn: '適用して生成',
    themeLight: 'ライトモード',
    themeDark: 'ダークモード',
    themeAuto: '自動 (OSに従う)',
    loadHistory: '再利用',
    qrRadiusLabel: 'QR全体の角丸',
  },
  en: {
    appTitle: 'QR Maker',
    dataLabel: 'Data (URL or Text)',
    sizeLabel: 'Output Size (px)',
    marginLabel: 'Margin (px)',
    errorCorrectionLabel: 'Error Correction',
    styleLabel: 'Dot Style',
    styleSquare: 'Square',
    styleDots: 'Dots',
    styleRounded: 'Rounded',
    fgColorLabel: 'Foreground Color',
    bgColorLabel: 'Background Color',
    transparentBgLabel: 'Transparent Background (PNG)',
    emojiModeLabel: 'Center Emoji (Noto)',
    emojiNone: 'None',
    emojiText: 'Text Render',
    emojiImage: 'Image Render',
    emojiInputLabel: 'Emoji Input',
    historyTitle: 'History',
    downloadPng: 'Save PNG',
    downloadSvg: 'Save SVG',
    shareLabel: 'Share URL',
    deleteLabel: 'Delete',
    copiedMsg: 'URL Copied',
    downloadTitle: 'Download & Share',
    settingsTitle: 'Design Settings',
    previewTitle: 'Preview',
    applyBtn: 'Apply & Generate',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    themeAuto: 'Auto (OS Default)',
    loadHistory: 'Reuse',
    qrRadiusLabel: 'QR Background Radius',
  }
};

export function t(key: keyof typeof dictionaries['ja']) {
  const lang = store.state.language;
  return dictionaries[lang][key] || dictionaries['en'][key] || key;
}

// Function to update DOM nodes carrying data-i18n attribute
export function updateDOMTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n') as keyof typeof dictionaries['ja'];
    if (key) {
      el.textContent = t(key);
    }
  });

  const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
  placeholders.forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder') as keyof typeof dictionaries['ja'];
    if (key) {
      (el as HTMLInputElement).placeholder = t(key);
    }
  });

  const ariaLabels = document.querySelectorAll('[data-i18n-aria-label]');
  ariaLabels.forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label') as keyof typeof dictionaries['ja'];
    if (key) {
      el.setAttribute('aria-label', t(key));
    }
  });
}

// Subscribe to language changes
store.subscribe(() => {
  updateDOMTranslations();
  document.documentElement.lang = store.state.language;
});
