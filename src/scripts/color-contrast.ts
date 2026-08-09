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
  messageZh: string;
  messageEs: string;
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
  errorCorrection: string,
  emojiSize: number = 0.4,
  margin: number = 10
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
  const messagesZh: string[] = [];
  const messagesEs: string[] = [];

  const suggestionsJa: string[] = [];
  const suggestionsEn: string[] = [];
  const suggestionsZh: string[] = [];
  const suggestionsEs: string[] = [];

  if (isReverted) {
    messagesJa.push('色が反転しています。');
    messagesEn.push('Colors are inverted.');
    messagesZh.push('颜色已反转。');
    messagesEs.push('Los colores están invertidos.');

    suggestionsJa.push('前景色を暗く、背景色を明るくしてください。');
    suggestionsEn.push('Use dark QR on light background.');
    suggestionsZh.push('前景色宜深，背景色宜浅。');
    suggestionsEs.push('Usa un QR oscuro en fondo claro.');
    effectiveRatio *= 0.8;
  }

  // 明度差・彩度差チェック
  if (brightnessDiff < 125) {
    suggestionsJa.push('明暗差を広げてください。');
    suggestionsEn.push('Increase brightness contrast.');
    suggestionsZh.push('请加大颜色明暗差。');
    suggestionsEs.push('Aumenta la diferencia de brillo.');
    effectiveRatio *= 0.9;
  }
  if (colorDiff < 500) {
    suggestionsJa.push('色相の差を広げてください。');
    suggestionsEn.push('Use more distinct hues.');
    suggestionsZh.push('请加大色相差异。');
    suggestionsEs.push('Usa tonos más distintos.');
    effectiveRatio *= 0.9;
  }

  // 余白枠チェック (ISO規格では4モジュール以上のQuiet Zoneが必要)
  if (margin === 0) {
    suggestionsJa.push('余白枠が0です (4px以上を推奨)。');
    suggestionsEn.push('Margin is 0 (4px+ recommended).');
    suggestionsZh.push('边距为0 (建议4px以上)。');
    suggestionsEs.push('El margen es 0 (se recomienda 4px+).');
  }

  // 絵文字と誤り訂正能力の検証
  let emojiCapacityExceeded = false;
  let emojiCapacityDanger = false;
  if (hasEmoji) {
    const ecCapacities: Record<string, number> = { L: 0.07, M: 0.15, Q: 0.25, H: 0.30 };
    const maxCapacity = ecCapacities[errorCorrection] || 0.15;
    const areaCovered = emojiSize * emojiSize;

    if (areaCovered > maxCapacity) {
      emojiCapacityExceeded = true;
      if (areaCovered > maxCapacity + 0.02) {
        emojiCapacityDanger = true;
      }
      messagesJa.push(`絵文字サイズ(${Math.round(areaCovered * 100)}%)が誤り訂正能力(${Math.round(maxCapacity * 100)}%)を超過。`);
      messagesEn.push(`Emoji size (${Math.round(areaCovered * 100)}%) exceeds EC capacity (${Math.round(maxCapacity * 100)}%).`);
      messagesZh.push(`表情尺寸 (${Math.round(areaCovered * 100)}%) 超过容错上限 (${Math.round(maxCapacity * 100)}%)。`);
      messagesEs.push(`El tamaño del emoji (${Math.round(areaCovered * 100)}%) supera la capacidad CE (${Math.round(maxCapacity * 100)}%).`);

      suggestionsJa.push('誤り訂正「H」を選択するか絵文字を小さくしてください。');
      suggestionsEn.push('Set Error Correction to "H" or shrink emoji.');
      suggestionsZh.push('请将容错设为“H”或缩小表情。');
      suggestionsEs.push('Ajusta la corrección de errores a "H" o reduce el emoji.');
    } else if (errorCorrection !== 'H') {
      messagesJa.push('誤り訂正「H」を推奨。');
      messagesEn.push('Level "H" recommended.');
      messagesZh.push('建议容错级别设为“H”。');
      messagesEs.push('Se recomienda el nivel "H".');
    }
  }

  // 丸ドットでの読み取りにくさ加味
  if (dotStyle === 'rounded' || dotStyle === 'dots') {
    effectiveRatio *= 0.95;
  }

  // 総合判定
  let level: ReadabilityLevel = 'safe';

  if (emojiCapacityDanger || effectiveRatio < 3.0 || brightnessDiff < 100) {
    level = 'danger';
    messagesJa.unshift('読み取れない可能性が非常に高い状態です。');
    messagesEn.unshift('High risk of unreadable QR code.');
    messagesZh.unshift('极可能无法识别。');
    messagesEs.unshift('Alto riesgo de QR ilegible.');
  } else if (emojiCapacityExceeded || effectiveRatio < 4.5 || isReverted || brightnessDiff < 125 || colorDiff < 500) {
    level = 'warning';
    messagesJa.unshift('読み取りづらい可能性があります。');
    messagesEn.unshift('Might be hard to scan.');
    messagesZh.unshift('可能难以识别。');
    messagesEs.unshift('Puede ser difícil de leer.');
  } else {
    messagesJa.unshift('読み取りやすい構成です。');
    messagesEn.unshift('Safe to scan.');
    messagesZh.unshift('易于识别。');
    messagesEs.unshift('Fácil de leer.');
  }

  // 改善案を結合
  if (suggestionsJa.length > 0 && level !== 'safe') {
    messagesJa.push('ヒント: ' + suggestionsJa.join(' / '));
    messagesEn.push('Tip: ' + suggestionsEn.join(' / '));
    messagesZh.push('提示: ' + suggestionsZh.join(' / '));
    messagesEs.push('Consejo: ' + suggestionsEs.join(' / '));
  }

  return {
    level,
    ratio,
    messageJa: messagesJa.join('\n'),
    messageEn: messagesEn.join('\n'),
    messageZh: messagesZh.join('\n'),
    messageEs: messagesEs.join('\n'),
  };
}
