# Vantage PM — プロジェクト管理ツール

> **Vantage PM** は、販売案件・アライアンス・広報・研究開発など多様な案件を一元管理するための、社内向けプロジェクト管理 (PM) ツールです。

English summary: [→ See English section below](#english)

---

## コンセプト / Concept

営業チームやエンジニア部門が共通のプラットフォームで案件を管理し、工数・売上・進捗を可視化することで、意思決定のスピードと精度を高めることを目的としています。

- **案件種別に応じたビュー**: 販売案件はカンバンボードで進捗管理、工数はガントチャートで可視化
- **日英バイリンガル UI**: ヘッダーのスライダーで日本語 / 英語を切り替え
- **ダーク / ライトモード**: デフォルトはダークモード、ヘッダーのトグルで切り替え可能
- **プレミアムデザイン**: HeroUI (NextUI) の豊富なコンポーネントとカスタム 3D シャドウで高品質な見た目を実現

---

## 技術スタック / Tech Stack

| カテゴリ | ライブラリ / サービス |
|---|---|
| フレームワーク | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| 言語 | TypeScript 5 |
| UI ライブラリ | [HeroUI (NextUI)](https://heroui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| データ可視化 | [Tremor](https://tremor.so/) + [Recharts](https://recharts.org/) |
| スタイリング | [Tailwind CSS v4](https://tailwindcss.com/) + `tw-animate-css` |
| テーマ管理 | [next-themes](https://github.com/pacocoursey/next-themes) |
| 国際化 (i18n) | [next-intl](https://next-intl-docs.vercel.app/) (日本語 / English) |
| D&D | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| データベース | [Supabase](https://supabase.com/) (PostgreSQL) |
| 認証 | [NextAuth.js v4](https://next-auth.js.org/) (CredentialsProvider) |
| アニメーション | [Framer Motion](https://www.framer.com/motion/) |

---

## 主な機能 / Features

### 📋 案件一覧 (Projects)
- 販売 (SALES) / アライアンス (ALLIANCE) / 広報 (PROMO) / 研究開発 (RD) の 4 種別を管理
- 売上予測・受注確度・期間を登録して一覧で俯瞰
- 新規案件をモーダルから素早く登録（backdrop blur 付きの HeroUI Modal）

### 🗂 販売カンバンボード (Sales Kanban)
- ドラッグ＆ドロップでステータスを移動 (`リード → 計画中 → 提案中 → 受注 / 失注`)
- 確度（受注確率）をカラーチップで視覚的に表示
- ダークモードでも立体感のある 3D シャドウデザイン

### 📅 タスク管理・ガントチャート (Tasks / Gantt)
- プロジェクトに紐づくタスク（人的タスク / システムタスク）を登録
- 開始日・期日を設定してガントチャートで進捗を視覚化
- グラデーションのタスクバーで種別を色分け

### 🌐 多言語 / テーマ
- ヘッダーの `JA / EN` スライダーで言語を即時切り替え
- 🌙 / ☀️ ボタンでダーク / ライトモードを切り替え（デフォルト: ダーク）

---

## データベース設計 / Database Schema

```
projects          tasks              work_logs
─────────────     ─────────────      ─────────────
id (UUID PK)      id (UUID PK)       id (UUID PK)
name              project_id (FK)    user_email
type              task_type          project_id (FK)
status            label              category
revenue           status             hours
probability       start_date         work_date
duration          due_date
custom_fields (JSONB)
```

- `projects.custom_fields` は JSONB カラムで、ユーザーが自由に追加できる見積もり項目（メッシュ数など）を保存
- `tasks.task_type` は `HUMAN`（人的作業）/ `SYSTEM`（自動処理）の enum
- `work_logs` は工数タイムシート。`project_id` が NULL のものは共通費として扱う

---

## セットアップ / Setup

### 1. リポジトリのクローン

```bash
git clone https://github.com/YOUR_ORG/vantage-pm.git
cd vantage-pm
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、各値を設定してください。

```bash
cp .env.local.example .env.local
```

```.env.local
# Supabase PostgreSQL
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# NextAuth.js
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# アクセス許可ドメイン（メールの @以降）
ALLOWED_DOMAIN=yourcompany.com
```

### 3. データベースのマイグレーション

```bash
npx drizzle-kit push
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開くとアプリが起動します。  
デフォルトは日本語ダークモードで表示されます。

---

## ディレクトリ構成 / Project Structure

```
src/
├── app/
│   ├── [locale]/           # i18n ルーティング (ja / en)
│   │   ├── page.tsx        # 案件一覧ページ
│   │   ├── sales-kanban/   # 販売カンバンページ
│   │   ├── tasks/          # タスク管理・ガントチャートページ
│   │   └── layout.tsx      # 共通レイアウト (HeroUIProvider, ThemeProvider)
│   └── globals.css         # グローバルスタイル (カラーパレット, Tailwind v4)
├── components/
│   ├── layout/             # ヘッダー, 言語切替, テーマトグル
│   ├── projects/           # 案件一覧, 新規作成ダイアログ, カンバンボード
│   └── tasks/              # ガントチャート
├── actions/                # Next.js Server Actions (DB 操作)
├── lib/
│   └── db/
│       └── schema.ts       # Drizzle ORM スキーマ定義
└── i18n/                   # next-intl 設定・翻訳ファイル
```

---

## スクリプト / Scripts

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動 (Turbopack) |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint による静的解析 |
| `npx drizzle-kit push` | DB スキーマを Supabase へ反映 |
| `npx drizzle-kit studio` | Drizzle Studio でデータ確認 |

---

<a name="english"></a>

## English Summary

**Vantage PM** is an in-house project management tool for tracking sales deals, alliances, promotions, and R&D projects in a single platform.

### Key Features
- **Project List** — Manage 4 project types (SALES, ALLIANCE, PROMO, RD) with revenue forecasts and probability
- **Sales Kanban Board** — Drag & drop to move deals through pipeline stages (Lead → Planning → Proposal → Won/Lost)
- **Gantt Chart** — Visualize task schedules with color-coded gradient bars
- **Dark / Light Mode** — Defaults to dark mode; toggle via header button
- **Bilingual UI** — Instant JA/EN switching via the header slider tab

### Quick Start
```bash
npm install
cp .env.local.example .env.local  # Fill in Supabase & NextAuth credentials
npx drizzle-kit push               # Apply DB migrations
npm run dev                        # Start dev server at http://localhost:3000
```

### Tech Highlights
- **Next.js 16** App Router with Turbopack for fast HMR
- **HeroUI** + **Tremor** hybrid UI — rich interactive components + data visualization
- **Drizzle ORM** + **Supabase** PostgreSQL for type-safe database access
- **Tailwind CSS v4** with `oklch` color palette for perceptually uniform theming
- **next-intl** for server-side i18n with locale routing (`/ja/*`, `/en/*`)
