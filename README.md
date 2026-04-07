# 📱 QRメーカー (QR Maker)

高速・オフライン対応の多機能QRコード生成アプリ。iOS 26にインスパイアされたモダンなUIと、高度なカスタマイズ性を備えたPWA（Progressive Web App）です。

## ✨ 特徴

- **リアルタイム生成**: 入力に合わせて即座にQRコードをプレビュー。
- **高度なデザインカスタマイズ**:
  - ドットスタイル（四角・丸・角丸）の選択。
  - 前景色・背景色の自由な設定。
  - 背景透過（PNG保存用）に対応。
  - QRコード全体の角丸調整。
- **中央絵文字**: Noto EmojiをQRコードの中央に美しく配置（テキスト/画像方式を選択可能）。
- **可読性チェック**: 色のコントラストを自動計算し、スキャンしやすさをリアルタイムで判定。
- **履歴管理**: 生成したQRコードをローカルに自動保存（オフライン対応）。
- **共有機能**: `lz-string` を使用して設定情報をURLに圧縮・埋め込み。簡単に共有可能。
- **PWA (Progressive Web App)**: デスクトップやスマートフォンにアプリとしてインストール可能。オフラインでも動作。
- **ダークモード対応**: OSの設定に連動する洗練されたダーク/ライトモード。
- **多言語対応**: 日本語と英語をサポート。

## 🛠️ 技術スタック

- **Framework**: [Astro 6](https://astro.build/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS (Modern CSS Variables & Spring Animations)
- **QR Generation**: [qr-code-styling](https://github.com/kozakdenys/qr-code-styling)
- **Compression**: [lz-string](https://pieroxy.net/blog/pages/lz-string/index.html)
- **PWA**: [@vite-pwa/astro](https://vite-pwa-org.netlify.app/frameworks/astro)
- **Analytics**: Cloudflare Web Analytics
- **Deployment**: [Vercel](https://vercel.com/) (Static Output)

## 🚀 開発環境のセットアップ

### 1. 依存関係のインストール

```sh
pnpm install
```

### 2. ローカルサーバーの起動

```sh
pnpm dev
```

ブラウザで `http://localhost:4321` を開きます。

### 3. ビルド

```sh
pnpm build
```

##  Genie コマンド

| コマンド | 内容 |
| :--- | :--- |
| `pnpm install` | 依存関係をインストール |
| `pnpm dev` | ローカル開発サーバーを起動 |
| `pnpm build` | 本番用ビルドを生成 (`./dist/`) |
| `pnpm preview` | ビルド済みファイルをローカルでプレビュー |
| `pnpm astro check` | TypeScriptの型チェックなどを実行 |

## 📱 PWAについて

このアプリはPWAに対応しており、以下の機能が利用可能です：

- **オフライン動作**: キャッシュによりインターネット未接続でも利用可能。
- **ホーム画面への追加**: ブラウザの設定から「ホーム画面に追加」を選択することで、ネイティブアプリのように利用できます。
- **高速な起動**: サービスワーカーにより、2回目以降のアクセスが非常に高速です。

---

Developed with ❤️ by [manpuc](https://manpuc.me)