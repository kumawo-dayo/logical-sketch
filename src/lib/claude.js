const SCORE_META = {
  line:       { label: '線の精度' },
  ellipse:    { label: '楕円対称性' },
  proportion: { label: '形の再現率' },
  balance:    { label: '全体バランス' },
}

const COMMENT_FORMAT = `【問題】何が具体的に問題か（「少しズレている」ではなく「右上がりに約5°傾いている」のように数値・方向・箇所を明記）
【原因】なぜそうなっているか（手首を使いすぎ・視点が近すぎるなど、動作・認識レベルで）
【修正動作】明日のウォームアップで試す具体的な行動（「肘を机に固定して10本引く」のように1文で）`

function buildSystemPrompt(metrics) {
  const keys = metrics ?? ['line', 'ellipse', 'proportion', 'balance']
  const scoresLines = keys.map(k => `    "${k}": 0から10の整数`).join(',\n')
  const feedbackLines = keys.map(k =>
    `    { "item": "${SCORE_META[k]?.label ?? k}", "comment": "【問題】...\\n【原因】...\\n【修正動作】..." }`
  ).join(',\n')

  return `あなたはロジカルスケッチ専門の厳格なコーチです。
初心者のスケッチを観察眼を持って分析し、以下のJSON形式のみで返してください。他のテキストは一切含めないでください。

feedbackの各commentは必ず以下の形式で構成してください：
${COMMENT_FORMAT}

{
  "scores": {
${scoresLines}
  },
  "feedback": [
${feedbackLines}
  ],
  "praise": "今回うまくいった点または前回から改善した点を1つ具体的に（必ず何か見つけて書く。「〇〇が△△のレベルに達している」という形で）",
  "improvement": "次回のウォームアップで最も意識する1点（動作レベルで具体的に1文。例：肘を固定して水平線10本）",
  "svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'>...</svg>"
}

svg要素について：
- 左側に「問題のある例」、右側に「正しい例」を並べて比較する形式を推奨
- 短いテキストラベル（5文字以内）を <text> タグで入れてよい
- stroke・fill・textのみ使用、背景なし、viewBox="0 0 200 100"`
}

const FRIDAY_SYSTEM_PROMPT_TEMPLATE = (weekTheme) => `あなたはロジカルスケッチ専門の厳格なコーチです。
これは応用スケッチ課題（金曜・土曜提出）です。
今週の基礎ドリルテーマ：${weekTheme}
通常の4項目評価に加え、今週のドリルで練習したスキルの成果がどれだけ活かされているかを評価してください。
以下のJSON形式のみで返してください。他のテキストは一切含めないでください。

feedbackの各commentは必ず【問題】【原因】【修正動作】の3パートで構成してください。

{
  "scores": {
    "line": 0から10の整数,
    "ellipse": 0から10の整数,
    "proportion": 0から10の整数,
    "balance": 0から10の整数,
    "drillApplied": 0から10の整数
  },
  "feedback": [
    { "item": "線の精度", "comment": "【問題】...\\n【原因】...\\n【修正動作】..." },
    { "item": "楕円対称性", "comment": "【問題】...\\n【原因】...\\n【修正動作】..." },
    { "item": "形の再現率", "comment": "【問題】...\\n【原因】...\\n【修正動作】..." },
    { "item": "全体バランス", "comment": "【問題】...\\n【原因】...\\n【修正動作】..." },
    { "item": "ドリルの成果", "comment": "今週のドリルで練習したスキルがどう活きているか、または活きていないか具体的に" }
  ],
  "praise": "今回うまくいった点または前回から改善した点を1つ具体的に",
  "improvement": "次回のウォームアップで最も意識する1点（動作レベルで1文）",
  "svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'>左に問題例・右に正しい例の比較図解</svg>"
}`

const WEEK_THEMES = {
  1: '直線・楕円の基礎精度',
  2: '直方体と透視（1点・2点）',
  3: '円柱と回転体',
  4: 'ラウンドフォームと製品',
  5: '組み合わせと奥行き',
  6: 'スピードと観察眼',
  7: '人物基礎（シルエット）',
  8: '人物と製品の使用シーン',
  9: '省略と表現速度',
  10: '陰影と立体感（3面明暗法）',
  11: '説明図と情報デザイン',
  12: '総合（デザイン案スケッチ）',
}

export async function analyzeSketch(imageBase64, mimeType, taskText, week, isFridayMode = false, metrics = null) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('.envにVITE_ANTHROPIC_API_KEYが設定されていません')

  const weekTheme = WEEK_THEMES[week] ?? '総合練習'
  const systemPrompt = isFridayMode
    ? FRIDAY_SYSTEM_PROMPT_TEMPLATE(weekTheme)
    : buildSystemPrompt(metrics)

  const res = await fetch('/api/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: imageBase64 },
            },
            {
              type: 'text',
              text: `今日の課題: ${taskText}\n現在の週数: Week ${week}（テーマ：${weekTheme}）`,
            },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `APIエラー (${res.status})`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('フィードバックの解析に失敗しました。もう一度試してください。')

  return JSON.parse(match[0])
}

export async function generatePatternSvg(taskText, successPattern, failPattern) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('APIキーが設定されていません')

  const res = await fetch('/api/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: 'SVGコードのみを返してください。説明文・前置き・```記号は不要です。<svg から始まり </svg> で終わる文字列だけを出力してください。',
      messages: [{
        role: 'user',
        content: `スケッチ課題のNG/OK比較図をSVGで作成してください。

課題：${taskText}
NG例：${failPattern ?? ''}
OK例：${successPattern ?? ''}

条件：viewBox="0 0 200 100"、左にNG（赤系）・右にOK（緑系）、NG/OKラベルをtextタグで記載`,
      }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `APIエラー (${res.status})`)
  }

  const data = await res.json()
  const raw = (data.content?.[0]?.text ?? '').trim()
  // Handle cases where model wraps in markdown code fences
  const unwrapped = raw.replace(/^```(?:svg|xml)?\s*/i, '').replace(/\s*```$/, '').trim()
  const match = unwrapped.match(/<svg[\s\S]*<\/svg>/)
  if (!match) throw new Error('図解の生成に失敗しました。再試行してください。')
  return match[0]
}

// messages: [{role: 'user'|'assistant', content: string}, ...]
export async function askQuestion(messages, userStats) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('.envにVITE_ANTHROPIC_API_KEYが設定されていません')

  const scoreLabels = { line: '線の精度', ellipse: '楕円対称性', proportion: '形の再現率', balance: '全体バランス' }

  const statsText = userStats
    ? `【ユーザー情報】Week ${userStats.week} / Day ${userStats.dayNum}（累計${userStats.totalSessions}枚）、今日の課題：${userStats.taskText || 'なし'}、直近スコア傾向：${
        Object.entries(userStats.avgScores)
          .filter(([, v]) => v != null)
          .map(([k, v]) => `${scoreLabels[k] ?? k} ${v}/10`)
          .join('・')
      }、苦手：${userStats.weakest ?? 'なし'}`
    : ''

  const res = await fetch('/api/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: `あなたはロジカルスケッチの専門コーチです。${statsText}
ユーザーの質問に対して、画塾の先生のように的確・具体的なアドバイスを返してください。
・質問の内容に直接答えることを最優先にする
・「なぜそうなるか（原因）」と「どうすれば直るか（動作レベルの修正）」を必ず含める
・技術的なポイントを1〜2個に絞り、200字以内で簡潔に
・会話の流れを踏まえて回答する`,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `APIエラー (${res.status})`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}
