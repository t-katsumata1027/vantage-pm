# 📋 vantage-pm 要件定義書 (MVP)

案件管理、アライアンス、自社プロジェクト（広報・R&D）を統合管理するための汎用的な業務管理ツール。
「進捗管理」と「リソース工数（人的・システム）」を紐付け、案件ごとの採算性とチームのリソース配分を可視化する。

---

## 1. プロジェクト概要
* **ターゲットユーザー:** 10名程度のチーム（管理・営業・データ企画）
* **開発コンセプト:** AIによる高速開発（Vibe Coding）、shadcn/ui によるプレミアムな UI/UX。
* **多言語対応:** 日英バイリンガル対応済。

---

## 2. 技術スタック
| 区分 | 選定技術 | 備考 |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Vercelデプロイ、Turbopack による高速な開発 |
| **Database** | Supabase (PostgreSQL) | RLSによるセキュアなアクセス管理 |
| **ORM** | Drizzle ORM | タイプセーフな DB 操作 |
| **Auth** | NextAuth.js v4 | メール/パスワード認証、ドメイン制限付き |
| **UI Library** | Tailwind CSS v4 + shadcn/ui | HeroUI からの完全移行により、洗練された統一デザインを実現 |
| **i18n** | next-intl | 日英切り替え |

---

## 3. 機能要件

### 3.1 認証・セキュリティ
* **会社ドメイン制限:** 特定のドメイン以外のメールアドレスによる登録を制限。
* **セッション管理:** NextAuth.js による堅牢な認証フロー。
* **プロフィール管理:** ユーザー自身によるアバター（画像・色）および表示名の編集。

### 3.2 案件管理（4種別）
* **SALES (販売):** 売上金額、受注確度、見積工数を管理。カンバンボードでの運用。
* **ALLIANCE (協業):** 案件一覧および詳細管理。
* **PROMO (広報/展示会):** イベント・広報案件の管理。
* **R&D (研究開発):** 技術検証・研究テーマの管理。

### 3.3 進捗管理・視覚化
* **販売カンバン:** ステータスごとのドラッグ＆ドロップ管理。担当者アバターの表示。
* **ガントチャート:** タスクのスケジュール化と担当者の紐付け。

### 3.4 チーム・メンバー管理
* **組織管理:** チームごとのメンバー編成。アバターシステム（画像のアップロード・イニシャル色選択）。

### 3.5 ダッシュボードと分析
* **全体・チーム・担当者別ビュー:** タブ切り替えにより、多角的なデータ分析が可能。
* **目標管理:** 年間目標に対する達成率（TargetProgressRing）のリアルタイム表示。
* **採算性モニタリング:** 売上実績 vs 累積工数グラフ（Recharts）。

---

## 4. データベース設計 (Final Schema)

### Projects テーブル
- `id`, `name`, `type`, `status`, `revenue`, `probability`, `duration`
- `account_manager_id`: メンバーへの外部キー

### Tasks テーブル
- `id`, `project_id`, `task_type` (HUMAN/SYSTEM), `label`, `status`, `start_date`, `due_date`

### Teams / Members テーブル
- `teams`: `id`, `name`, `description`
- `members`: `id`, `name`, `email`, `team_id`, `avatar_url`, `avatar_color`

---

## 5. 実装ステータス
* [x] **Phase 1:** Next.js + Drizzle + Supabase 基盤。
* [x] **Phase 2:** プロジェクト管理・カンバンUI。
* [x] **Phase 3:** タスク・ガントチャート。
* [x] **Phase 4:** チーム管理および強化されたダッシュボード。
* [x] **UI Migration:** HeroUI から shadcn/ui への完全な移行。