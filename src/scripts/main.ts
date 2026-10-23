import { store, type AppState, type DotType, type EmojiMode, type ErrorCorrection } from './store';
import { initTheme } from './theme';
import { generateQR, downloadQR, getRawBlob } from './qr-generator';
import { checkQRReadability, hexToRgb, getLuminance } from './color-contrast';
import { getShareUrl, loadFromUrl } from './share';
import { getHistory, saveToHistory, deleteHistoryItem, loadHistoryItem } from './history';
import { t } from './i18n';

let generateTimeout: number;
let currentSvgSource: string = '';
let isRendering = false;
let pendingRender = false;

function debounceRender(immediate = false) {
  clearTimeout(generateTimeout);
  if (immediate) {
    renderNow();
  } else {
    generateTimeout = window.setTimeout(renderNow, 80);
  }
}

// Elements
const el = {
  data: document.getElementById('input-data') as HTMLTextAreaElement,
  size: document.getElementById('input-size') as HTMLSelectElement,
  margin: document.getElementById('input-margin') as HTMLInputElement,
  ec: document.getElementById('input-ec') as HTMLSelectElement,
  style: document.getElementById('input-style') as HTMLSelectElement,
  fg: document.getElementById('input-fg') as HTMLInputElement,
  fgText: document.getElementById('input-fg-text') as HTMLInputElement,
  bg: document.getElementById('input-bg') as HTMLInputElement,
  bgText: document.getElementById('input-bg-text') as HTMLInputElement,
  trans: document.getElementById('input-transparent') as HTMLInputElement,
  emojiMode: document.getElementById('input-emoji-mode') as HTMLSelectElement,
  emojiText: document.getElementById('input-emoji') as HTMLInputElement,
  emojiWrap: document.getElementById('emoji-input-wrap') as HTMLElement,

  preview: document.getElementById('qr-preview') as HTMLElement,
  alert: document.getElementById('readability-alert') as HTMLElement,
  alertText: document.getElementById('alert-text') as HTMLElement,
  alertIcon: document.getElementById('alert-icon') as HTMLElement,

  btnShare: document.getElementById('btn-share') as HTMLButtonElement,
  btnClear: document.getElementById('btn-clear') as HTMLButtonElement,
  btnPng: document.getElementById('btn-dl-png') as HTMLButtonElement,
  btnSvg: document.getElementById('btn-dl-svg') as HTMLButtonElement,

  historyList: document.getElementById('history-list') as HTMLElement,
  historySec: document.getElementById('history-section') as HTMLElement,
  qrRadius: document.getElementById('input-qr-radius') as HTMLInputElement,
  valQrRadius: document.getElementById('val-qr-radius') as HTMLElement,
  labelMargin: document.getElementById('label-margin') as HTMLElement,
  labelSize: document.getElementById('label-size') as HTMLElement,

  statStatusBadge: document.getElementById('stat-status-badge') as HTMLElement,
  statSizeVal: document.getElementById('stat-size-val') as HTMLElement,
  statEcVal: document.getElementById('stat-ec-val') as HTMLElement,

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

      // 2. Check Readability
      const readability = checkQRReadability(
        state.fgColor,
        state.bgColor,
        state.transparentBg,
        state.dotStyle,
        state.emojiMode !== 'none',
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

      if (el.statStatusBadge) {
        el.statStatusBadge.className = `status-pill ${readability.level} font-mono`;
        el.statStatusBadge.textContent = readability.level.toUpperCase();
      }

      if (el.alertIcon) {
        if (readability.level === 'safe') {
          el.alertIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        } else if (readability.level === 'warning') {
          el.alertIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`;
        } else {
          el.alertIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
        }
      }

      const containsMultibyte = /[^\x00-\x7F]+/.test(state.data);
      if (containsMultibyte && state.data.length > 0) {
        el.textWarn.classList.remove('hidden');
      } else {
        el.textWarn.classList.add('hidden');
      }

      const isEmoji = /^[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D]+$/u.test(state.emojiText);

      if (state.emojiMode !== 'none') {
        if (isEmoji && state.emojiText.length > 0) {
          el.emojiHueWrap?.classList.remove('hidden');
          if (state.emojiMode === 'text') {
            el.emojiFontWrap?.classList.add('hidden');
            el.emojiWeightWrap?.classList.add('hidden');
          } else {
            el.emojiFontWrap?.classList.remove('hidden');
            el.emojiWeightWrap?.classList.remove('hidden');
          }
        } else {
          el.emojiHueWrap?.classList.add('hidden');
          el.emojiFontWrap?.classList.remove('hidden');
          el.emojiWeightWrap?.classList.remove('hidden');
        }
      }

      if (el.valQrRadius) el.valQrRadius.textContent = `${state.qrRadius}%`;
      if (el.labelMargin) el.labelMargin.textContent = `${state.margin}%`;
      if (el.labelSize) el.labelSize.textContent = `${state.size}px`;
      if (el.statSizeVal) el.statSizeVal.textContent = `${state.size}px`;
      if (el.statEcVal) el.statEcVal.textContent = `${state.errorCorrection} (${state.errorCorrection === 'L' ? '7%' : state.errorCorrection === 'M' ? '15%' : state.errorCorrection === 'Q' ? '25%' : '30%'})`;
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

  if (navigator.share && navigator.canShare) {
    getRawBlob('png').then((blob) => {
      if (blob) {
        const file = new File([blob], 'qr-code.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          navigator.share({
            title: t('appTitle'),
            url: url,
            files: [file],
          }).catch(() => {});
          return;
        }
      }
      navigator.share({ title: t('appTitle'), url: url }).catch(() => {});
    }).catch(() => {
      copyToClipboard(url);
    });
  } else {
    copyToClipboard(url);
  }
}

function copyToClipboard(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    alert(t('copiedMsg') || 'URL Copied');
  }).catch(() => {
    alert(t('copiedMsg') || 'URL Copied');
  });
}

function autoResizeTextarea() {
  if (!el.data) return;
  el.data.style.height = 'auto';
  if (el.data.scrollHeight > 0 && el.data.value.length > 0) {
    el.data.style.height = `${el.data.scrollHeight}px`;
  }
}

function bindEvents() {
  // Text area
  el.data.addEventListener('input', (e) => {
    autoResizeTextarea();
    const val = (e.target as HTMLTextAreaElement).value;
    store.update({ data: val || 'https://qr.manpuc.me/' }, true);
    debounceRender();
  });

  // Clear button
  el.btnClear?.addEventListener('click', () => {
    el.data.value = '';
    autoResizeTextarea();
    store.update({ data: 'https://qr.manpuc.me/' }, true);
    debounceRender();
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

        if (mode === 'none') {
          el.emojiWrap.classList.add('hidden');
          el.emojiCommonControls.classList.add('hidden');
          el.emojiTextControls.classList.add('hidden');
        } else if (mode === 'image') {
          el.emojiWrap.classList.remove('hidden');
          el.emojiCommonControls.classList.remove('hidden');
          el.emojiTextControls.classList.add('hidden');
        } else {
          el.emojiWrap.classList.remove('hidden');
          el.emojiCommonControls.classList.remove('hidden');
          el.emojiTextControls.classList.remove('hidden');
        }

        store.update({ emojiMode: mode });
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
    el.fgText.value = val;
    store.update({ fgColor: val }, true);
    debounceRender();
  });
  el.fgText.addEventListener('change', (e) => {
    let val = (e.target as HTMLInputElement).value;
    if (!val.startsWith('#')) val = '#' + val;
    el.fg.value = val;
    store.update({ fgColor: val });
  });

  el.bg.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    el.bgText.value = val;
    store.update({ bgColor: val }, true);
    debounceRender();
  });
  el.bgText.addEventListener('change', (e) => {
    let val = (e.target as HTMLInputElement).value;
    if (!val.startsWith('#')) val = '#' + val;
    el.bg.value = val;
    store.update({ bgColor: val });
  });

  el.trans.addEventListener('change', (e) => {
    store.update({ transparentBg: (e.target as HTMLInputElement).checked });
  });

  el.qrRadius.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value) || 0;
    store.update({ qrRadius: val }, true);
    debounceRender();
  });

  let isIME = false;
  el.emojiText.addEventListener('compositionstart', () => { isIME = true; });
  el.emojiText.addEventListener('compositionend', (e) => {
    isIME = false;
    store.update({ emojiText: (e.target as HTMLInputElement).value }, true);
    debounceRender();
  });
  el.emojiText.addEventListener('input', (e) => {
    if (isIME) return;
    store.update({ emojiText: (e.target as HTMLInputElement).value }, true);
    debounceRender();
  });

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
    debounceRender();
  });
  el.emojiWeight.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    store.update({ emojiFontWeight: val }, true);
    debounceRender();
  });

  // Sharing
  el.btnShare?.addEventListener('click', handleShare);

  el.btnPng.addEventListener('click', () => {
    saveToHistory(store.state, currentSvgSource);
    downloadQR(store.state, 'png');
  });
  el.btnSvg.addEventListener('click', () => {
    saveToHistory(store.state, currentSvgSource);
    downloadQR(store.state, 'svg');
  });

  window.addEventListener('qr-history-updated', renderHistory);
}

function updateFormFromState() {
  const state = store.state;
  el.data.value = state.data === 'https://qr.manpuc.me/' ? '' : state.data;
  autoResizeTextarea();
  el.size.value = state.size.toString();
  el.margin.value = state.margin.toString();
  el.ec.value = state.errorCorrection;
  el.style.value = state.dotStyle;
  el.fg.value = state.fgColor;
  el.fgText.value = state.fgColor;
  el.bg.value = state.bgColor;
  el.bgText.value = state.bgColor;
  el.trans.checked = state.transparentBg;
  el.emojiMode.value = state.emojiMode;
  el.emojiText.value = state.emojiText;
  el.qrRadius.value = state.qrRadius.toString();

  el.emojiHue.value = state.emojiHue.toString();
  el.emojiSize.value = Math.round(state.emojiSize * 100).toString();
  el.emojiFont.value = state.emojiFont;
  el.emojiWeight.value = state.emojiFontWeight.toString();

  if (el.valQrRadius) el.valQrRadius.textContent = `${state.qrRadius}%`;
  if (el.labelMargin) el.labelMargin.textContent = `${state.margin}%`;
  if (el.labelSize) el.labelSize.textContent = `${state.size}px`;
  if (el.statSizeVal) el.statSizeVal.textContent = `${state.size}px`;

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

function getHistoryPreviewSrc(svg: string): string {
  if (!svg) return '';
  const trimmed = svg.trim();
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  if (trimmed.startsWith('<svg')) {
    let clean = trimmed;
    if (!clean.includes('xmlns=')) {
      clean = clean.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(clean);
  }
  return trimmed;
}

function renderHistory() {
  const items = getHistory();
  if (items.length === 0) {
    if (el.historySec) el.historySec.style.display = 'none';
    return;
  }

  if (el.historySec) el.historySec.style.display = 'block';
  el.historyList.innerHTML = '';

  const isJa = store.state.language === 'ja';
  const reuseTitle = t('loadHistory') || (isJa ? '再利用' : 'Reuse');
  const deleteTitle = t('deleteLabel') || (isJa ? '削除' : 'Delete');

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');

    const date = new Date(item.date).toLocaleString(isJa ? 'ja-JP' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const displayData = item.state.data || 'https://...';
    const previewSrc = getHistoryPreviewSrc(item.svg);

    div.innerHTML = `
      <div class="history-preview-mini">
        ${previewSrc ? `<img src="${previewSrc}" alt="" loading="lazy" />` : `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.25"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/></svg>
        `}
      </div>
      <div class="history-item-content">
        <div class="history-item-date">${date}</div>
        <div class="history-item-data">${displayData}</div>
      </div>
      <div class="history-actions">
        <button type="button" class="history-icon-btn load-btn" data-id="${item.id}" title="${reuseTitle}" aria-label="${reuseTitle}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
        <button type="button" class="history-icon-btn history-item-delete" data-id="${item.id}" title="${deleteTitle}" aria-label="${deleteTitle}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>
    `;

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

    div.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        loadHistoryItem(item.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
