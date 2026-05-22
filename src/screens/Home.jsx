import { useState, useEffect, useRef } from 'react'
import { db } from '../lib/db'
import { getCurrentTask, getWeekReview, getWeekTasks } from '../lib/curriculum'
import { askQuestion } from '../lib/claude'

function computeUserStats(sessions, task) {
  if (!sessions || sessions.length === 0) return null
  const recent = sessions.slice(0, 10)
  const keys = ['line', 'ellipse', 'proportion', 'balance']
  const scoreLabels = { line: '線の精度', ellipse: '楕円対称性', proportion: '形の再現率', balance: '全体バランス' }
  const avgScores = {}
  for (const key of keys) {
    const vals = recent.filter(s => s.scores?.[key] != null).map(s => s.scores[key])
    avgScores[key] = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : null
  }
  const weakest = keys.filter(k => avgScores[k] != null).sort((a, b) => avgScores[a] - avgScores[b])[0]
  return {
    week: task?.week ?? 1,
    dayNum: task?.dayNum ?? 1,
    taskText: task?.task ?? '',
    totalSessions: sessions.length,
    avgScores,
    weakest: weakest ? scoreLabels[weakest] : null,
  }
}

function QuestionBox({ userStats }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  async function handleSend() {
    const content = input.trim()
    if (!content || loading) return

    const userMsg = { role: 'user', content }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const answer = await askQuestion(
        nextMessages.map(m => ({ role: m.role, content: m.content })),
        userStats
      )
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">コーチに質問する</span>
      </div>

      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-72 overflow-y-auto px-4 py-3 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2.5">
                <span className="flex gap-1 items-center">
                  {[0, 150, 300].map(delay => (
                    <span key={delay} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mx-4 mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
      )}

      <div className="px-4 pb-4 pt-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={messages.length === 0 ? 'フィードバックについて質問する...' : '続けて質問する...'}
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          送信
        </button>
      </div>
    </div>
  )
}

function DayTracker({ week, currentDayOfWeek, tasks, onDaySelect }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-500">Week {week}</span>
        <span className="text-xs text-gray-400">Day {currentDayOfWeek + 1} / 7</span>
      </div>
      <div className="flex gap-1">
        {tasks.map((t, i) => {
          const isPast = i < currentDayOfWeek
          const isToday = i === currentDayOfWeek
          const circle = (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              ${isToday ? 'bg-blue-600 text-white' : isPast ? 'bg-blue-100 text-blue-400' : 'bg-gray-100 text-gray-400'}`}>
              {isPast ? '✓' : t.dayNum}
            </div>
          )
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {isPast
                ? <button onClick={() => onDaySelect?.(t)} className="active:opacity-70">{circle}</button>
                : circle
              }
            </div>
          )
        })}
      </div>
      <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${(currentDayOfWeek / 6) * 100}%` }}
        />
      </div>
    </div>
  )
}

function WeekFlow({ tasks }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-4 py-3 flex items-center justify-between active:bg-gray-50"
      >
        <span className="text-sm font-semibold text-gray-700">今週の課題の流れ</span>
        <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="border-t border-gray-50 divide-y divide-gray-50">
          {tasks.map((t) => (
            <div key={t.dayOfWeek} className={`flex items-start gap-3 px-4 py-3 ${t.isToday ? 'bg-blue-50' : ''}`}>
              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${t.isToday ? 'bg-blue-600 text-white' : t.isPast ? 'bg-blue-100 text-blue-400' : 'bg-gray-100 text-gray-400'}`}>
                {t.isPast ? '✓' : t.dayNum}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-400 mb-0.5">
                  Day {t.dayNum}
                  {t.isToday && <span className="ml-1.5 text-blue-500">← 今日</span>}
                </div>
                <div className={`text-sm leading-snug ${t.isPast ? 'text-gray-300 line-through' : t.isToday ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {t.task}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SessionThumb({ session, onSelect }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!session.imageBlob) return
    const u = URL.createObjectURL(session.imageBlob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [session.imageBlob])

  const scores = session.scores ?? {}
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const max = Object.keys(scores).length * 10

  return (
    <button
      className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 active:opacity-70 transition-opacity w-full"
      onClick={() => onSelect(session)}
    >
      {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs rounded px-1">
        {total}/{max}
      </div>
    </button>
  )
}

function ReviewThumb({ session, label }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!session?.imageBlob) return
    const u = URL.createObjectURL(session.imageBlob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [session?.imageBlob])

  const scores = session?.scores ?? {}
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const max = Object.keys(scores).length * 10

  return (
    <div className="flex-1 bg-white rounded-xl p-3 shadow-sm text-center">
      <div className="text-xs text-gray-400 mb-2">{label}</div>
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
        {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
      </div>
      <div className="text-xl font-bold text-gray-900">
        {total}<span className="text-xs text-gray-400 font-normal">/{max}</span>
      </div>
    </div>
  )
}

function WeekReview({ review }) {
  if (!review?.hasEnough) {
    return (
      <div className="bg-amber-50 rounded-2xl p-4 text-center text-sm text-amber-700">
        今週のスケッチが2枚以上あると比較表示されます
      </div>
    )
  }

  const firstScores = review.first?.scores ?? {}
  const lastScores = review.last?.scores ?? {}
  const firstTotal = Object.values(firstScores).reduce((a, b) => a + b, 0)
  const lastTotal = Object.values(lastScores).reduce((a, b) => a + b, 0)
  const diff = lastTotal - firstTotal

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <ReviewThumb session={review.first} label="週はじめ" />
        <ReviewThumb session={review.last} label="今週最後" />
      </div>
      <div className={`rounded-xl p-3 text-center font-semibold text-sm ${diff >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        {diff >= 0 ? `+${diff}点 成長！` : `${diff}点`}
      </div>
    </div>
  )
}

export default function Home({ onTaskDetail, onUpload, onProgress, onSessionSelect }) {
  const [task, setTask] = useState(null)
  const [sessions, setSessions] = useState([])
  const [review, setReview] = useState(null)
  const [weekData, setWeekData] = useState(null)

  useEffect(() => {
    function loadAll() {
      getCurrentTask(db).then((t) => {
        setTask(t)
        if (t.isSunday) getWeekReview(db).then(setReview)
      })
      getWeekTasks(db).then(setWeekData)
      db.sessions.orderBy('createdAt').reverse().toArray().then(setSessions)
    }

    loadAll()

    function handleVisibility() {
      if (document.visibilityState === 'visible') loadAll()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-base font-bold text-gray-900">Sketch Trainer</h1>
        <button onClick={onProgress} className="text-sm text-blue-600 font-medium px-2 py-1">
          進捗
        </button>
      </header>

      <div className="p-4 space-y-4 flex-1">
        {/* Day progress tracker */}
        {weekData && (
          <DayTracker
            week={weekData.week}
            currentDayOfWeek={weekData.currentDayOfWeek}
            tasks={weekData.tasks}
            onDaySelect={(dayTask) => onUpload?.(dayTask)}
          />
        )}

        {/* Today's task card - tappable to task detail (except Sunday) */}
        <button
          onClick={task?.isSunday ? undefined : () => onTaskDetail(task, weekData)}
          disabled={task?.isSunday}
          className={`w-full text-left rounded-2xl p-4 text-white transition-opacity active:opacity-80
            ${task?.isSunday ? 'bg-purple-600 cursor-default' : task?.isFriday ? 'bg-orange-500' : task?.isSaturday ? 'bg-teal-600' : 'bg-blue-600'}`}
        >
          <div className="text-xs font-medium opacity-80 mb-1">
            {task
              ? `Week ${task.week} Day ${task.dayNum} · ${new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}`
              : '読み込み中...'}
          </div>
          <div className="text-base font-semibold leading-snug">{task?.task ?? ''}</div>
          {task?.isFriday && (
            <div className="mt-2 text-xs bg-white/20 rounded-lg px-2 py-1 inline-block">
              応用課題 · ドリルの成果も評価されます
            </div>
          )}
          {task?.isSaturday && (
            <div className="mt-2 text-xs bg-white/20 rounded-lg px-2 py-1 inline-block">
              金曜スケッチを再提出して強化フィードバックをもらおう
            </div>
          )}
          {!task?.isSunday && (
            <div className="mt-2 text-xs opacity-60">タップしてアップロード →</div>
          )}
        </button>

        {/* 苦手強化ラベル */}
        {task?.adaptation && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-sm text-red-700 font-medium">
            ⚠ {task.adaptation}
          </div>
        )}

        {/* Sunday review */}
        {task?.isSunday && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">今週の振り返り</h2>
            <WeekReview review={review} />
          </div>
        )}

        {/* Week flow */}
        {weekData && (
          <WeekFlow
            tasks={weekData.tasks.map((t) =>
              t.isToday && task ? { ...t, task: task.task } : t
            )}
          />
        )}

        {/* Question box */}
        <QuestionBox userStats={computeUserStats(sessions, task)} />

        {/* Past sessions */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">過去の投稿</h2>
          {sessions.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-sm">まだ投稿がありません</div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {sessions.map((s) => <SessionThumb key={s.id} session={s} onSelect={onSessionSelect} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
