import { store, type AppState, type DotType, type EmojiMode, type ErrorCorrection } from './store';
import { initTheme } from './theme';
import { generateQR, downloadQR } from './qr-generator';
import { checkQRReadability, hexToRgb, getLuminance } from './color-contrast';
import { getShareUrl, loadFromUrl } from './share';
import { getHistory, saveToHistory, deleteHistoryItem, loadHistoryItem } from './history';
import { t } from './i18n';

let generateTimeout: number;
let currentSvgSource: string = '';
let isRendering = false;
let pendingRender = false;

let lastEmojiVal = '🌟';
let lastTextVal = 'QR';

function isEmojiString(str: string): boolean {
  return /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D]+$/u.test(str.trim());
}

function debounceRender(immediate = false) {
  clearTimeout(generateTimeout);
  if (immediate) {
    renderNow();
  } else {
    generateTimeout = window.setTimeout(renderNow, 60);
  }
}

// Elements
const el = {
  data: document.getElementById('input-data') as HTMLTextAreaElement,
  inputContainer: document.getElementById('input-container') as HTMLElement,
  btnInputClear: document.getElementById('btn-input-clear') as HTMLButtonElement,
  sampleIndicator: document.getElementById('sample-indicator') as HTMLElement | null,
  size: document.getElementById('input-size') as HTMLSelectElement,
  margin: document.getElementById('input-margin') as HTMLInputElement,
  ec: document.getElementById('input-ec') as HTMLSelectElement,
  style: document.getElementById('input-style') as HTMLSelectElement,
  fg: document.getElementById('input-fg') as HTMLInputElement,
  bg: document.getElementById('input-bg') as HTMLInputElement,
  bgColorItem: document.getElementById('bg-color-item') as HTMLElement | null,
  trans: document.getElementById('input-transparent') as HTMLInputElement,
  emojiMode: document.getElementById('input-emoji-mode') as HTMLSelectElement,
  emojiText: document.getElementById('input-emoji') as HTMLInputElement,
  emojiWrap: document.getElementById('emoji-input-wrap') as HTMLElement,

  preview: document.getElementById('qr-preview') as HTMLElement,
  alert: document.getElementById('readability-alert') as HTMLElement,
  alertText: document.getElementById('alert-text') as HTMLElement,
  alertIcon: document.getElementById('alert-icon') as HTMLElement,

  btnShare: document.getElementById('btn-share') as HTMLButtonElement,
  btnPng: document.getElementById('btn-dl-png') as HTMLButtonElement,
  btnSvg: document.getElementById('btn-dl-svg') as HTMLButtonElement,

  historyList: document.getElementById('history-list') as HTMLElement,
  historySec: document.getElementById('history-section') as HTMLElement,
  qrRadius: document.getElementById('input-qr-radius') as HTMLInputElement,
  valQrRadius: document.getElementById('val-qr-radius') as HTMLElement,
  labelMargin: document.getElementById('label-margin') as HTMLElement,

  emojiHue: document.getElementById('input-emoji-hue') as HTMLInputElement,
  emojiSize: document.getElementById('input-emoji-size') as HTMLInputElement,
  emojiFont: document.getElementById('input-emoji-font') as HTMLSelectElement,
  emojiWeight: document.getElementById('input-emoji-weight') as HTMLInputElement,
  emojiCommonControls: document.getElementById('emoji-common-controls') as HTMLElement,
  emojiHueWrap: document.getElementById('emoji-hue-wrap') as HTMLElement,
  emojiTextControls: document.getElementById('emoji-text-controls') as HTMLElement,
  emojiWarn: document.getElementById('emoji-warning') as HTMLElement,
  textWarn: document.getElementById('text-warning') as HTMLElement,
  valEmojiSize: document.getElementById('val-emoji-size') as HTMLElement,
  valEmojiHue: document.getElementById('val-emoji-hue') as HTMLElement,
  valEmojiWeight: document.getElementById('val-emoji-weight') as HTMLElement,
  emojiFontWrap: document.getElementById('emoji-font-wrap') as HTMLElement,
  emojiWeightWrap: document.getElementById('emoji-weight-wrap') as HTMLElement,
};

async function renderNow() {
  if (isRendering) {
    pendingRender = true;
    return;
  }
  isRendering = true;

  try {
    do {
      pendingRender = false;
      const state = store.state;

      if (state.transparentBg) {
        const fgRgb = hexToRgb(state.fgColor);
        const fgLum = fgRgb ? getLuminance(fgRgb.r, fgRgb.g, fgRgb.b) : 0;
        if (fgLum > 0.6) {
          el.preview.classList.remove('checker-pattern-bg');
          el.preview.classList.add('checker-dark');
        } else {
          el.preview.classList.remove('checker-dark');
          el.preview.classList.add('checker-pattern-bg');
        }
      } else {
        el.preview.classList.remove('checker-pattern-bg', 'checker-dark');
      }

      // 1. Generate QR Code
      currentSvgSource = (await generateQR(state, el.preview)) as string;

      // 2. Check Readability (pass state.emojiMode so text vs emoji warning message matches)
      const readability = checkQRReadability(
        state.fgColor,
        state.bgColor,
        state.transparentBg,
        state.dotStyle,
        state.emojiMode,
        state.errorCorrection,
        state.emojiSize,
        state.margin
      );

      el.alert.className = `contrast-banner ${readability.level}`;

      const msgMap: Record<string, string> = {
        ja: readability.messageJa,
        en: readability.messageEn,
        zh: readability.messageZh,
        es: readability.messageEs,
      };
      const msg = msgMap[state.language] || readability.messageEn;
      el.alertText.textContent = msg;

      if (el.alertIcon) {
        if (readability.level === 'safe') {
          el.alertIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        } else if (readability.level === 'warning') {
          el.alertIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`;
        } else {
          el.alertIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
        }
      }

      const hasUserInput = Boolean(el.data && el.data.value.length > 0);
      const containsMultibyte = /[^\x00-\x7F]+/.test(state.data);
      if (hasUserInput && containsMultibyte) {
        el.textWarn.classList.remove('hidden');
      } else {
        el.textWarn.classList.add('hidden');
      }

      const isEmoji = isEmojiString(state.emojiText);

      if (state.emojiMode === 'image') {
        el.emojiHueWrap?.classList.remove('hidden');
        el.emojiFontWrap?.classList.add('hidden');
        el.emojiWeightWrap?.classList.add('hidden');
      } else if (state.emojiMode === 'text') {
        el.emojiHueWrap?.classList.add('hidden');
        el.emojiFontWrap?.classList.remove('hidden');
        el.emojiWeightWrap?.classList.remove('hidden');
      }

      if (el.valQrRadius) el.valQrRadius.textContent = `${state.qrRadius}%`;
      if (el.labelMargin) el.labelMargin.textContent = `${state.margin}%`;
      if (el.valEmojiSize) el.valEmojiSize.textContent = `${Math.round(state.emojiSize * 100)}%`;
      if (el.valEmojiHue) el.valEmojiHue.textContent = `${state.emojiHue}°`;
      if (el.valEmojiWeight) el.valEmojiWeight.textContent = state.emojiFontWeight.toString();

      if (state.emojiMode === 'image') {
        if (!isEmoji && state.emojiText.length > 0) el.emojiWarn.classList.remove('hidden');
        else el.emojiWarn.classList.add('hidden');
      } else {
        el.emojiWarn.classList.add('hidden');
      }

      el.emojiText.maxLength = 50;
    } while (pendingRender);
  } finally {
    isRendering = false;
  }
}

function handleShare() {
  saveToHistory(store.state, currentSvgSource);
  const url = getShareUrl();

  // Always update browser address bar with the shareable URL so it can be bookmarked/verified directly
  try {
    window.history.replaceState({}, '', url);
  } catch {
    // Ignore history API errors in restricted contexts
  }

  copyToClipboard(url);
}

let toastEl: HTMLElement | null = null;
let toastTimer: number | undefined;
const CHECK_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
function showToast(msg: string, ok = true, ms = 4000) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = '';
  if (ok) toastEl.insertAdjacentHTML('beforeend', CHECK_ICON);
  toastEl.append(document.createTextNode(msg));
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl?.classList.remove('show'), ms);
}

function copyToClipboard(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    showToast(t('copiedMsg'));
  }).catch(() => {
    showToast(t('copyFailedMsg'), false, 6000);
  });
}

async function saveFile(ext: 'png' | 'svg') {
  try {
    saveToHistory(store.state, currentSvgSource);
    await downloadQR(store.state, ext);
    showToast(t('savedMsg') + ' (' + ext.toUpperCase() + ')');
  } catch {
    showToast(t('saveFailedMsg'), false, 6000);
  }
}

function autoResizeTextarea() {
  if (!el.data) return;
  el.data.style.height = 'auto';
  if (el.data.scrollHeight > 0 && el.data.value.length > 0) {
    el.data.style.height = `${el.data.scrollHeight}px`;
  }
}

function updateClearBtnVisibility() {
  const hasVal = Boolean(el.data && el.data.value.length > 0);
  if (el.btnInputClear) {
    if (hasVal) {
      el.btnInputClear.classList.remove('hidden');
    } else {
      el.btnInputClear.classList.add('hidden');
    }
  }
  if (el.sampleIndicator) {
    if (hasVal) {
      el.sampleIndicator.classList.add('hidden');
    } else {
      el.sampleIndicator.classList.remove('hidden');
    }
  }
}

function bindEvents() {
  // Input container click to focus
  el.inputContainer?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('#btn-input-clear')) return;
    el.data.focus();
  });

  // Text area
  el.data.addEventListener('input', (e) => {
    autoResizeTextarea();
    updateClearBtnVisibility();
    const val = (e.target as HTMLTextAreaElement).value;
    store.update({ data: val || 'https://qr.manpuc.me/' }, true);
    debounceRender();
  });

  // Inline clear button
  el.btnInputClear?.addEventListener('click', () => {
    el.data.value = '';
    autoResizeTextarea();
    updateClearBtnVisibility();
    store.update({ data: 'https://qr.manpuc.me/' }, true);
    debounceRender(true);
    el.data.focus();
  });

  // Radio buttons for dotStyle
  const dotRadios = document.querySelectorAll('input[name="dotStyle"]');
  dotRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        const style = target.value as DotType;
        el.style.value = style;
        store.update({ dotStyle: style });
      }
    });
  });

  // Radio buttons for emojiMode
  const emojiRadios = document.querySelectorAll('input[name="emojiMode"]');
  emojiRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        const mode = target.value as EmojiMode;
        el.emojiMode.value = mode;

        let nextEmojiText = store.state.emojiText;

        if (mode === 'none') {
          el.emojiWrap.classList.add('hidden');
          el.emojiCommonControls.classList.add('hidden');
          el.emojiTextControls.classList.add('hidden');
        } else if (mode === 'image') {
          if (!isEmojiString(nextEmojiText)) {
            nextEmojiText = lastEmojiVal || '🌟';
            el.emojiText.value = nextEmojiText;
          }
          el.emojiText.placeholder = '🌟';
          el.emojiWrap.classList.remove('hidden');
          el.emojiCommonControls.classList.remove('hidden');
          el.emojiTextControls.classList.add('hidden');
        } else {
          if (isEmojiString(nextEmojiText)) {
            nextEmojiText = lastTextVal || 'QR';
            el.emojiText.value = nextEmojiText;
          }
          el.emojiText.placeholder = 'QR';
          el.emojiWrap.classList.remove('hidden');
          el.emojiCommonControls.classList.remove('hidden');
          el.emojiTextControls.classList.remove('hidden');
        }

        const nextEc: ErrorCorrection = mode !== 'none' ? 'H' : store.state.errorCorrection;
        if (mode !== 'none') {
          el.ec.value = 'H';
        }
        store.update({ emojiMode: mode, emojiText: nextEmojiText, errorCorrection: nextEc });
      }
    });
  });

  el.size.addEventListener('change', (e) => {
    store.update({ size: parseInt((e.target as HTMLSelectElement).value) });
  });

  el.margin.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value) || 0;
    store.update({ margin: val }, true);
    debounceRender();
  });

  el.ec.addEventListener('change', (e) => {
    store.update({ errorCorrection: (e.target as HTMLSelectElement).value as ErrorCorrection });
  });

  // Colors
  el.fg.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    store.update({ fgColor: val }, true);
    debounceRender();
  });

  el.bg.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    store.update({ bgColor: val }, true);
    debounceRender();
  });

  el.trans.addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    el.bg.disabled = checked;
    el.bgColorItem?.classList.toggle('is-disabled', checked);
    store.update({ transparentBg: checked });
  });

  el.qrRadius.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value) || 0;
    store.update({ qrRadius: val }, true);
    debounceRender();
  });

  const handleEmojiInputChange = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    if (store.state.emojiMode === 'image' && isEmojiString(val)) {
      lastEmojiVal = val;
    } else if (store.state.emojiMode === 'text' && !isEmojiString(val) && val.trim().length > 0) {
      lastTextVal = val;
    }
    store.update({ emojiText: val }, true);
    debounceRender(true);
  };
  el.emojiText.addEventListener('input', handleEmojiInputChange);
  el.emojiText.addEventListener('change', handleEmojiInputChange);
  el.emojiText.addEventListener('compositionend', handleEmojiInputChange);

  el.emojiHue.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    store.update({ emojiHue: val }, true);
    debounceRender();
  });
  el.emojiSize.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    store.update({ emojiSize: val / 100 }, true);
    debounceRender();
  });
  el.emojiFont.addEventListener('change', (e) => {
    store.update({ emojiFont: (e.target as HTMLSelectElement).value }, true);
    debounceRender(true);
  });
  el.emojiWeight.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    store.update({ emojiFontWeight: val }, true);
    debounceRender();
  });

  // Sharing
  el.btnShare?.addEventListener('click', handleShare);

  el.btnPng.addEventListener('click', () => saveFile('png'));
  el.btnSvg.addEventListener('click', () => saveFile('svg'));

  document.getElementById('btn-reset-design')?.addEventListener('click', () => {
    store.resetDesign();
    showToast(t('resetDoneMsg'));
  });

  window.addEventListener('qr-history-updated', renderHistory);
}

function updateFormFromState() {
  const state = store.state;
  el.data.value = state.data === 'https://qr.manpuc.me/' ? '' : state.data;
  autoResizeTextarea();
  updateClearBtnVisibility();
  el.size.value = state.size.toString();
  el.margin.value = state.margin.toString();
  el.ec.value = state.errorCorrection;
  el.style.value = state.dotStyle;
  el.fg.value = state.fgColor;
  el.bg.value = state.bgColor;
  el.trans.checked = state.transparentBg;
  el.bg.disabled = state.transparentBg;
  el.bgColorItem?.classList.toggle('is-disabled', state.transparentBg);
  el.emojiMode.value = state.emojiMode;
  el.emojiText.value = state.emojiText;
  el.qrRadius.value = state.qrRadius.toString();

  el.emojiHue.value = state.emojiHue.toString();
  el.emojiSize.value = Math.round(state.emojiSize * 100).toString();
  el.emojiFont.value = state.emojiFont;
  el.emojiWeight.value = state.emojiFontWeight.toString();

  if (el.valQrRadius) el.valQrRadius.textContent = `${state.qrRadius}%`;
  if (el.labelMargin) el.labelMargin.textContent = `${state.margin}%`;

  // Sync radio buttons
  const dotRadio = document.querySelector(`input[name="dotStyle"][value="${state.dotStyle}"]`) as HTMLInputElement;
  if (dotRadio) dotRadio.checked = true;

  const emojiRadio = document.querySelector(`input[name="emojiMode"][value="${state.emojiMode}"]`) as HTMLInputElement;
  if (emojiRadio) emojiRadio.checked = true;

  if (state.emojiMode === 'image') {
    el.emojiWrap.classList.remove('hidden');
    el.emojiCommonControls.classList.remove('hidden');
    el.emojiTextControls.classList.add('hidden');
  } else if (state.emojiMode === 'text') {
    el.emojiWrap.classList.remove('hidden');
    el.emojiTextControls.classList.remove('hidden');
    el.emojiCommonControls.classList.remove('hidden');
  } else {
    el.emojiWrap.classList.add('hidden');
    el.emojiCommonControls.classList.add('hidden');
    el.emojiTextControls.classList.add('hidden');
  }
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return c;
    }
  });
}

function getHistoryPreviewSrc(svg: string): string {
  if (!svg) return '';
  const trimmed = svg.trim();
  if (trimmed.startsWith('data:image/svg+xml') || trimmed.startsWith('data:image/png')) {
    return trimmed;
  }
  if (trimmed.startsWith('<svg')) {
    let clean = trimmed;
    if (!clean.includes('xmlns=')) {
      clean = clean.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(clean);
  }
  return '';
}

function getDotStyleLabel(style: DotType | undefined, lang: string): string {
  const map: Record<string, Record<string, string>> = {
    ja: { square: '四角', dots: '丸', rounded: '角丸' },
    en: { square: 'Square', dots: 'Dots', rounded: 'Rounded' },
    zh: { square: '方形', dots: '圆点', rounded: '圆角' },
    es: { square: 'Cuadrado', dots: 'Puntos', rounded: 'Redondeado' },
  };
  const dict = map[lang] || map.en;
  return dict[style || 'rounded'] || (style || 'rounded');
}

function renderHistory() {
  const items = getHistory();
  if (items.length === 0) {
    if (el.historySec) el.historySec.style.display = 'none';
    return;
  }

  if (el.historySec) el.historySec.style.display = 'block';
  el.historyList.innerHTML = '';

  const lang = store.state.language;
  const isJa = lang === 'ja';
  const localeMap: Record<string, string> = {
    ja: 'ja-JP',
    en: 'en-US',
    zh: 'zh-CN',
    es: 'es-ES',
  };
  const dateLocale = localeMap[lang] || 'en-US';
  const reuseTitle = t('loadHistory') || (isJa ? '再利用' : 'Reuse');
  const deleteTitle = t('deleteLabel') || (isJa ? '削除' : 'Delete');

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';

    const date = new Date(item.date).toLocaleString(dateLocale, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const s = item.state;
    const dotLabel = getDotStyleLabel(s.dotStyle, lang);
    const centerBadge = s.emojiMode && s.emojiMode !== 'none' && s.emojiText ? ` · ${s.emojiText}` : '';
    const metaSummary = `${date} · ${s.size || 256}px · ${dotLabel} · ${s.errorCorrection || 'M'}${centerBadge}`;

    const displayData = s.data || 'https://qr.manpuc.me/';
    const previewSrc = getHistoryPreviewSrc(item.svg);

    div.innerHTML = `
      <div class="history-preview-mini"></div>
      <div class="history-item-content">
        <div class="history-item-date"></div>
        <div class="history-item-data"></div>
      </div>
      <div class="history-actions">
        <button type="button" class="history-icon-btn load-btn" data-id="${escapeHtml(item.id)}" title="${escapeHtml(reuseTitle)}" aria-label="${escapeHtml(reuseTitle)}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
        <button type="button" class="history-icon-btn history-item-delete" data-id="${escapeHtml(item.id)}" title="${escapeHtml(deleteTitle)}" aria-label="${escapeHtml(deleteTitle)}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>
    `;

    const previewContainer = div.querySelector('.history-preview-mini') as HTMLElement;
    if (previewSrc) {
      const img = document.createElement('img');
      img.src = previewSrc;
      img.alt = '';
      img.loading = 'lazy';
      previewContainer.appendChild(img);
    } else {
      previewContainer.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.25"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/></svg>';
    }

    const dateEl = div.querySelector('.history-item-date') as HTMLElement;
    if (dateEl) dateEl.textContent = metaSummary;

    const dataEl = div.querySelector('.history-item-data') as HTMLElement;
    if (dataEl) dataEl.textContent = displayData;

    div.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      if (target.closest('.history-item-delete')) {
        e.stopPropagation();
        deleteHistoryItem(item.id);
        return;
      }

      loadHistoryItem(item.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    el.historyList.appendChild(div);
  });
}

function initFabFooterAvoidance() {
  const fab = document.querySelector('.fab-row') as HTMLElement;
  const footer = document.querySelector('.site-footer') as HTMLElement;
  if (!fab || !footer) return;

  let ticking = false;
  const update = () => {
    if (window.matchMedia('(min-width: 520px)').matches) {
      fab.style.bottom = '';
      ticking = false;
      return;
    }

    const footerTop = footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    const baseOffset = 32; // 2rem = 32px

    const overlap = windowHeight - footerTop;
    if (overlap > 0) {
      fab.style.bottom = `${overlap + baseOffset}px`;
    } else {
      fab.style.bottom = `${baseOffset}px`;
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

// Bootstrap
store.load();
loadFromUrl();
initTheme();

updateFormFromState();
bindEvents();
renderNow();
renderHistory();
initFabFooterAvoidance();

store.subscribe(() => {
  updateFormFromState();
  debounceRender(true);
});
