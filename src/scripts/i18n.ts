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
    emojiSizeLabel: 'サイズ (Max 50%)',
    emojiFontLabel: 'フォント',
    emojiWeightLabel: '太さ',
    emojiHueLabel: '色相 (Hue)',
    emojiWarning: '⚠ 絵文字以外が入力されています。画像化方式では1文字の絵文字のみ推奨されます。',
    aboutTitle: 'QRメーカーについて',
    aboutText: 'QRメーカーは、デザイン性に優れたQRコードをブラウザ上で簡単に作成できる無料ツールです。登録不要で、作成したデータがサーバーに送信されることはありません。完全にプライバシーに配慮したオフライン対応の設計となっています。',
    featuresTitle: '主な特徴',
    featureEmoji: '絵文字埋め込み: QRコードの中央にお好みの絵文字を配置できます。',
    featureDesign: '自由なデザイン: ドットの形状（四角、丸、角丸）や色を自由に変更可能。',
    featureExport: '高品質書き出し: PNG形式だけでなく、拡大してもボケないSVG形式に対応。',
    featurePrivacy: 'プライバシー保護: データの入出力はすべてお使いのデバイス上で行われます。',
    tipsTitle: '作成のヒント',
    tipsText: 'QRコードの読み取り精度を保つため、前景色と背景色のコントラストを十分に確保することをお勧めします。本ツールには自動読み取りチェック機能が搭載されており、デザインが読み取りにくい場合は警告が表示されます。',
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
    emojiSizeLabel: 'Size (Max 50%)',
    emojiFontLabel: 'Font',
    emojiWeightLabel: 'Weight',
    emojiHueLabel: 'Hue',
    emojiWarning: '⚠ Non-emoji characters detected. Only single emoji is recommended for Image mode.',
    aboutTitle: 'About QR Maker',
    aboutText: 'QR Maker is a free web tool that allows you to easily create stylish QR codes directly in your browser. No registration is required, and your data is never sent to a server. It is a privacy-first, offline-capable application.',
    featuresTitle: 'Key Features',
    featureEmoji: 'Emoji Integration: Place your favorite emoji in the center of the QR code.',
    featureDesign: 'Custom Design: Change dot styles (square, dots, rounded) and colors freely.',
    featureExport: 'High-Quality Export: Supports both PNG and scalable SVG formats.',
    featurePrivacy: 'Privacy First: All processing happens locally on your device.',
    tipsTitle: 'Pro Tips',
    tipsText: 'To ensure readability, maintain high contrast between the foreground and background colors. This tool includes a real-time readability checker to warn you if your design might be hard to scan.',
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
});
