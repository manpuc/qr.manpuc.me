import { c as createComponent } from './astro-component_gqD02ecy.mjs';
import 'piccolore';
import { l as createRenderInstruction, m as maybeRenderHead, h as addAttribute, u as unescapeHTML, r as renderTemplate, n as renderComponent, o as renderHead } from './entrypoint_BKZxm67R.mjs';
import 'clsx';
import { icon } from '@fortawesome/fontawesome-svg-core';
import { faRotateRight, faExclamationTriangle, faInfoCircle, faCheck, faMoon, faSun, faPalette, faWandMagicSparkles, faClockRotateLeft, faLanguage, faShareNodes, faGear, faTrash, faCopy, faDownload } from '@fortawesome/free-solid-svg-icons';
import LZString from 'lz-string';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$Icon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Icon;
  const icons = {
    download: faDownload,
    copy: faCopy,
    trash: faTrash,
    gear: faGear,
    share: faShareNodes,
    language: faLanguage,
    history: faClockRotateLeft,
    magic: faWandMagicSparkles,
    palette: faPalette,
    sun: faSun,
    moon: faMoon,
    check: faCheck,
    info: faInfoCircle,
    warning: faExclamationTriangle,
    rotate: faRotateRight
  };
  const { name, class: className = "", id, "aria-label": ariaLabel, "aria-hidden": ariaHidden } = Astro2.props;
  const iconDef = icons[name];
  const iconHtml = iconDef ? icon(iconDef).html[0] : "";
  return renderTemplate`${maybeRenderHead()}<span${addAttribute(`inline-icon ${className}`, "class")}${addAttribute(id, "id")}${addAttribute(ariaLabel, "aria-label")}${addAttribute(ariaHidden === void 0 && !ariaLabel ? "true" : ariaHidden, "aria-hidden")} data-astro-cid-patnjmll>${unescapeHTML(iconHtml)}</span>`;
}, "E:/kuki/Documents/.Dev/qr.manpuc.me/src/components/Icon.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const title = "QRメーカー | QR maker";
  const description = "高速・オフライン対応の多機能QRコード生成アプリ。プレビュー付きでデザインや絵文字埋め込みの設定が可能です。";
  const url = "https://qr.manpuc.me/";
  const q = Astro2.url.searchParams.get("q");
  let ogImage = `${url}og.png`;
  let dynamicTitle = title;
  let dynamicDescription = description;
  if (q) {
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(q);
      if (decompressed) {
        const parsed = JSON.parse(decompressed);
        const content = parsed.d || "";
        dynamicTitle = `QR: ${content.substring(0, 30)}${content.length > 30 ? "..." : ""} | QRメーカー`;
        dynamicDescription = "QRコードを作成しました。このURLから読み取ることができます。";
        ogImage = `${url}og.png?q=${q}`;
      }
    } catch (e) {
    }
  }
  return renderTemplate(_a || (_a = __template(['<html lang="ja" data-theme="auto" data-astro-cid-j7pv25f6> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>', '</title><meta name="description"', `><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><!-- Non-blocking font loading with fallback to noscript --><link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">`, '<noscript><link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap" rel="stylesheet"></noscript><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="alternate icon" href="/fav-128.ico" sizes="128x128"><link rel="apple-touch-icon" href="/app.png"><meta name="theme-color" content="#ffffff"><!-- manifest is handled by @vite-pwa/astro automatically in head --><meta name="astro-view-transitions-enabled" content="false"><meta property="og:title"', '><meta property="og:description"', '><meta property="og:url"', '><meta property="og:image"', '><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image"><link rel="canonical"', ">", '</head> <body data-astro-cid-j7pv25f6> <div class="top-controls" data-astro-cid-j7pv25f6> <button id="btn-lang" class="icon-btn" aria-label="Toggle Language" title="Change Language" data-astro-cid-j7pv25f6>', '</button> <button id="btn-theme" class="icon-btn" aria-label="Toggle Theme" title="Switch Theme" data-astro-cid-j7pv25f6> ', " ", ' </button> </div> <div class="container" data-astro-cid-j7pv25f6> <header class="app-header" data-astro-cid-j7pv25f6> <img src="/favicon.svg" class="page-icon" alt="" data-astro-cid-j7pv25f6> <h1 class="app-title" data-i18n="appTitle" data-astro-cid-j7pv25f6>\nQRメーカー\n</h1> </header> <main class="grid-layout" data-astro-cid-j7pv25f6> <div class="config-col" data-astro-cid-j7pv25f6> <div class="card" data-astro-cid-j7pv25f6> <h2 data-i18n="settingsTitle" data-astro-cid-j7pv25f6>', ' デザイン設定</h2> <div class="form-group" data-astro-cid-j7pv25f6> <label for="input-data" data-i18n="dataLabel" data-astro-cid-j7pv25f6>データ (URLやテキスト)</label> <input type="text" id="input-data" data-i18n-placeholder="dataLabel" data-astro-cid-j7pv25f6> </div> <div class="grid-2col" data-astro-cid-j7pv25f6> <div class="form-group" data-astro-cid-j7pv25f6> <label for="input-size" data-i18n="sizeLabel" data-astro-cid-j7pv25f6>出力サイズ (px)</label> <select id="input-size" data-astro-cid-j7pv25f6> <option value="128" data-astro-cid-j7pv25f6>128</option> <option value="256" selected data-astro-cid-j7pv25f6>256</option> <option value="512" data-astro-cid-j7pv25f6>512</option> <option value="1024" data-astro-cid-j7pv25f6>1024</option> </select> </div> <div class="form-group" data-astro-cid-j7pv25f6> <label for="input-ec" data-i18n="errorCorrectionLabel" data-astro-cid-j7pv25f6>誤り訂正</label> <select id="input-ec" data-astro-cid-j7pv25f6> <option value="L" data-astro-cid-j7pv25f6>L (7%)</option> <option value="M" selected data-astro-cid-j7pv25f6>M (15%)</option> <option value="Q" data-astro-cid-j7pv25f6>Q (25%)</option> <option value="H" data-astro-cid-j7pv25f6>H (30%)</option> </select> </div> </div> <div class="grid-2col" data-astro-cid-j7pv25f6> <div class="form-group" data-astro-cid-j7pv25f6> <label for="input-style" data-i18n="styleLabel" data-astro-cid-j7pv25f6>ドットスタイル</label> <select id="input-style" data-astro-cid-j7pv25f6> <option value="square" data-i18n="styleSquare" data-astro-cid-j7pv25f6>四角</option> <option value="dots" data-i18n="styleDots" data-astro-cid-j7pv25f6>丸</option> <option value="rounded" selected data-i18n="styleRounded" data-astro-cid-j7pv25f6>角丸</option> </select> </div> <div class="form-group" data-astro-cid-j7pv25f6> <label for="input-margin" data-i18n="marginLabel" data-astro-cid-j7pv25f6>余白枠 (px)</label> <input type="number" id="input-margin" value="10" min="0" max="100" data-astro-cid-j7pv25f6> </div> </div> <div class="grid-2col" data-astro-cid-j7pv25f6> <div class="form-group" data-astro-cid-j7pv25f6> <label for="input-fg" data-i18n="fgColorLabel" data-astro-cid-j7pv25f6>前景色</label> <div class="color-picker-wrap" data-astro-cid-j7pv25f6> <input type="color" id="input-fg" value="#000000" data-astro-cid-j7pv25f6> <input type="text" id="input-fg-text" value="#000000" style="width:100%;" data-i18n-aria-label="fgColorLabel" data-astro-cid-j7pv25f6> </div> </div> <div class="form-group" data-astro-cid-j7pv25f6> <label for="input-bg" data-i18n="bgColorLabel" data-astro-cid-j7pv25f6>背景色</label> <div class="color-picker-wrap" data-astro-cid-j7pv25f6> <input type="color" id="input-bg" value="#ffffff" data-astro-cid-j7pv25f6> <input type="text" id="input-bg-text" value="#ffffff" style="width:100%;" data-i18n-aria-label="bgColorLabel" data-astro-cid-j7pv25f6> </div> </div> </div> <div class="grid-2col" data-astro-cid-j7pv25f6> <div class="form-group" data-astro-cid-j7pv25f6> <label for="input-qr-radius" data-i18n="qrRadiusLabel" data-astro-cid-j7pv25f6>QR全体の角丸</label> <input type="number" id="input-qr-radius" min="0" max="100" step="1" value="12" data-astro-cid-j7pv25f6> </div> </div> <div class="form-group" data-astro-cid-j7pv25f6> <label class="toggle-label" data-astro-cid-j7pv25f6> <input type="checkbox" id="input-transparent" data-astro-cid-j7pv25f6> <span data-i18n="transparentBgLabel" data-astro-cid-j7pv25f6>背景を透過する (PNG保存用)</span> </label> </div> <hr style="margin: 20px 0; border: 0; border-top: 1px solid var(--color-border);" data-astro-cid-j7pv25f6> <div class="form-group" data-astro-cid-j7pv25f6> <label for="input-emoji-mode" data-i18n="emojiModeLabel" data-astro-cid-j7pv25f6>中央絵文字 (Noto)</label> <select id="input-emoji-mode" data-astro-cid-j7pv25f6> <option value="none" data-i18n="emojiNone" data-astro-cid-j7pv25f6>なし</option> <option value="text" data-i18n="emojiText" data-astro-cid-j7pv25f6>テキスト描画方式</option> <option value="image" data-i18n="emojiImage" data-astro-cid-j7pv25f6>画像化方式</option> </select> </div> <div class="form-group hidden" id="emoji-input-wrap" data-astro-cid-j7pv25f6> <label for="input-emoji" data-i18n="emojiInputLabel" data-astro-cid-j7pv25f6>絵文字入力</label> <input type="text" id="input-emoji" maxlength="2" placeholder="🌟" value="🌟" data-astro-cid-j7pv25f6> </div> </div> </div> <div class="preview-col" data-astro-cid-j7pv25f6> <div class="card" style="text-align: center; position: sticky; top: 20px;" data-astro-cid-j7pv25f6> <h2 data-i18n="previewTitle" data-astro-cid-j7pv25f6>', ' プレビュー</h2> <div id="qr-preview" class="qr-preview-wrapper" style="min-height: 256px;" data-astro-cid-j7pv25f6> <!-- QR Code generated here --> <div class="qr-placeholder" style="width: 256px; height: 256px; opacity: 0.1; background: currentColor; border-radius: 12px; display: flex; align-items: center; justify-content: center;" data-astro-cid-j7pv25f6> <img src="/favicon.svg" class="placeholder-icon" alt="" data-astro-cid-j7pv25f6> </div> </div> <div id="readability-alert" class="alert hidden" data-astro-cid-j7pv25f6> ', ' <span id="alert-text" data-astro-cid-j7pv25f6></span> </div> <div class="flex-col" style="margin-top: 20px;" data-astro-cid-j7pv25f6> <button id="btn-dl-png" data-astro-cid-j7pv25f6>', ' <span data-i18n="downloadPng" data-astro-cid-j7pv25f6>PNG 保存</span></button> <button id="btn-dl-svg" class="outline" data-astro-cid-j7pv25f6>', ' <span data-i18n="downloadSvg" data-astro-cid-j7pv25f6>SVG 保存</span></button> <button id="btn-share" class="outline" data-astro-cid-j7pv25f6>', ' <span data-i18n="shareLabel" data-astro-cid-j7pv25f6>共有 URL</span></button> </div> </div> </div> </main> <section class="card hidden" id="history-section" style="margin-top:20px;" data-astro-cid-j7pv25f6> <h2 data-i18n="historyTitle" data-astro-cid-j7pv25f6>', ' 履歴</h2> <div id="history-list" class="history-grid" data-astro-cid-j7pv25f6></div> </section> </div> ', " ", ' <!-- Cloudflare Web Analytics at the end --> <script async src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="{&quot;token&quot;: &quot;d6c3a0039b4e4cb194e7ea83521c8174&quot;}"><\/script> </body> </html>'])), title, addAttribute(description, "content"), maybeRenderHead(), addAttribute(dynamicTitle, "content"), addAttribute(dynamicDescription, "content"), addAttribute(Astro2.url.href, "content"), addAttribute(ogImage, "content"), addAttribute(url, "href"), renderHead(), renderComponent($$result, "Icon", $$Icon, { "name": "language", "data-astro-cid-j7pv25f6": true }), renderComponent($$result, "Icon", $$Icon, { "name": "sun", "class": "theme-sun", "data-astro-cid-j7pv25f6": true }), renderComponent($$result, "Icon", $$Icon, { "name": "moon", "class": "theme-moon", "data-astro-cid-j7pv25f6": true }), renderComponent($$result, "Icon", $$Icon, { "name": "gear", "data-astro-cid-j7pv25f6": true }), renderComponent($$result, "Icon", $$Icon, { "name": "magic", "data-astro-cid-j7pv25f6": true }), renderComponent($$result, "Icon", $$Icon, { "name": "check", "id": "alert-icon", "data-astro-cid-j7pv25f6": true }), renderComponent($$result, "Icon", $$Icon, { "name": "download", "data-astro-cid-j7pv25f6": true }), renderComponent($$result, "Icon", $$Icon, { "name": "download", "data-astro-cid-j7pv25f6": true }), renderComponent($$result, "Icon", $$Icon, { "name": "share", "data-astro-cid-j7pv25f6": true }), renderComponent($$result, "Icon", $$Icon, { "name": "history", "data-astro-cid-j7pv25f6": true }), renderScript($$result, "E:/kuki/Documents/.Dev/qr.manpuc.me/src/pages/index.astro?astro&type=script&index=0&lang.ts"), renderScript($$result, "E:/kuki/Documents/.Dev/qr.manpuc.me/src/pages/index.astro?astro&type=script&index=1&lang.ts"));
}, "E:/kuki/Documents/.Dev/qr.manpuc.me/src/pages/index.astro", void 0);

const $$file = "E:/kuki/Documents/.Dev/qr.manpuc.me/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
