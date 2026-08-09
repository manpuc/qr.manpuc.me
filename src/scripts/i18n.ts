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
  },
  zh: {
    appTitle: 'QR 生成器',
    dataLabel: '数据 (URL或文本)',
    sizeLabel: '输出大小 (px)',
    marginLabel: '边距 (px)',
    errorCorrectionLabel: '容错级别',
    styleLabel: '点样式',
    styleSquare: '方形',
    styleDots: '圆点',
    styleRounded: '圆角',
    fgColorLabel: '前景色',
    bgColorLabel: '背景色',
    transparentBgLabel: '透明背景 (PNG)',
    emojiModeLabel: '中心表情 (Noto)',
    emojiNone: '无',
    emojiText: '文本渲染',
    emojiImage: '图像渲染',
    emojiInputLabel: '表情输入',
    historyTitle: '历史记录',
    downloadPng: '保存 PNG',
    downloadSvg: '保存 SVG',
    shareLabel: '分享链接',
    deleteLabel: '删除',
    copiedMsg: '链接已复制',
    downloadTitle: '下载与分享',
    settingsTitle: '设计设置',
    previewTitle: '预览',
    applyBtn: '应用并生成',
    themeLight: '浅色模式',
    themeDark: '深色模式',
    themeAuto: '自动 (跟随系统)',
    loadHistory: '重用',
    qrRadiusLabel: 'QR背景圆角',
    emojiSizeLabel: '大小 (最大 50%)',
    emojiFontLabel: '字体',
    emojiWeightLabel: '粗细',
    emojiHueLabel: '色相',
    emojiWarning: '⚠ 检测到非表情字符。图像模式仅推荐使用单个表情。',
    aboutTitle: '关于 QR 生成器',
    aboutText: 'QR 生成器是一款免费的在线工具，可让您直接在浏览器中轻松创建时尚的二维码。无需注册，您的数据不会发送到服务器。这是一款注重隐私、支持离线使用的应用。',
    featuresTitle: '主要特点',
    featureEmoji: '表情嵌入：将您喜欢的表情放置在二维码中心。',
    featureDesign: '自定义设计：自由更改点样式（方形、圆点、圆角）和颜色。',
    featureExport: '高质量导出：支持 PNG 和可缩放的 SVG 格式。',
    featurePrivacy: '隐私优先：所有处理都在您的设备上本地完成。',
    tipsTitle: '使用技巧',
    tipsText: '为确保可读性，请保持前景色和背景色之间的高对比度。此工具包含实时可读性检查器，当您的设计可能难以扫描时会发出警告。',
  },
  es: {
    appTitle: 'QR Maker',
    dataLabel: 'Datos (URL o Texto)',
    sizeLabel: 'Tamaño (px)',
    marginLabel: 'Margen (px)',
    errorCorrectionLabel: 'Corrección de errores',
    styleLabel: 'Estilo de puntos',
    styleSquare: 'Cuadrado',
    styleDots: 'Puntos',
    styleRounded: 'Redondeado',
    fgColorLabel: 'Color de primer plano',
    bgColorLabel: 'Color de fondo',
    transparentBgLabel: 'Fondo transparente (PNG)',
    emojiModeLabel: 'Emoji central (Noto)',
    emojiNone: 'Ninguno',
    emojiText: 'Renderizado de texto',
    emojiImage: 'Renderizado de imagen',
    emojiInputLabel: 'Entrada de emoji',
    historyTitle: 'Historial',
    downloadPng: 'Guardar PNG',
    downloadSvg: 'Guardar SVG',
    shareLabel: 'Compartir URL',
    deleteLabel: 'Eliminar',
    copiedMsg: 'URL copiada',
    downloadTitle: 'Descargar y compartir',
    settingsTitle: 'Configuración de diseño',
    previewTitle: 'Vista previa',
    applyBtn: 'Aplicar y generar',
    themeLight: 'Modo claro',
    themeDark: 'Modo oscuro',
    themeAuto: 'Auto (predeterminado del SO)',
    loadHistory: 'Reutilizar',
    qrRadiusLabel: 'Radio de esquina QR',
    emojiSizeLabel: 'Tamaño (Máx 50%)',
    emojiFontLabel: 'Fuente',
    emojiWeightLabel: 'Grosor',
    emojiHueLabel: 'Tono',
    emojiWarning: '⚠ Se detectaron caracteres no emoji. Solo se recomienda un emoji único en modo imagen.',
    aboutTitle: 'Sobre QR Maker',
    aboutText: 'QR Maker es una herramienta web gratuita que te permite crear fácilmente códigos QR elegantes directamente en tu navegador. No requiere registro y tus datos nunca se envían a un servidor. Es una aplicación que prioriza la privacidad y funciona sin conexión.',
    featuresTitle: 'Características principales',
    featureEmoji: 'Integración de emoji: Coloca tu emoji favorito en el centro del código QR.',
    featureDesign: 'Diseño personalizado: Cambia estilos de puntos (cuadrado, puntos, redondeado) y colores libremente.',
    featureExport: 'Exportación de alta calidad: Compatible con formatos PNG y SVG escalable.',
    featurePrivacy: 'Privacidad primero: Todo el procesamiento se realiza localmente en tu dispositivo.',
    tipsTitle: 'Consejos',
    tipsText: 'Para garantizar la legibilidad, mantén un alto contraste entre los colores de primer plano y fondo. Esta herramienta incluye un verificador de legibilidad en tiempo real que te advertirá si tu diseño podría ser difícil de escanear.',
  }
};

export type LangKey = keyof typeof dictionaries;
export type DictKey = keyof typeof dictionaries['ja'];

export function t(key: DictKey) {
  const lang = store.state.language as LangKey;
  const dict = dictionaries[lang] || dictionaries['en'];
  return dict[key] || dictionaries['en'][key] || key;
}

// Function to update DOM nodes carrying data-i18n attribute
export function updateDOMTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n') as DictKey;
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
