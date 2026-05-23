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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#807D74' }}>{label}</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#1C1C18' }}>{score}</span>
      </div>
      <div style={{ height: 4, background: '#ECEAE3', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: '#E85D2F', borderRadius: 99, transition: 'width 0.7s' }} />
      </div>
    </div>
  )
}

function FeedbackView({ feedback }) {
  const scores = feedback.scores ?? {}
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const max = Object.keys(scores).length * 100
  const pct = max > 0 ? Math.round(total / max * 100) : 0

  const S = {
    card: { background: '#fff', borderRadius: 20, padding: 20, marginBottom: 0 },
    label: { fontSize: 11, fontWeight: 600, color: '#807D74', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 32 }}>
      {/* Score hero */}
      <div style={{ ...S.card, borderRadius: 24, padding: '36px 20px', textAlign: 'center', background: '#1C1C18' }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1, fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>{total}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>/ {max}点</div>
        <div style={{ marginTop: 16 }}>
          <span style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, padding: '6px 18px', borderRadius: 99 }}>
            {scoreGrade(pct)}
          </span>
        </div>
      </div>

      {/* Skill bars */}
      <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {Object.entries(scores).map(([key, score]) => (
          <ScoreBar key={key} label={SCORE_LABELS[key] ?? key} score={score} />
        ))}
      </div>

      {/* Feedback items */}
      <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {(feedback.feedback ?? []).map((item, i) => (
          <div key={i}>
            <div style={S.label}>{item.item}</div>
            <div style={{ fontSize: 14, color: '#3A3834', lineHeight: 1.65 }}>{item.comment}</div>
          </div>
        ))}
      </div>

      {feedback.praise && (
        <div style={S.card}>
          <div style={{ ...S.label, color: '#2E8B57' }}>今回良かった点</div>
          <div style={{ fontSize: 14, color: '#1C1C18', lineHeight: 1.65 }}>{feedback.praise}</div>
        </div>
      )}

      <div style={{ ...S.card, background: '#FFF5F0', border: '1.5px solid #F5C4A8' }}>
        <div style={{ ...S.label, color: '#C24A1E' }}>次回の改善ポイント</div>
        <div style={{ fontSize: 14, color: '#1C1C18', lineHeight: 1.65 }}>{feedback.improvement}</div>
      </div>

      {feedback.svg && (
        <div style={S.card}>
          <div style={S.label}>図解</div>
          <div
            style={{ display: 'flex', justifyContent: 'center' }}
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
      <header style={{ background: '#fff', borderBottom: '1px solid #ECEAE3', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ color: '#1C1C18', fontWeight: 500, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>← 戻る</button>
        <span style={{ fontWeight: 600, color: '#1C1C18', fontSize: 15 }}>スケッチをアップ</span>
      </header>

      <div className="p-4 space-y-4">
        {task && (
          <div style={{ borderRadius: 14, padding: 12, background: task.isFriday || task.isSaturday ? '#FFF5F0' : '#F4F2EC', border: `1px solid ${task.isFriday || task.isSaturday ? '#F5C4A8' : '#ECEAE3'}` }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: task.isFriday || task.isSaturday ? '#C24A1E' : '#807D74' }}>今日の課題：</span>
            <span style={{ fontSize: 14, color: '#1C1C18' }}> {task.task}</span>
            {(task.isFriday || task.isSaturday) && (
              <div style={{ fontSize: 12, color: '#E85D2F', marginTop: 4 }}>ドリルの成果も評価されます</div>
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
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => cameraRef.current?.click()}
              disabled={loading}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: '1px solid #ECEAE3', borderRadius: 20, padding: '16px 8px', fontSize: 14, fontWeight: 500, color: '#1C1C18', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
            >
              <span style={{ fontSize: 26 }}>📷</span>
              撮影する
            </button>
            <button
              onClick={() => libraryRef.current?.click()}
              disabled={loading}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: '1px solid #ECEAE3', borderRadius: 20, padding: '16px 8px', fontSize: 14, fontWeight: 500, color: '#1C1C18', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
            >
              <span style={{ fontSize: 26 }}>🖼</span>
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
            style={{ width: '100%', background: '#E85D2F', color: '#fff', borderRadius: 20, padding: '16px 0', fontSize: 16, fontWeight: 600, border: 'none', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? (
              <>
                <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
                分析中...
              </>
            ) : 'フィードバックをもらう'}
          </button>
        )}

        {feedback && (
          <button
            onClick={() => { setImage(null); setFeedback(null); setError(null) }}
            style={{ width: '100%', background: '#ECEAE3', color: '#3A3834', borderRadius: 20, padding: '12px 0', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}
          >
            別の写真でやり直す
          </button>
        )}

        {error && (
          <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 14, padding: 12, fontSize: 13, color: '#C62828' }}>
            {error}
          </div>
        )}

        {feedback && <FeedbackView feedback={feedback} />}
      </div>
    </div>
  )
}
