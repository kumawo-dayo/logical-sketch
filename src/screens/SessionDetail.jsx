import { useState, useEffect } from 'react'

const SCORE_LABELS = {
  line: '線の精度',
  ellipse: '楕円対称性',
  proportion: '形の再現率',
  balance: '全体バランス',
  drillApplied: 'ドリルの成果',
}

function ScoreBar({ label, score }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{score}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
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

  const dateLabel = session.date
    ? new Date(session.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
    : ''

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-blue-600 font-medium text-sm">← 戻る</button>
        <span className="font-semibold text-gray-900 text-base">
          {dateLabel} の投稿
        </span>
      </header>

      <div className="p-4 space-y-4 pb-8">
        {session.taskText && (
          <div className="bg-blue-50 rounded-xl px-3 py-2 text-sm text-blue-700">
            課題：{session.taskText}
          </div>
        )}

        {imageUrl && (
          <div className="rounded-2xl overflow-hidden">
            <img src={imageUrl} alt="スケッチ" className="w-full object-contain max-h-72" />
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <div className="text-5xl font-bold text-blue-600">{total}</div>
          <div className="text-sm text-gray-400 mt-1">/ {max}点</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          {Object.entries(scores).map(([key, score]) => (
            <ScoreBar key={key} label={SCORE_LABELS[key] ?? key} score={score} />
          ))}
        </div>

        {(session.feedback ?? []).length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            {session.feedback.map((item, i) => (
              <div key={i}>
                <div className="text-sm font-semibold text-gray-800 mb-1">{item.item}</div>
                <div className="text-sm text-gray-600 leading-relaxed">{item.comment}</div>
              </div>
            ))}
          </div>
        )}

        {session.praise && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <div className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wide">
              今回良かった点
            </div>
            <div className="text-sm text-green-900 leading-relaxed">{session.praise}</div>
          </div>
        )}

        {session.improvement && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <div className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">
              次回の改善ポイント
            </div>
            <div className="text-sm text-amber-900 leading-relaxed">{session.improvement}</div>
          </div>
        )}

        {session.svg && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">図解</div>
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
