// WCAG 2.0 relative luminance
// https://www.w3.org/TR/WCAG20/#relativeluminancedef
function getLuminance(r: number, g: number, b: number) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Convert HEX to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// WCAG contrast ratio
function getContrastRatio(fgHex: string, bgHex: string) {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return 1;
  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// W3C AERT Brightness & Color Difference
function getBrightnessAndColorDiff(fgHex: string, bgHex: string) {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return { brightnessDiff: 0, colorDiff: 0 };

  const br1 = (fg.r * 299 + fg.g * 587 + fg.b * 114) / 1000;
  const br2 = (bg.r * 299 + bg.g * 587 + bg.b * 114) / 1000;
  const brightnessDiff = Math.abs(br1 - br2);

  const colorDiff = (Math.max(fg.r, bg.r) - Math.min(fg.r, bg.r)) +
                    (Math.max(fg.g, bg.g) - Math.min(fg.g, bg.g)) +
                    (Math.max(fg.b, bg.b) - Math.min(fg.b, bg.b));

  return { brightnessDiff, colorDiff };
}

export type ReadabilityLevel = 'safe' | 'warning' | 'danger';

export interface ReadabilityResult {
  level: ReadabilityLevel;
  ratio: number;
  messageJa: string;
  messageEn: string;
}

/**
 * QRコード特化の可読性判定ロジック
 * WCAG基準をベースに、明度差・彩度差などのQR固有の条件を加味
 */
export function checkQRReadability(
  fgHex: string, 
  bgHex: string, 
  isTransparentBg: boolean,
  dotStyle: string,
  hasEmoji: boolean,
  errorCorrection: string
): ReadabilityResult {
  // 基本指標
  let ratio = getContrastRatio(fgHex, bgHex);
  const { brightnessDiff, colorDiff } = getBrightnessAndColorDiff(fgHex, bgHex);
  
  let effectiveRatio = ratio;

  // 背景透過の場合のペナルティ
  if (isTransparentBg) {
    effectiveRatio *= 0.7; 
  }

  // QRコードの反転(明るい前景色・暗い背景色)チェック
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  const isReverted = (fg && bg) ? getLuminance(fg.r, fg.g, fg.b) > getLuminance(bg.r, bg.g, bg.b) : false;

  const messagesJa: string[] = [];
  const messagesEn: string[] = [];
  const suggestionsJa: string[] = [];
  const suggestionsEn: string[] = [];

  if (isReverted) {
    messagesJa.push('色が反転しています。');
    messagesEn.push('Colors are inverted.');
    suggestionsJa.push('前景を暗く、背景を明るくしてください。');
    suggestionsEn.push('Make foreground darker and background lighter.');
    effectiveRatio *= 0.8;
  }

  // 明度差・彩度差チェック
  if (brightnessDiff < 125) {
    suggestionsJa.push('明度差が不足しています（暗い色同士、または明るい色同士など）。');
    suggestionsEn.push('Lack of brightness difference (colors are too similar in lightness).');
    effectiveRatio *= 0.9;
  }
  if (colorDiff < 500) {
    suggestionsJa.push('彩度・色相の差が不足しています。');
    suggestionsEn.push('Lack of color difference.');
    effectiveRatio *= 0.9;
  }

  // 絵文字と誤り訂正の関係
  if (hasEmoji && errorCorrection !== 'H') {
    messagesJa.push('画像埋め込み時は誤り訂正を「H」にすることを推奨します。');
    messagesEn.push('Error correction level "H" is recommended when embedding images.');
  }

  // 丸ドットでの読み取りにくさ加味
  if (dotStyle === 'rounded' || dotStyle === 'dots') {
    effectiveRatio *= 0.95;
  }

  // 総合判定
  let level: ReadabilityLevel = 'safe';
  
  if (effectiveRatio < 3.0 || brightnessDiff < 100) {
    level = 'danger';
    messagesJa.unshift('コントラストや明度差が低すぎます！読み取れない可能性が高いです。');
    messagesEn.unshift('Contrast or brightness diff is too low! Unreadable.');
  } else if (effectiveRatio < 4.5 || isReverted || brightnessDiff < 125 || colorDiff < 500) {
    level = 'warning';
    messagesJa.unshift('読み取りづらい可能性があります。');
    messagesEn.unshift('Might be hard to read.');
  } else {
    messagesJa.unshift('読み取りやすい配色です。');
    messagesEn.unshift('Safe to read.');
  }

  // 改善案を結合
  if (suggestionsJa.length > 0 && level !== 'safe') {
    messagesJa.push('💡改善案: ' + suggestionsJa.join(' / '));
    messagesEn.push('💡Tip: ' + suggestionsEn.join(' / '));
  }

  return {
    level,
    ratio,
    messageJa: messagesJa.join(' '),
    messageEn: messagesEn.join(' ')
  };
}
