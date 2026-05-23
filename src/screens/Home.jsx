import { useState, useEffect, useRef } from 'react'
import { db } from '../lib/db'
import { getCurrentTask, getWeekTasks } from '../lib/curriculum'
import { askQuestion } from '../lib/claude'

const S = {
  ink: '#1C1C18',
  sub: '#807D74',
  hint: '#A8A59C',
  muted: '#B5B2A8',
  accent: '#E85D2F',
  accentDk: '#C44A22',
  accentPale: '#FFF1E8',
  accentPale2: '#FFF6EF',
  accentRing: '#FFE2CC',
  card: '#FFFFFF',
  subtle: '#ECEAE3',
  faint: '#F4F2EC',
  surface: '#F7F5F0',
}

function calcStreak(sessions) {
  const dates = new Set(sessions.map(s => s.date))
  const todayStr = new Date().toISOString().slice(0, 10)
  const yestStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const start = dates.has(todayStr) ? todayStr : dates.has(yestStr) ? yestStr : null
  if (!start) return 0
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(start + 'T12:00:00')
    d.setDate(d.getDate() - i)
    if (dates.has(d.toISOString().slice(0, 10))) streak++
    else break
  }
  return streak
}

const SKILL_TEMPLATE = {
  line:       { focus: '直線の精度', verb: 'が上がる' },
  ellipse:    { focus: '楕円', verb: 'が安定する' },
  proportion: { focus: '比率の精度', verb: 'が上がる' },
  balance:    { focus: '全体バランス', verb: 'が整う' },
}

function getHeroCopy(task) {
  const mins = task?.duration ? Math.floor(task.duration / 60) : 35
  const key = task?.metrics?.[0] ?? 'line'
  const { focus, verb } = SKILL_TEMPLATE[key] ?? SKILL_TEMPLATE.line
  return { mins, focus, verb }
}

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'おはようございます'
  if (h < 18) return 'こんにちは'
  return 'こんばんは'
}

function StreakBadge({ streak }) {
  if (streak === 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: S.accentPale, borderRadius: 14, padding: '5px 10px 5px 8px' }}>
      <i className="ti ti-flame" style={{ color: S.accent, fontSize: 13 }} />
      <b style={{ fontSize: 12, fontWeight: 700, color: S.accentDk }}>{streak}</b>
      <span style={{ fontSize: 10, color: S.accentDk, fontWeight: 500 }}>日連続</span>
    </div>
  )
}

function WeekGrid({ weekData, hasTodaySession }) {
  const { week, currentDayOfWeek, tasks } = weekData
  const completedCount = currentDayOfWeek + (hasTodaySession ? 1 : 0)
  return (
    <div style={{ padding: '0 22px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontSize: 10, letterSpacing: '0.16em', color: S.sub, fontWeight: 600, textTransform: 'uppercase' }}>
          Week {week}
        </span>
        <span style={{ fontSize: 11, color: S.ink, fontWeight: 600 }}>
          {completedCount}<span style={{ color: S.sub, fontWeight: 500 }}> / 7 日</span>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
        {tasks.map((t, i) => {
          const isDone = i < currentDayOfWeek || (i === currentDayOfWeek && hasTodaySession)
          const isToday = i === currentDayOfWeek && !isDone
          return (
            <div
              key={i}
              style={{
                aspectRatio: '1',
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                background: isDone ? S.ink : isToday ? S.card : S.subtle,
                color: isDone ? '#fff' : isToday ? S.accent : S.muted,
                border: isToday ? `2px solid ${S.accent}` : 'none',
              }}
            >
              {isDone
                ? <i className="ti ti-check" style={{ fontSize: 13 }} />
                : t.dayNum}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TaskHeroCard({ task, weekData, onStart }) {
  const { mins, focus, verb } = getHeroCopy(task)
  const todayLabel = new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
  return (
    <div style={{
      margin: '0 16px 14px',
      background: S.ink,
      borderRadius: 20,
      padding: '22px 22px 20px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: -40, top: -40, width: 140, height: 140, borderRadius: '50%', background: '#2A2A24' }} />
      <div style={{ display: 'flex', gap: 5, marginBottom: 14, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', padding: '4px 9px', borderRadius: 10, background: S.accent, color: '#fff' }}>TODAY</span>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', padding: '4px 9px', borderRadius: 10, background: 'rgba(255,255,255,0.12)', color: '#F7F5F0' }}>
          Day {task?.dayNum} · {todayLabel}
        </span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.55, marginBottom: 6, position: 'relative', zIndex: 1 }}>
        {task?.task ?? ''}
      </div>
      <div style={{ fontSize: 12, color: S.muted, lineHeight: 1.55, marginBottom: 16, position: 'relative', zIndex: 1 }}>
        {task?.goal ?? ''}
      </div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, position: 'relative', zIndex: 1 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: S.muted, fontWeight: 500 }}>
          <i className="ti ti-clock" style={{ fontSize: 13, color: '#76746C' }} />{mins}分
        </span>
        {task?.tips?.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: S.muted, fontWeight: 500 }}>
            <i className="ti ti-list-numbers" style={{ fontSize: 13, color: '#76746C' }} />{task.tips.length}ステップ
          </span>
        )}
      </div>
      <button
        onClick={onStart}
        style={{
          width: '100%', background: S.accent, color: '#fff', border: 'none', borderRadius: 12,
          padding: 15, fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, fontWeight: 600,
          letterSpacing: '0.03em', cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 7, position: 'relative', zIndex: 1,
        }}
      >
        始める<i className="ti ti-arrow-right" style={{ fontSize: 15 }} />
      </button>
    </div>
  )
}

function CoachCard({ improvement, onClick }) {
  if (!improvement) return null
  return (
    <div
      onClick={onClick}
      style={{
        margin: '0 16px 14px',
        background: S.accentPale2,
        border: `1px solid ${S.accentRing}`,
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        gap: 11,
        alignItems: 'flex-start',
        cursor: 'pointer',
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 9, background: S.accentRing, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: S.accentDk }}>
        <i className="ti ti-bulb" style={{ fontSize: 16 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: S.accentDk, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3, textTransform: 'uppercase' }}>
          前回のコーチコメント
        </div>
        <div style={{ fontSize: 13, color: S.ink, lineHeight: 1.45, fontWeight: 500 }}>
          {improvement}
        </div>
      </div>
    </div>
  )
}

function GrowthCard({ session, isPlaceholder, label, subLabel, onClick }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!session?.imageBlob) return
    const u = URL.createObjectURL(session.imageBlob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [session?.imageBlob])

  const total = session ? Object.values(session.scores ?? {}).reduce((a, b) => a + b, 0) : 0
  const dateStr = session?.date ? new Date(session.date + 'T12:00:00').toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) : ''

  return (
    <div
      onClick={onClick}
      style={{ background: S.card, borderRadius: 13, padding: 10, border: `1px solid ${S.subtle}`, cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{
        width: '100%', aspectRatio: '1', borderRadius: 7,
        background: isPlaceholder ? S.faint : S.subtle,
        marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {url
          ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : isPlaceholder
            ? <i className="ti ti-plus" style={{ fontSize: 18, color: '#C4C0B5' }} />
            : <span style={{ fontSize: 10, fontWeight: 600, color: S.sub, letterSpacing: '0.1em' }}>DAY 1</span>
        }
      </div>
      <div style={{ fontSize: 11, color: S.ink, fontWeight: 600, marginBottom: 2 }}>
        {isPlaceholder ? '今日アップロード' : (label || dateStr)}
      </div>
      <div style={{ fontSize: 10, color: S.sub }}>
        {isPlaceholder ? '課題完了後' : subLabel || `${dateStr} · ${total}点`}
      </div>
    </div>
  )
}

function QuestionBox({ userStats }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef()

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, loading])

  async function handleSend() {
    const content = input.trim()
    if (!content || loading) return
    const userMsg = { role: 'user', content }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    setError(null)
    try {
      const answer = await askQuestion(next.map(m => ({ role: m.role, content: m.content })), userStats)
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ margin: '0 16px 14px', background: S.card, borderRadius: 14, border: `1px solid ${S.subtle}`, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${S.subtle}`, display: 'flex', alignItems: 'center', gap: 7 }}>
        <i className="ti ti-message-circle-2" style={{ fontSize: 14, color: S.sub }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: S.ink }}>コーチに質問する</span>
      </div>
      {messages.length > 0 && (
        <div ref={scrollRef} style={{ maxHeight: 288, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '82%', borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                padding: '10px 13px', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                background: msg.role === 'user' ? S.ink : S.subtle,
                color: msg.role === 'user' ? '#fff' : S.ink,
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ background: S.subtle, borderRadius: '14px 14px 14px 2px', padding: '10px 13px', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 150, 300].map(d => (
                  <span key={d} className="animate-bounce" style={{ width: 6, height: 6, background: S.hint, borderRadius: '50%', display: 'inline-block', animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {error && (
        <div style={{ margin: '0 16px 8px', background: '#FBEBEB', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#B83838' }}>
          {error}
        </div>
      )}
      <div style={{ padding: '12px 16px 16px', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={messages.length === 0 ? 'コーチに質問する...' : '続けて質問する...'}
          style={{
            flex: 1, borderRadius: 11, border: `1px solid ${S.subtle}`, background: S.faint,
            padding: '10px 14px', fontSize: 13, color: S.ink, fontFamily: "'Noto Sans JP', sans-serif",
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{
            borderRadius: 11, background: input.trim() && !loading ? S.ink : S.subtle,
            color: input.trim() && !loading ? '#fff' : S.hint,
            border: 'none', padding: '10px 16px', fontSize: 13, fontWeight: 600,
            fontFamily: "'Noto Sans JP', sans-serif", cursor: input.trim() && !loading ? 'pointer' : 'default',
            transition: 'all 0.15s',
          }}
        >
          送信
        </button>
      </div>
    </div>
  )
}

export default function Home({ onTaskDetail, onUpload, onSessionSelect, onProgress, onFeedbackTab }) {
  const [task, setTask] = useState(null)
  const [sessions, setSessions] = useState([])
  const [weekData, setWeekData] = useState(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    function loadAll() {
      Promise.all([
        getCurrentTask(db),
        getWeekTasks(db),
        db.sessions.orderBy('createdAt').reverse().toArray(),
      ]).then(([t, wd, ss]) => {
        setTask(t)
        setWeekData(wd)
        setSessions(ss)
        setStreak(calcStreak(ss))
      })
    }
    loadAll()
    function onVisible() { if (document.visibilityState === 'visible') loadAll() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const todayStr = new Date().toISOString().slice(0, 10)
  const hasTodaySession = sessions.some(s => s.date === todayStr)
  const firstSession = sessions.length > 0 ? sessions[sessions.length - 1] : null
  const lastSession = sessions.length > 0 ? sessions[0] : null
  const lastImprovement = lastSession?.improvement ?? null

  const userStats = sessions.length > 0 && task ? {
    week: task.week ?? 1,
    dayNum: task.dayNum ?? 1,
    taskText: task.task ?? '',
    totalSessions: sessions.length,
    avgScores: (() => {
      const keys = ['line', 'ellipse', 'proportion', 'balance']
      const avgs = {}
      for (const k of keys) {
        const vals = sessions.slice(0, 10).filter(s => s.scores?.[k] != null).map(s => s.scores[k])
        avgs[k] = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
      }
      return avgs
    })(),
    weakest: null,
  } : null

  const { mins, focus, verb } = getHeroCopy(task)
  const todayLabel = new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: S.surface, fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '48px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: S.ink, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: S.accent }} />
          LOGICAL SKETCH
        </div>
        <StreakBadge streak={streak} />
      </div>

      {/* Hero copy */}
      <div style={{ padding: '6px 22px 24px' }}>
        <div style={{ fontSize: 12, color: S.sub, marginBottom: 6, fontWeight: 500 }}>{greeting()}</div>
        <h1 style={{ margin: 0, fontSize: 22, lineHeight: 1.4, color: S.ink, fontWeight: 700, letterSpacing: '-0.01em' }}>
          今日の{' '}
          <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: S.accent, fontSize: 24 }}>
            {mins}分
          </em>
          {' '}で<br />{focus}{verb}。
        </h1>
      </div>

      {/* Week grid */}
      {weekData && <WeekGrid weekData={weekData} hasTodaySession={hasTodaySession} />}

      {/* Task hero card */}
      {task && (
        <TaskHeroCard
          task={task}
          weekData={weekData}
          onStart={() => onTaskDetail(task, weekData)}
        />
      )}

      {/* Coach comment */}
      <CoachCard improvement={lastImprovement} onClick={onFeedbackTab} />

      {/* Growth section */}
      <div style={{ padding: '14px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.16em', color: S.sub, fontWeight: 600, textTransform: 'uppercase' }}>
            あなたの成長
          </span>
          <button
            onClick={onProgress}
            style={{ fontSize: 11, color: S.ink, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            すべて見る<i className="ti ti-chevron-right" style={{ fontSize: 12 }} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <GrowthCard
            session={firstSession}
            label="最初のスケッチ"
            subLabel={firstSession ? `${new Date(firstSession.date + 'T12:00:00').toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })} · ${Object.values(firstSession.scores ?? {}).reduce((a, b) => a + b, 0)}点` : ''}
            onClick={firstSession ? () => onSessionSelect(firstSession) : undefined}
          />
          <GrowthCard
            session={hasTodaySession ? lastSession : null}
            isPlaceholder={!hasTodaySession}
            label={hasTodaySession ? '今日' : undefined}
            onClick={hasTodaySession && lastSession ? () => onSessionSelect(lastSession) : undefined}
          />
        </div>
      </div>

      {/* Question box */}
      <div style={{ padding: '0 0 8px' }}>
        <div style={{ padding: '14px 22px 10px' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.16em', color: S.sub, fontWeight: 600, textTransform: 'uppercase' }}>
            コーチに聞く
          </span>
        </div>
        <QuestionBox userStats={userStats} />
      </div>
    </div>
  )
}
