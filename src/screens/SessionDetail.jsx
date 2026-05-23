import { useState, useEffect } from 'react'

const SCORE_LABELS = {
  line: '線の精度',
  ellipse: '楕円対称性',
  proportion: '形の再現率',
  balance: '全体バランス',
  drillApplied: 'ドリルの成果',
}

function scoreGrade(pct) {
  if (pct >= 81) return '優秀'
  if (pct >= 61) return '良好'
  if (pct >= 41) return '練習段階'
  if (pct >= 21) return '初心者標準'
  return '要練習'
}

function ScoreBar({ label, score }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-2xl font-bold text-gray-900">{score}</span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-900 rounded-full transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export default function SessionDetail({ session, onBack }) {
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    if (!session?.imageBlob) return
    const url = URL.createObjectURL(session.imageBlob)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [session?.imageBlob])

  if (!session) return null

  const scores = session.scores ?? {}
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const max = Object.keys(scores).length * 100
  const pct = max > 0 ? Math.round(total / max * 100) : 0

  const dateLabel = session.date
    ? new Date(session.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
    : ''

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-blue-600 font-medium text-sm">← 戻る</button>
        <span className="font-semibold text-gray-900 text-base">
          {dateLabel} の投稿
        </span>
      </header>

      <div className="p-5 space-y-4 pb-8">
        {session.taskText && (
          <div className="text-sm text-gray-400 px-1">
            {session.taskText}
          </div>
        )}

        {imageUrl && (
          <div className="rounded-2xl overflow-hidden">
            <img src={imageUrl} alt="スケッチ" className="w-full object-contain max-h-72" />
          </div>
        )}

        <div className="bg-white rounded-3xl py-10 text-center">
          <div className="text-8xl font-black text-gray-900 leading-none tracking-tight">{total}</div>
          <div className="text-sm text-gray-400 mt-2">/ {max}点</div>
          <div className="mt-5">
            <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-5 py-1.5 rounded-full">
              {scoreGrade(pct)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-5">
          {Object.entries(scores).map(([key, score]) => (
            <ScoreBar key={key} label={SCORE_LABELS[key] ?? key} score={score} />
          ))}
        </div>

        {(session.feedback ?? []).length > 0 && (
          <div className="bg-white rounded-2xl p-6 space-y-6">
            {session.feedback.map((item, i) => (
              <div key={i}>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{item.item}</div>
                <div className="text-sm text-gray-700 leading-relaxed">{item.comment}</div>
              </div>
            ))}
          </div>
        )}

        {session.praise && (
          <div className="bg-white rounded-2xl p-6">
            <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">今回良かった点</div>
            <div className="text-sm text-gray-800 leading-relaxed">{session.praise}</div>
          </div>
        )}

        {session.improvement && (
          <div className="bg-white rounded-2xl p-6">
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">次回の改善ポイント</div>
            <div className="text-sm text-gray-800 leading-relaxed">{session.improvement}</div>
          </div>
        )}

        {session.svg && (
          <div className="bg-white rounded-2xl p-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">図解</div>
            <div
              className="flex justify-center [&>svg]:w-full [&>svg]:max-w-[200px] [&>svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: session.svg }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
