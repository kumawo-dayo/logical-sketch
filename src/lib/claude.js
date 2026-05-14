const SYSTEM_PROMPT = `あなたはスケッチ練習のコーチです。
初心者のスケッチを分析し、以下のJSON形式のみで返してください。他のテキストは一切含めないでください。

{
  "scores": {
    "line": 0から10の整数,
    "ellipse": 0から10の整数,
    "proportion": 0から10の整数,
    "balance": 0から10の整数
  },
  "feedback": [
    { "item": "線の精度", "comment": "具体的な指摘" },
    { "item": "楕円対称性", "comment": "具体的な指摘" },
    { "item": "形の再現率", "comment": "具体的な指摘" },
    { "item": "全体バランス", "comment": "具体的な指摘" }
  ],
  "improvement": "次回への改善ポイント1〜2個",
  "svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>...</svg>"
}

svg要素について：
- 問題箇所の「描き方の原則」を図解する
- 対象物の正解画像ではなく、線の引き方・軸の取り方・腕の動かし方などの技術的解決策を図示
- シンプルなSVG（viewBox="0 0 100 100"）、strokeのみ使用、背景なし`

export async function analyzeSketch(imageBase64, mimeType, taskText, week) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('.envにVITE_ANTHROPIC_API_KEYが設定されていません')
  }

  const res = await fetch('/api/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `今日の課題: ${taskText}\n現在の週数: Week ${week}`,
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
