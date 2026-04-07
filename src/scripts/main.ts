import { store, type AppState, type DotType, type EmojiMode, type ErrorCorrection } from './store';
import { initTheme } from './theme';
import { generateQR, downloadQR, getRawBlob } from './qr-generator';
import { checkQRReadability } from './color-contrast';
import { getShareUrl, loadFromUrl } from './share';
import { getHistory, saveToHistory, deleteHistoryItem, loadHistoryItem } from './history';
import { t } from './i18n';

// Debounce for text input to prevent excessive renders
let generateTimeout: number;
let currentSvgSource: string = '';

function debounceRender() {
  clearTimeout(generateTimeout);
  generateTimeout = window.setTimeout(renderNow, 300);
}

// Elements
const el = {
  data: document.getElementById('input-data') as HTMLInputElement,
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
  
  btnTheme: document.getElementById('btn-theme') as HTMLButtonElement,
  btnLang: document.getElementById('btn-lang') as HTMLButtonElement,
  btnShare: document.getElementById('btn-share') as HTMLButtonElement,
  btnPng: document.getElementById('btn-dl-png') as HTMLButtonElement,
  btnSvg: document.getElementById('btn-dl-svg') as HTMLButtonElement,
  
  historyList: document.getElementById('history-list') as HTMLElement,
  historySec: document.getElementById('history-section') as HTMLElement,
  qrRadius: document.getElementById('input-qr-radius') as HTMLInputElement,
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
  const state = store.state;

  // 1. Generate QR Code
  currentSvgSource = (await generateQR(state, el.preview)) as string;

  requestAnimationFrame(() => {
    if (state.transparentBg) {
      el.preview.classList.add('checker-pattern-bg');
    } else {
      el.preview.classList.remove('checker-pattern-bg');
    }
    
    // Apply background radius to the first child of the preview (the QR SVG)
    const qrSvg = el.preview.querySelector('svg, img, canvas') as HTMLElement;
    if (qrSvg) {
      qrSvg.style.borderRadius = `${state.qrRadius}px`;
    }
  });
  
  // 2. Check Readability
  const readability = checkQRReadability(
    state.fgColor, 
    state.bgColor, 
    state.transparentBg, 
    state.dotStyle,
    state.emojiMode !== 'none',
    state.errorCorrection
  );
  
  el.alert.className = `alert ${readability.level}`;
  // Use translations
  const msg = state.language === 'ja' ? readability.messageJa : readability.messageEn;
  el.alertText.textContent = msg;
  el.alert.classList.remove('hidden');

  // Update text warn based on main data payload
  const containsMultibyte = /[^\x00-\x7F]+/.test(state.data);
  if (containsMultibyte && state.data.length > 0) {
    el.textWarn.classList.remove('hidden');
  } else {
    el.textWarn.classList.add('hidden');
  }

  // Check if string contains only emoji elements
  const isEmoji = /^[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D]+$/u.test(state.emojiText);

  if (state.emojiMode !== 'none') {
    if (isEmoji && state.emojiText.length > 0) {
      el.emojiHueWrap?.classList.remove('hidden');
      // In text mode, if it's pure emoji, hide font/weight settings
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

  // Update slider value displays
  if (el.valEmojiSize) el.valEmojiSize.textContent = `${Math.round(state.emojiSize * 100)}%`;
  if (el.valEmojiHue) el.valEmojiHue.textContent = state.emojiHue.toString();
  if (el.valEmojiWeight) el.valEmojiWeight.textContent = state.emojiFontWeight.toString();



  // Update emoji warn for image mode
  if (state.emojiMode === 'image') {
    if (!isEmoji && state.emojiText.length > 0) el.emojiWarn.classList.remove('hidden');
    else el.emojiWarn.classList.add('hidden');
  } else {
    el.emojiWarn.classList.add('hidden');
  }

  // Dynamic maxLength for emojiText based on size
  // 0.5 -> 1, 0.4 -> 2, 0.3 -> 3, 0.2 -> 6, 0.1 -> 15
  let maxChars = 1;
  if (state.emojiSize <= 0.15) maxChars = 15;
  else if (state.emojiSize <= 0.25) maxChars = 6;
  else if (state.emojiSize <= 0.35) maxChars = 3;
  else if (state.emojiSize <= 0.45) maxChars = 2;
  else maxChars = 1;
  el.emojiText.maxLength = maxChars;
}

function bindEvents() {
  // Binding inputs to store
  el.data.addEventListener('input', (e) => {
    store.update({ data: (e.target as HTMLInputElement).value || 'https://qr.manpuc.me/' }, true);
    debounceRender();
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

  el.style.addEventListener('change', (e) => {
    store.update({ dotStyle: (e.target as HTMLSelectElement).value as DotType });
  });

  // Color syncing
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

  el.emojiMode.addEventListener('change', (e) => {
    const mode = (e.target as HTMLSelectElement).value as EmojiMode;
    if (mode === 'none') {
      el.emojiWrap.classList.add('hidden');
    } else {
      el.emojiWrap.classList.remove('hidden');
    }
    store.update({ emojiMode: mode });
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
    if (el.valEmojiHue) el.valEmojiHue.textContent = val.toString();
    store.update({ emojiHue: val }, true);
    debounceRender();
  });
  el.emojiSize.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    if (el.valEmojiSize) el.valEmojiSize.textContent = `${val}%`;
    store.update({ emojiSize: val / 100 }, true);
    debounceRender();
  });
  el.emojiFont.addEventListener('change', (e) => {
    store.update({ emojiFont: (e.target as HTMLSelectElement).value }, true);
    debounceRender();
  });
  el.emojiWeight.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    if (el.valEmojiWeight) el.valEmojiWeight.textContent = val.toString();
    store.update({ emojiFontWeight: val }, true);
    debounceRender();
  });

  // Action Buttons
  el.btnLang.addEventListener('click', () => {
    const nextLang = store.state.language === 'ja' ? 'en' : 'ja';
    store.update({ language: nextLang });
    renderNow(); // to update alert translation if any
  });

  el.btnTheme.addEventListener('click', () => {
    const themes = ['light', 'dark', 'auto'] as const;
    const idx = themes.indexOf(store.state.theme as 'light' | 'dark' | 'auto');
    const nextTheme = themes[(idx + 1) % themes.length];
    store.update({ theme: nextTheme });
  });

  // Wheel interaction helper
  const addWheelListener = (input: HTMLInputElement, isFloat = false) => {
    input.addEventListener('wheel', (e) => {
      e.preventDefault();
      const step = parseFloat(input.step) || 1;
      const direction = e.deltaY > 0 ? -1 : 1;
      const currentVal = isFloat ? parseFloat(input.value) : parseInt(input.value);
      let val = currentVal + (direction * step);
      
      const minVal = input.min !== "" ? parseFloat(input.min) : -Infinity;
      const maxVal = input.max !== "" ? parseFloat(input.max) : Infinity;
      val = Math.max(minVal, Math.min(maxVal, val));
      
      input.value = val.toString();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, { passive: false });
  };

  addWheelListener(el.margin);
  addWheelListener(el.qrRadius);
  addWheelListener(el.emojiHue);
  addWheelListener(el.emojiSize);
  addWheelListener(el.emojiWeight);


  el.btnShare.addEventListener('click', async () => {
    saveToHistory(store.state, currentSvgSource);
    const url = getShareUrl();
    
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await getRawBlob('png');
        if (blob) {
          const file = new File([blob], 'share.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: t('appTitle'),
              url: url,
              files: [file]
            });
            return;
          }
        }
      } catch (e) {}
    }
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('appTitle'),
          url: url
        });
      } catch (e) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        alert(t('copiedMsg') || 'Copied to clipboard');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert(t('copiedMsg') || 'Copied to clipboard');
    }
  });

  el.btnPng.addEventListener('click', () => {
    saveToHistory(store.state, currentSvgSource);
    downloadQR(store.state, 'png');
  });
  el.btnSvg.addEventListener('click', () => {
    saveToHistory(store.state, currentSvgSource);
    downloadQR(store.state, 'svg');
  });

  // Listen to external history updates
  window.addEventListener('qr-history-updated', renderHistory);
}

function updateFormFromState() {
  const state = store.state;
  el.data.value = state.data === 'https://qr.manpuc.me/' ? '' : state.data;
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

function renderHistory() {
  const items = getHistory();
  if (items.length === 0) {
    el.historySec.classList.add('hidden');
    return;
  }
  
  el.historySec.classList.remove('hidden');
  el.historyList.innerHTML = '';
  
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    const date = new Date(item.date).toLocaleString(store.state.language === 'ja' ? 'ja-JP' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const displayData = item.state.data || 'https://...';

    div.innerHTML = `
      <div class="history-preview-mini">
        ${item.svg ? `<img src="${item.svg}" alt="QR Preview" />` : `
          <img src="/favicon.svg" width="32" height="32" style="opacity: 0.2" alt="" />
        `}
      </div>
      <div class="history-item-content">
        <div class="history-item-date">${date}</div>
        <div class="history-item-data">${displayData}</div>
        <div class="history-actions">
          <button class="history-action-btn load-btn" data-id="${item.id}">
            <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
              <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.9c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L388.4 71.2c-87.5-87.5-229.3-87.5-316.8 0c-23.2 23.2-40.1 50-50.5 78.8c-6.1 16.7 2.4 35.1 19.1 41.2s35.1-2.4 41.2-19.1zM474.4 309.3c-6.1-16.7-24.5-25.2-41.2-19.1s-25.2 24.5-19.1 41.2c10.4 28.8 2.4 35.1 50.5 78.8c87.5 87.5 229.3 87.5 316.8 0c23.2-23.2 40.1-50 50.5-78.8c6.1-16.7-2.4-35.1-19.1-41.2s-35.1 2.4-41.2 19.1c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-17.1-17.1H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.5c-.2 0-.4 0-.6 0h-.9c-17.7 0-32 14.3-32 32V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.8l43.9 43.9c87.5 87.5 229.3 87.5 316.8 0c23.2-23.2 40.1-50 50.5-78.8c6.1-16.7-2.4-35.1-19.1-41.2z"/>
            </svg>
            ${t('loadHistory') || 'Reuse'}
          </button>
          <div style="flex: 1"></div>
          <div class="history-item-delete" data-id="${item.id}" title="Delete">
            <svg fill="currentColor" viewBox="0 0 448 512" width="16" height="16">
              <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
            </svg>
          </div>
        </div>
      </div>
    `;

    div.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Delete action
      if (target.closest('.history-item-delete')) {
        e.stopPropagation();
        const id = target.closest('.history-item-delete')?.getAttribute('data-id');
        if (id) deleteHistoryItem(id);
        return;
      }
      
      // Load action (on button or card click)
      loadHistoryItem(item.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    el.historyList.appendChild(div);
  });
}

// Bootstrap
store.load();
loadFromUrl(); // Override state from URL if shared
initTheme();

// Sync form and generate immediately
updateFormFromState();
bindEvents();
renderNow();
renderHistory();

// Re-render when store updates generally via config changes
store.subscribe(() => {
  updateFormFromState();
  renderNow();
});
