# logical-sketch

スケッチ練習コーチアプリ。スマホで描いたスケッチを撮影・アップロードすると Claude API が採点・フィードバックを返す。12週間のカリキュラム付き。

## 技術スタック

- React 19 + Vite + Tailwind CSS v4
- IndexedDB（Dexie）でセッションをローカル保存
- Claude API（`claude-sonnet-4-5`）で画像分析
- PWA対応（vite-plugin-pwa）
- `npm run dev` で起動

## ファイル構成

```
src/
  App.jsx                  # 画面ルーティング（home / upload / progress / session）
  screens/
    Home.jsx               # ホーム：今日の課題カード + 過去投稿グリッド
    Upload.jsx             # 投稿画面：画像選択 → Claude API 分析 → フィードバック表示
    Progress.jsx           # 進捗画面：週ごとのスコア折れ線グラフ
    SessionDetail.jsx      # 過去投稿の詳細フィードバック表示
  lib/
    claude.js              # Claude API 呼び出し（analyzeSketch関数）
    curriculum.js          # カリキュラムロジック（週・曜日に応じた課題決定、苦手適応）
    db.js                  # Dexie スキーマ（sessionsテーブル）
```

## DBスキーマ（sessions テーブル）

| フィールド | 型 | 内容 |
|---|---|---|
| id | auto | PK |
| date | string | YYYY-MM-DD |
| week | number | 週番号（1〜12） |
| day | number | 曜日インデックス（0=月） |
| taskText | string | 課題テキスト |
| imageBlob | File | スケッチ画像 |
| scores | object | `{line, ellipse, proportion, balance, drillApplied?}` 各0〜10 |
| feedback | array | `[{item, comment}]` |
| improvement | string | 次回改善ポイント |
| svg | string | 図解SVG文字列 |
| createdAt | number | timestamp |

## カリキュラム仕様

- 月〜木：基礎ドリル（前日スコアが低い項目を優先）
- 金：応用スケッチ課題（週によって異なる対象物）
- 土：金曜スケッチの再提出・強化フィードバック
- 日：週の振り返り（週はじめ vs 最新のスコア比較）
- 全12週、初回投稿日を基準に自動進行

## Claude API の評価軸

通常（月〜木）: `line`, `ellipse`, `proportion`, `balance`
応用（金・土）: 上記 + `drillApplied`（ドリルの成果）

## 環境変数

`.env` に `VITE_ANTHROPIC_API_KEY` が必要。
