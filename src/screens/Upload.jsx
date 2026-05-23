import { useState, useEffect, useRef } from 'react'
import { db } from '../lib/db'
import { analyzeSketch } from '../lib/claude'
import { getCurrentTask } from '../lib/curriculum'

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

function FeedbackView({ feedback }) {
  const scores = feedback.scores ?? {}
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const max = Object.keys(scores).length * 100
  const pct = max > 0 ? Math.round(total / max * 100) : 0

  return (
    <div className="space-y-4 pb-8">
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

      <div className="bg-white rounded-2xl p-6 space-y-6">
        {(feedback.feedback ?? []).map((item, i) => (
          <div key={i}>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{item.item}</div>
            <div className="text-sm text-gray-700 leading-relaxed">{item.comment}</div>
          </div>
        ))}
      </div>

      {feedback.praise && (
        <div className="bg-white rounded-2xl p-6">
          <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">今回良かった点</div>
          <div className="text-sm text-gray-800 leading-relaxed">{feedback.praise}</div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6">
        <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">次回の改善ポイント</div>
        <div className="text-sm text-gray-800 leading-relaxed">{feedback.improvement}</div>
      </div>

      {feedback.svg && (
        <div className="bg-white rounded-2xl p-6">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">図解</div>
          <div
            className="flex justify-center [&>svg]:w-full [&>svg]:max-w-[200px] [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: feedback.svg }}
          />
        </div>
      )}
    </div>
  )
}

export default function Upload({ onBack, task: taskProp = null }) {
  const [task, setTask] = useState(taskProp)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState(null)
  const cameraRef = useRef()
  const libraryRef = useRef()

  useEffect(() => {
    if (!taskProp) {
      getCurrentTask(db).then(setTask)
    }
  }, [taskProp])

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      const base64 = dataUrl.split(',')[1]
      setImage({ file, dataUrl, base64, mimeType: file.type || 'image/jpeg' })
      setFeedback(null)
      setError(null)
    }
    reader.readAsDataURL(file)
    // input をリセットして同じファイルを再選択できるようにする
    e.target.value = ''
  }

  async function handleSubmit() {
    if (!image || !task) return
    setLoading(true)
    setError(null)
    try {
      const isFridayMode = task.isFriday || task.isSaturday
      const result = await analyzeSketch(image.base64, image.mimeType, task.task, task.week, isFridayMode, task.metrics, task.isAssessment)
      setFeedback(result)
      await db.sessions.add({
        date: new Date().toISOString().slice(0, 10),
        week: task.week,
        day: task.dayOfWeek,
        taskText: task.task,
        imageBlob: image.file,
        scores: result.scores,
        feedback: result.feedback,
        praise: result.praise,
        improvement: result.improvement,
        svg: result.svg,
        createdAt: Date.now(),
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-blue-600 font-medium text-sm">← 戻る</button>
        <span className="font-semibold text-gray-900 text-base">スケッチをアップ</span>
      </header>

      <div className="p-4 space-y-4">
        {task && (
          <div className={`rounded-xl p-3 ${task.isFriday || task.isSaturday ? 'bg-orange-50' : 'bg-blue-50'}`}>
            <span className={`text-xs font-semibold ${task.isFriday || task.isSaturday ? 'text-orange-600' : 'text-blue-600'}`}>
              今日の課題：
            </span>
            <span className="text-sm text-gray-700"> {task.task}</span>
            {(task.isFriday || task.isSaturday) && (
              <div className="text-xs text-orange-500 mt-1">ドリルの成果も評価されます</div>
            )}
          </div>
        )}

        {/* Image preview */}
        {image && (
          <div className="rounded-2xl overflow-hidden">
            <img src={image.dataUrl} alt="スケッチプレビュー" className="w-full object-contain max-h-72" />
          </div>
        )}

        {/* Image picker buttons */}
        {!feedback && (
          <div className="flex gap-3">
            <button
              onClick={() => cameraRef.current?.click()}
              disabled={loading}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-white border border-gray-200 rounded-2xl py-4 text-sm font-medium text-gray-700 active:bg-gray-50 disabled:opacity-50"
            >
              <span className="text-2xl">📷</span>
              撮影する
            </button>
            <button
              onClick={() => libraryRef.current?.click()}
              disabled={loading}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-white border border-gray-200 rounded-2xl py-4 text-sm font-medium text-gray-700 active:bg-gray-50 disabled:opacity-50"
            >
              <span className="text-2xl">🖼</span>
              ライブラリ
            </button>
          </div>
        )}

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        <input ref={libraryRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        {/* Submit */}
        {image && !feedback && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-2xl py-4 text-base font-semibold disabled:opacity-50 active:opacity-80"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                分析中...
              </span>
            ) : 'フィードバックをもらう'}
          </button>
        )}

        {/* Retry */}
        {feedback && (
          <button
            onClick={() => { setImage(null); setFeedback(null); setError(null) }}
            className="w-full bg-gray-100 text-gray-700 rounded-2xl py-3 text-sm font-medium active:opacity-80"
          >
            別の写真でやり直す
          </button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {feedback && <FeedbackView feedback={feedback} />}
      </div>
    </div>
  )
}
