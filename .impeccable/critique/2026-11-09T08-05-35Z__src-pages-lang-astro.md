---
target: src/pages/[...lang].astro
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:E:\\kuki\\Documents\\.Dev\\qr.manpuc.me\\src\\pages\\[...lang].astro"
target_fingerprint: "sha256:9bcf70ac8d58ed8b179a0a57d65d06b9ce39409e2b07fb3f7465e601e936fa6c"
target_path: "E:\\kuki\\Documents\\.Dev\\qr.manpuc.me\\src\\pages\\[...lang].astro"
timestamp: 2026-11-09T08-05-35Z
slug: src-pages-lang-astro
---
Method: dual-agent (A: a5279884 · B: bd499adf)

# QR Maker UI/UX Critique (`src/pages/[...lang].astro`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | ライブプレビュー（60ms）・サンプル表示バッジ・トースト通知は良好。「背景を透過」ON時も背景色ピッカーや角丸が有効に見えたままになる (`src/scripts/qr-generator.ts:145-146`) |
| 2 | Match System / Real World | 3 | ラベルのサンセリフ化・4言語対応は良好。誤り訂正（`L · 7%` 等）に平易な説明がなく、履歴の日時フォーマットが `zh`/`es` でも `en-US` 固定 (`src/scripts/main.ts:597`) |
| 3 | User Control and Freedom | 2 | 共有ボタン押下時に `?q=...` がアドレスバーに残るため、その後の編集内容がリロード時にURLパラメータで上書きされる (`src/scripts/main.ts:201, 712-713`) |
| 4 | Consistency and Standards | 2 | `Footer.astro` (`manpuc-theme`) と `theme.ts` (`qr_maker_theme`) の二重テーマ管理が競合し、手動のライト/ダーク切替が上書きされる (`src/scripts/theme.ts:19-21`) |
| 5 | Error Prevention | 2 | 中央モード（絵文字/テキスト）をONにした瞬間、初期サイズ40%（面積16%）が初期誤り訂正 `M (15%)` を超過して即座に警告が出る (`src/scripts/store.ts:38-39`) |
| 6 | Recognition Rather Than Recall | 2 | 640px未満で「PNGで保存」のラベル（`.fab-pill-label`）が非表示になり、アイコンのみのボタンになる (`src/pages/[...lang].astro:869`) |
| 7 | Flexibility and Efficiency | 2 | カスタムラジオ・チェックボックスの `<input>` が `display: none` のためキーボードTab移動・操作が不可 (`src/styles/global.css:283, 317`) |
| 8 | Aesthetic and Minimalist Design | 4 | Monolith UI の1pxヘアライン、無彩色の抑制されたクローム、150msトランジションが高水準で統一されている |
| 9 | Error Recovery | 3 | コントラスト・占有率診断と改善ヒントは優秀だが、`.contrast-banner` に `white-space: pre-line` がなく複数行のヒントが1行に潰れる (`src/pages/[...lang].astro:630-639`) |
| 10 | Help and Documentation | 2 | マルチバイト警告・絵文字警告は適切だが、`i18n.ts` に用意されたヘルプ文言がUI上で未活用 |
| **Total** | | **25/40** | **Acceptable (視覚基盤は高水準だが、キーボード操作・テーマ競合・状態管理に重要課題あり)** |

## Design Specificity Verdict

- **LLM Assessment**: `char.manpuc.me` / `ui.manpuc.me` の **Monolith UI** の世界観が明確に貫かれています。ボーダーレスなヒーロー入力欄、無彩色のUIクロームと1pxヘアライン、Radixライクなスライドハイライト付き `<Select>`、縦書きのフッター署名など、汎用テンプレートではない独自の「工業的ユーティリティ」として成立しています。一方、`.preview-sticky` に `position: sticky` がない点や、履歴リスト周りの角丸（`8px`/`4px`）に設計書とのわずかなドリフトが見られます。
- **Deterministic Scan**: 本体UI（`src/pages/[...lang].astro`、`src/components`、`src/layouts`）の機械的スキャン指摘は **0件** です（`src` 全体スキャンでは固定サイズ1200×630のOG画像テンプレート `src/pages/og-image/[...lang].astro` 内の固定pxサイズ3件・フォント1件のみ検出されましたが、画像生成用のため誤検知です）。
- **Visual Overlays**: ブラウザの動的スクリプト注入環境が非公開のため、オーバーレイ表示はスキップし静的ディテクターとコード精査で代替しています。

## Overall Impression

先ほどの修正によって「共有URLの復元」「空入力時のサンプル明示」「絵文字/テキスト切替と描画」「スライダー刻み」「履歴の重複排除とメタ情報表示」はきれいに解決しました。さらに深くコード全体を精査した結果、**ラジオボタン・チェックボックスのキーボード/スクリーンリーダー到達不能（P0）** と **フッターとストア間のテーマ管理の競合（P1）** という構造的な問題が見つかりました。これらを解消すれば完成度が大きく跳ね上がります。

## What's Working

1. **QR固有の可読性・スキャン成否判定エンジン (`src/scripts/color-contrast.ts`)**: 単純なWCAGコントラスト比だけでなく、明度差・色相差、反転QR（暗背景＋明ドット）の警告、クワイエットゾーン余白、中央ロゴ面積（`emojiSize²`）と誤り訂正能力（`L/M/Q/H`）の比較までリアルタイムに診断できています。
2. **ゼロ遅延の書き出しパイプラインとオフスクリーン描画 (`src/scripts/qr-generator.ts`)**: オフスクリーン要素でSVG生成完了後にDOMを差し替えるためチラつきがなく、PNG Blobの事前キャッシュにより「PNGで保存」が待機時間ゼロで完了します。
3. **Monolith `<Select>` と `<Slider>` の作り込み (`src/components/Select.astro`, `src/components/Slider.astro`)**: 150msのスライドハイライト、画面端でのフリップ、16pxサム中心に一致した進捗バー計算、キーボード刻み幅の統一が丁寧に実装されています。

## Priority Issues

- **[P0] カスタムラジオボタン・チェックボックスがキーボードとスクリーンリーダーから操作不能**
  - **Where**: `src/styles/global.css:282-284, 316-318`, `src/pages/[...lang].astro:274-290, 312-340`
  - **Why it matters**: `.monolith-radio-item input[type="radio"]` と `.monolith-checkbox-label input[type="checkbox"]` に `display: none` が指定されているため、Tab移動や矢印キー、スクリーンリーダーから「ドット形状」「背景を透過」「中央モード（なし/絵文字/テキスト）」が完全に消えています。
  - **Fix**: `display: none` を視覚的隠蔽（`position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;`）に変更し、`input:focus-visible + .monolith-radio-box` / `.monolith-checkbox-box` にフォーカスリング（`box-shadow: 0 0 0 1px var(--foreground)`）を追加します。
  - **Suggested command**: `$impeccable harden`

- **[P1] テーマ管理の二重化により、フッターでのライト/ダーク切替が上書きされる**
  - **Where**: `src/scripts/theme.ts:3-31`, `src/scripts/store.ts:72-75`, `src/components/Footer.astro:134-175`, `src/layouts/Layout.astro:28-42`
  - **Why it matters**: `Footer.astro` / `Layout.astro` は `localStorage['manpuc-theme']` を使う一方、`store.ts` / `theme.ts` は `localStorage['qr_maker_theme']` を使って描画のたびに `data-theme` 属性を上書きします。OSがダークモードの環境でフッターから「Light」を選んでも、設定変更時に `data-theme="dark"` が再付与されダーク表示に戻ってしまいます。
  - **Fix**: テーマの状態管理を `manpuc-theme` に一本化し、`store.notify()` ごとに `theme.ts` が別キーで `data-theme` を上書きしないように統一します。
  - **Suggested command**: `$impeccable harden`

- **[P1] 共有ボタン押下後に編集を続けてリロードすると、古い `?q=` パラメータで編集内容が上書きされる**
  - **Where**: `src/scripts/main.ts:195-204, 520-521`, `src/scripts/store.ts:131-137`
  - **Why it matters**: 共有時や共有URLアクセス時にアドレスバーへ `?q=...` が残るため、その後テキストや色を変更してからページをリロードすると、`sessionStorage` の最新状態ではなくアドレスバーの古い `?q=...` が再読み込みされてしまいます。
  - **Fix**: ユーザーが設定やテキストを変更した際（`store.update()` 実行時）に、URLに `?q=` 等が付いていれば `history.replaceState({}, '', window.location.pathname)` でクエリをクリアし、以降は `sessionStorage` の最新状態が維持されるようにします。
  - **Suggested command**: `$impeccable harden`

- **[P2] 中央テキストモードの文字色が `#000000` 固定で、初期サイズ40%が即座に容量超過警告を出す**
  - **Where**: `src/scripts/qr-generator.ts:39`, `src/scripts/store.ts:38-39`, `src/scripts/main.ts:305-338`
  - **Why it matters**: 中央テキストの色が黒固定のため、前景色を変更したQRコードで色が浮いたり、暗背景で消えたりします。また中央モードをONにした瞬間に「サイズ(16%)が誤り訂正能力(15%)を超過」の警告が出るため、初期状態でエラー感を与えます。
  - **Fix**: 中央テキスト描画時に `state.fgColor` を反映させ、また中央モード有効時のデフォルトサイズを `35%`（面積12% ≤ Mの15%）にするか、または中央モード選択時に誤り訂正を自動で `H` に引き上げます。
  - **Suggested command**: `$impeccable polish`

- **[P2] モバイル（640px未満）で「PNGで保存」のラベルが消え、可読性バナーの改行が潰れている**
  - **Where**: `src/pages/[...lang].astro:630-639, 868-879`
  - **Why it matters**: 640px未満で `.fab-pill-label` が `display: none` になるため、`SVG` ボタンの横にラベルなしのダウンロードアイコンだけが並び、PNG保存であることが分かりません。また `.banner-text` に `white-space: pre-line` がないため、診断メッセージと改善ヒントの改行（`\n`）が繋がって表示されます。
  - **Fix**: モバイルでも `.fab-pill-label` を表示し、`.banner-text` に `white-space: pre-line; text-align: center;` を追加します。
  - **Suggested command**: `$impeccable clarify`

## Persona Red Flags

- **Alex (Power User)**:
  - `#input-data` から `Tab` キーを押すと、ドット形状・背景透過・中央モードをすべて飛び越して誤り訂正セレクトまで飛んでしまう（`display: none` によるフォーカス喪失）。
  - 共有ボタンを押したあと編集を続けてリロード（`Cmd/Ctrl + R`）すると、共有時点の古い状態に戻ってしまう。
- **Jordan (First-Timer)**:
  - 「中央：絵文字」を選んだ瞬間に、何もスライダーを触っていないのに黄色の容量超過警告が出る。
  - スマホ画面（640px未満）で `SVG` ボタンの隣にある黒い丸ボタンに文字がなく、何の形式で保存されるか分からない。
  - 「背景を透過」にチェックを入れても、「背景色」ピッカーがそのままアクティブに見える。
- **Sam & Casey (Accessibility / Mobile User)**:
  - スクリーンリーダーでドット形状や中央モードのラジオグループが操作できない。
  - 履歴アイテム（`.history-item[role="button"]`）の内部に `<button>` がネストされており、ARIAの入れ子ルールに違反している (`src/scripts/main.ts:460-488`)。
  - 入力クリアボタン（`24×24px`）とカラースウォッチ（`24×24px`）のタップ領域が小さい。

## Minor Observations

- **解像度の二重表示 (`src/pages/[...lang].astro:400-411`)**: `解像度` の見出し横に `256px`、直下のセレクトに `256 × 256` と同じ情報が二重に表示されています。
- **履歴の日時ロケール (`src/scripts/main.ts:452`)**: `isJa ? 'ja-JP' : 'en-US'` となっているため、中国語（`zh`）・スペイン語（`es`）でも英語表記の日時になります。
- **オフライン時の絵文字CDNタイムアウト待ち (`src/scripts/qr-generator.ts:63-101`)**: オフライン環境でもGitHubのNoto Emoji SVG取得を試みて1.5秒待ってからローカルCanvasにフォールバックするため、`navigator.onLine === false` のときは即座にフォールバックすると快適です。
- **履歴アイテムの角丸 (`src/styles/global.css:495, 507`)**: `.history-item` (`8px`) と `.history-preview-mini` (`4px`) に角丸が残っており、構造要素0pxの原則とわずかにズレています。

## Questions to Consider

- 「中央（絵文字/テキスト）」をONにしたとき、最初から安全に読み取れるよう誤り訂正レベルを自動で `H (30%)` に引き上げる（または初期サイズを35%に抑える）べきではないでしょうか？
- 「背景を透過」にチェックを入れたとき、無効化される「背景色」ピッカーは半透明（disabled）にして視覚的にフィードバックすべきではないでしょうか？
