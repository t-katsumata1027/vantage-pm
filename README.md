# Vantage PM — プロジェクト管理ツール

> **Vantage PM** は、販売案件・アライアンス・広報・研究開発など多様な案件を一元管理するための、社内向けプロジェクト管理 (PM) ツールです。

English summary: [→ See English section below](#english)

---

## コンセプト / Concept

営業チームやエンジニア部門が共通のプラットフォームで案件を管理し、工数・売上・進捗を可視化することで、意思決定のスピードと精度を高めることを目的としています。

- **高度なダッシュボード**: 売上目標の達成率やチーム・担当者ごとのパフォーマンスをリアルタイムに可視化
- **案件種別に応じたビュー**: 販売案件はカンバンボードで進捗管理、工数はガントチャートで可視化
- **チーム・メンバー管理**: 組織構造に合わせたチーム編成とアバター管理
- **日英バイリンガル UI**: ヘッダーのスライダーで日本語 / 英語を切り替え
- **ダーク / ライトモード**: デフォルトはダークモード、ヘッダーのトグルで切り替え可能
- **プレミアムデザイン**: shadcn/ui (Tailwind CSS v4) をベースとした一貫性のある洗練されたデザイン

---

## 技術スタック / Tech Stack

| カテゴリ | ライブラリ / サービス |
|---|---|
| フレームワーク | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| 言語 | TypeScript 5 |
| UI ライブラリ | [shadcn/ui](https://ui.shadcn.com/) (Radix UI) |
| データ可視化 | [Recharts](https://recharts.org/) |
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

### 📊 強化されたダッシュボード (Dashboard)
- **タブ切り替え**: 「全体」「チーム別」「担当者別」の 3 つのビューでパフォーマンスを分析
- **目標達成リング**: 年間売上目標に対する現在の達成状況を視覚的に可視化
- **KPI カード**: パイプライン総額、受注実績、勝率、総工数などを集約

### 📋 案件一覧 (Projects)
- 販売 (SALES) / アライアンス (ALLIANCE) / 広報 (PROMO) / 研究開発 (RD) の 4 種別を管理
- 売上予測・受注確度・期間を登録して一覧で俯瞰
- shadcn/ui ベースの洗練されたデータテーブルとバッジ表示

### 🗂 販売カンバンボード (Sales Kanban)
- ドラッグ＆ドロップでステータスを移動 (`リード → 計画中 → 提案中 → 受注 / 失注`)
- 案件ごとに担当者アバターを表示し、誰が何を持っているか一目で把握
- 確度に応じた確率カラー表示

### 📅 タスク管理・ガントチャート (Tasks / Gantt)
- プロジェクトに紐づくタスク（人的タスク / システムタスク）を登録
- 開始日・期日を設定してガントチャートで進捗を視覚化
- 担当者のアバターをチャート上に表示

### 👥 チーム・メンバー管理
- チームの作成・編集およびメンバーの所属管理
- 独自のアバターシステム（画像アップロード ＆ イニシャル背景色選択）
- ログイン中のユーザー自身によるプロフィール編集

---

## データベース設計 / Database Schema

```
projects          tasks              teams             members
─────────────     ─────────────      ─────────────     ─────────────
id (UUID PK)      id (UUID PK)       id (UUID PK)      id (UUID PK)
name              project_id (FK)    name              name
type              task_type          description       email
status            label              ...               team_id (FK)
revenue           status                               avatar_url
probability       start_date                           avatar_color
duration          due_date                             ...
account_manager_id (FK)
```

- **account_manager_id**: 案件の主担当者をメンバーテーブルへ紐付け
- **custom_fields**: JSONB カラムにより、案件ごとの柔軟な見積もり項目に対応
- **teams / members**: 組織構造を管理し、ダッシュボードでの集計単位として活用

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

# Supabase Public Keys
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...

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

---

## ディレクトリ構成 / Project Structure

```
src/
├── app/
│   ├── [locale]/           # i18n ルーティング (ja / en)
│   │   ├── dashboard/      # 強化されたダッシュボード
│   │   ├── members/        # チーム・メンバー管理
│   │   ├── profile/        # プロフィール編集
│   │   └── layout.tsx      # 共通レイアウト (Session, Theme, i18n)
├── components/
│   ├── dashboard/          # 分析チャート、達成率リング
│   ├── layout/             # ユーザーメニュー、言語切替
│   ├── projects/           # カンバン、データテーブル
│   ├── tasks/              # ガントチャート
│   └── ui/                 # カスタマイズされた shadcn/ui 部品
├── actions/                # Server Actions (タイプセーフな DB 操作)
├── lib/
│   └── db/
│       └── schema.ts       # 拡張された Drizzle スキーマ
└── messages/               # 日英の翻訳辞書ファイル
```

---

<a name="english"></a>

## English Summary

**Vantage PM** is a high-end project management platform built for modern teams to track sales pipelines, alliances, task schedules, and operational performance in a bilingual environment.

### Key Features
- **Enhanced Dashboard** — Tabbed views for "Overall", "Teams", and "Members" performance with target achievement visualization.
- **Sales Kanban Board** — Visual pipeline management with deal probability and assigned owner avatars.
- **Team & Member Management** — CRUD operations for organizational structure and a customizable avatar system.
- **Gantt Chart** — Interactive task scheduling with assigned member integration.
- **Universal shadcn/ui Migration** — Consistent, premium UI/UX design powered by Tailwind CSS v4.

### Tech Highlights
- **Next.js 16** App Router with Turbopack.
- **shadcn/ui** components for a high-quality interactive experience.
- **Drizzle ORM** + **Supabase** (PostgreSQL) for a robust and type-safe data layer.
- **next-intl** for server-side bilingual routing.
- **Tailwind CSS v4** with `oklch` colors for perceptually uniform theming.
