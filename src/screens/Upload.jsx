import { useState, useEffect, useRef } from 'react'
import { db } from '../lib/db'
import { analyzeSketch } from '../lib/claude'
import { getCurrentTask } from '../lib/curriculum'

const SCORE_LABELS = {
  line: '線の精度',
  ellipse: '楕円対称性',
  proportion: '形の再現率',
  balance: '全体バランス',
}

function ScoreBar({ label, score }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{score}/10</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  )
}

function FeedbackView({ feedback }) {
  const total = Object.values(feedback.scores).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4 pb-8">
      {/* Total score */}
      <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
        <div className="text-5xl font-bold text-blue-600">{total}</div>
        <div className="text-sm text-gray-400 mt-1">/ 40点</div>
      </div>

      {/* Score breakdown */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        {Object.entries(feedback.scores).map(([key, score]) => (
          <ScoreBar key={key} label={SCORE_LABELS[key]} score={score} />
        ))}
      </div>

      {/* Item comments */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        {feedback.feedback.map((item, i) => (
          <div key={i}>
            <div className="text-sm font-semibold text-gray-800 mb-1">{item.item}</div>
            <div className="text-sm text-gray-600 leading-relaxed">{item.comment}</div>
          </div>
        ))}
      </div>

      {/* Improvement tip */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <div className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">
          次回の改善ポイント
        </div>
        <div className="text-sm text-amber-900 leading-relaxed">{feedback.improvement}</div>
      </div>

      {/* SVG illustration */}
      {feedback.svg && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">図解</div>
          <div
            className="flex justify-center [&>svg]:w-full [&>svg]:max-w-[200px] [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: feedback.svg }}
          />
        </div>
      )}
    </div>
  )
}

export default function Upload({ onBack }) {
  const [task, setTask] = useState(null)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    getCurrentTask(db).then(setTask)
  }, [])

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
      setSaved(false)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!image || !task) return
    setLoading(true)
    setError(null)
    try {
      const result = await analyzeSketch(image.base64, image.mimeType, task.task, task.week)
      setFeedback(result)
      await db.sessions.add({
        date: new Date().toISOString().slice(0, 10),
        week: task.week,
        day: task.day,
        taskText: task.task,
        imageBlob: image.file,
        scores: result.scores,
        feedback: result.feedback,
        improvement: result.improvement,
        svg: result.svg,
        createdAt: Date.now(),
      })
      setSaved(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-blue-600 font-medium text-sm">
          ← 戻る
        </button>
        <span className="font-semibold text-gray-900 text-base">スケッチをアップ</span>
      </header>

      <div className="p-4 space-y-4">
        {/* Today's task */}
        {task && (
          <div className="bg-blue-50 rounded-xl p-3">
            <span className="text-xs font-semibold text-blue-600">今日の課題：</span>
            <span className="text-sm text-gray-700"> {task.task}</span>
          </div>
        )}

        {/* Image picker area */}
        <div
          onClick={() => !loading && inputRef.current?.click()}
          className={`rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed transition-colors
            ${image ? 'border-transparent' : 'border-gray-200 hover:border-gray-300'}
            ${loading ? 'cursor-not-allowed' : ''}`}
        >
          {image ? (
            <img
              src={image.dataUrl}
              alt="スケッチプレビュー"
              className="w-full object-contain max-h-72"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm">タップして写真を選ぶ</div>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Submit button */}
        {image && !feedback && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-2xl py-4 text-base font-semibold disabled:opacity-50 active:opacity-80 transition-opacity"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                分析中...
              </span>
            ) : (
              'フィードバックをもらう'
            )}
          </button>
        )}

        {/* Retry button after feedback */}
        {feedback && (
          <button
            onClick={() => {
              setImage(null)
              setFeedback(null)
              setError(null)
            }}
            className="w-full bg-gray-100 text-gray-700 rounded-2xl py-3 text-sm font-medium active:opacity-80"
          >
            別の写真でやり直す
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Feedback */}
        {feedback && <FeedbackView feedback={feedback} />}
      </div>
    </div>
  )
}
