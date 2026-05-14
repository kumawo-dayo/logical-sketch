# Sketch Trainer — プロジェクト仕様書

## 概要

毎日スケッチ写真をアップしてAIフィードバックをもらう練習管理アプリ。  
スマホブラウザ（max-width: 430px）で動作するReact PWA。バックエンドなし、全データはローカルに保存。

---

## 技術スタック

| 用途 | ライブラリ |
|---|---|
| UIフレームワーク | React + Vite |
| スタイリング | Tailwind CSS（`@tailwindcss/vite`） |
| ローカルDB | IndexedDB（Dexie.js） |
| グラフ | Recharts |
| PWA | vite-plugin-pwa |
| AI分析 | Claude Vision API（claude-sonnet-4-5） |

---

## 画面構成（3画面）

### 1. ホーム画面
- 今日の課題カード（曜日・週番号・課題テキスト）
- 苦手強化ラベル（該当時のみ）
- 「スケッチをアップする」ボタン（日曜は非表示）
- 日曜日のみ：週の振り返り（週はじめ vs 今週最後のサムネイル＋スコア比較）
- 過去の投稿サムネイル一覧（新しい順、スコアをオーバーレイ表示）

### 2. アップロード＆フィードバック画面
- 今日の課題バナー
- 画像選択：「撮影する」「ライブラリから選ぶ」の2ボタン
  - 撮影：`<input type="file" accept="image/*" capture="environment">`
  - ライブラリ：`<input type="file" accept="image/*">`（captureなし）
- フィードバック後は「別の写真でやり直す」ボタンで再選択可
- フィードバック表示：スコア／項目別コメント／改善ポイント／SVG図解

### 3. 進捗画面
- 総投稿数
- 週ごとの合計スコア推移（折れ線グラフ、Recharts）

---

## カリキュラム設計

### 週内の曜日構成

| 曜日（dayOfWeek） | 内容 |
|---|---|
| 月（0） | 基礎ドリル（適応調整あり） |
| 火（1） | 基礎ドリル（適応調整あり） |
| 水（2） | 基礎ドリル（適応調整あり） |
| 木（3） | 基礎ドリル（適応調整あり） |
| 金（4） | 応用スケッチ課題（週別対象物指定） |
| 土（5） | 金曜提出物のフィードバック強化日（金曜プロンプトを使用） |
| 日（6） | 振り返り（週はじめと今週最後のスコアを比較表示） |

### 基礎ドリル（月〜木、drillIndex順）

| index | 内容 |
|---|---|
| 0 | 水平線・垂直線を50本ずつ（定規なし） |
| 1 | 斜線（45°）を50本 |
| 2 | Cカーブを30本（肘を軸に） |
| 3 | 楕円を30個（正円・つぶれ・傾き各10個） |

### 金曜の応用課題（週別）

| 週 | 課題 |
|---|---|
| Week 1〜2 | 箱系（本・スマホ・箱・リモコンから1つ選んで描く） |
| Week 3〜4 | 円柱系（コップ・ボトル・缶から1つ選んで描く） |
| Week 5〜6 | 箱＋円柱の組み合わせ（2つ並べて描く） |
| Week 7〜8 | 複合日用品（ハサミ・財布・メガネなどから1つ） |
| Week 9〜12 | 自由課題（自分で対象物を選ぶ） |

---

## 苦手に合わせた課題の自動調整（適応ロジック）

前日の最新セッションのスコアを参照して月〜木のドリルを決定する。

| 条件 | 翌日の課題 | 表示ラベル |
|---|---|---|
| 線の精度 ≤ 6 かつ 楕円対称性 ≤ 6 | 線のドリル（index 0）を継続 | 苦手強化中：線の精度・楕円対称性 |
| 線の精度 ≤ 6 のみ | 線のドリル（index 0）を継続 | 苦手強化中：線の精度 |
| 楕円対称性 ≤ 6 のみ | 楕円ドリル（index 3）を継続 | 苦手強化中：楕円対称性 |
| 両方 ≥ 7 | 予定通り次の課題（dayOfWeek に対応するindex）に進む | ラベルなし |

ラベルはホーム画面の課題カード直下に赤バナーで表示する。

---

## Claude Vision API 仕様

### エンドポイント

Viteプロキシ経由でCORS回避：

```
フロントエンド → /api/v1/messages → Vite proxy → https://api.anthropic.com/v1/messages
```

必須ヘッダー：
- `x-api-key`: VITE_ANTHROPIC_API_KEY
- `anthropic-version`: 2023-06-01
- `anthropic-dangerous-direct-browser-access`: true（ブラウザ直呼び出しの場合に必要）

### モデル

`claude-sonnet-4-5`

### プロンプト：通常（月〜木）

返答形式：JSONのみ（4項目スコア）

```json
{
  "scores": {
    "line": 0-10,
    "ellipse": 0-10,
    "proportion": 0-10,
    "balance": 0-10
  },
  "feedback": [
    { "item": "線の精度", "comment": "..." },
    { "item": "楕円対称性", "comment": "..." },
    { "item": "形の再現率", "comment": "..." },
    { "item": "全体バランス", "comment": "..." }
  ],
  "improvement": "次回への改善ポイント1〜2個",
  "svg": "<svg ...>...</svg>"
}
```

合計スコアは最大40点。

### プロンプト：金曜・土曜（応用課題モード）

通常の4項目 + 「ドリルの成果（今週の基礎練習がスケッチにどう活きているか）」を追加評価。

```json
{
  "scores": {
    "line": 0-10,
    "ellipse": 0-10,
    "proportion": 0-10,
    "balance": 0-10,
    "drillApplied": 0-10
  },
  "feedback": [...5項目...],
  ...
}
```

合計スコアは最大50点。

### SVG図解の方針

- 対象物の正解画像ではなく、技術的解決策（線の引き方・軸の取り方・腕の動かし方）を図示
- `viewBox="0 0 100 100"`、strokeのみ、背景なし

---

## データ構造（IndexedDB / Dexie）

**テーブル名：** `sessions`

| フィールド | 型 | 内容 |
|---|---|---|
| id | auto increment | PK |
| date | string | YYYY-MM-DD |
| week | number | 1〜12 |
| day | number | dayOfWeek（0=月〜6=日） |
| taskText | string | その日の課題テキスト |
| imageBlob | File | 撮影画像（Blob） |
| scores | object | `{ line, ellipse, proportion, balance, drillApplied? }` |
| feedback | array | `[{ item, comment }]` |
| improvement | string | 改善ポイント |
| svg | string | SVGマークアップ文字列 |
| createdAt | number | Unix timestamp（ms） |

---

## 週・曜日の計算ロジック

初回セッションの`createdAt`を起点として日数で計算する。

```js
daysSinceStart = Math.floor((Date.now() - firstSession.createdAt) / 86400000)
week = Math.min(Math.floor(daysSinceStart / 7) + 1, 12)
dayOfWeek = daysSinceStart % 7  // 0=月, 1=火, ... 6=日
```

セッションが0件の場合はWeek 1・月曜日扱い。

---

## 環境変数

| 変数名 | 用途 |
|---|---|
| VITE_ANTHROPIC_API_KEY | Anthropic APIキー（`.env`に記載、`.gitignore`済み） |

---

## UI方針

- スマホファースト（max-width: 430px）
- シンプル・余計な装飾なし
- APIキー入力UIは画面上に設けない（.envから読む）
- エラーは日本語で表示
- 曜日ごとにカードの色を変える（月〜木:青、金・土:オレンジ、日:紫）

---

## 開発・起動手順

```bash
# 依存インストール
npm install

# 環境変数設定
cp .env.example .env
# VITE_ANTHROPIC_API_KEY=sk-ant-api03-... を記入して保存

# 開発サーバー起動（スマホからはネットワークURLでアクセス）
npm run dev

# ビルド
npm run build
```

スマホでのアクセス：同じWiFiに接続した上で `http://<ローカルIP>:5173` を開く。
