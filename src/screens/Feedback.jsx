import { useState, useEffect, useRef } from 'react'
import { db } from '../lib/db'
import { askQuestion } from '../lib/claude'

/* ─── design tokens ─────────────────────────────────────────── */
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
  ok: '#3D7A35',
  okBg: '#EEF5EA',
  okRing: '#D2E5C7',
  ng: '#B83838',
  ngBg: '#FBEBEB',
}

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

/* ─── streak badge (shared) ────────────────────────────────── */
function StreakBadge({ streak }) {
  if (!streak) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: S.accentPale, borderRadius: 14, padding: '5px 10px 5px 8px' }}>
      <i className="ti ti-flame" style={{ color: S.accent, fontSize: 13 }} />
      <b style={{ fontSize: 12, fontWeight: 700, color: S.accentDk }}>{streak}</b>
      <span style={{ fontSize: 10, color: S.accentDk, fontWeight: 500 }}>日連続</span>
    </div>
  )
}

/* ─── brand header bar (same as Home / Progress) ───────────── */
function BrandBar({ streak }) {
  return (
    <div style={{ padding: '48px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: S.ink, display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: S.accent }} />
        LOGICAL SKETCH
      </div>
      <StreakBadge streak={streak} />
    </div>
  )
}

/* ─── nav back (overlay mode) ────────────────────────────────── */
function NavBack({ onBack }) {
  return (
    <div
      onClick={onBack}
      style={{ padding: '48px 22px 0', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}
    >
      <i className="ti ti-arrow-left" style={{ fontSize: 15, color: S.ink }} />
      <span style={{ fontSize: 13, color: S.ink, fontWeight: 500 }}>戻る</span>
    </div>
  )
}

/* ─── coach question box ─────────────────────────────────────── */
function QuestionBox({ session }) {
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
      const userStats = session ? {
        week: session.week ?? 1, dayNum: session.day ?? 1,
        taskText: session.taskText ?? '', totalSessions: 1,
        avgScores: session.scores ?? {}, weakest: null,
      } : null
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
                maxWidth: '82%', padding: '10px 13px', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                background: msg.role === 'user' ? S.ink : S.subtle,
                color: msg.role === 'user' ? '#fff' : S.ink,
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex' }}>
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
        <div style={{ margin: '0 16px 8px', background: S.ngBg, borderRadius: 10, padding: '8px 12px', fontSize: 12, color: S.ng }}>{error}</div>
      )}
      <div style={{ padding: '12px 16px 16px', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="フィードバックについて質問する..."
          style={{
            flex: 1, borderRadius: 11, border: `1px solid ${S.subtle}`, background: S.faint,
            padding: '10px 14px', fontSize: 13, color: S.ink, fontFamily: "'Noto Sans JP', sans-serif", outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{
            borderRadius: 11, border: 'none', padding: '10px 16px', fontSize: 13, fontWeight: 600,
            fontFamily: "'Noto Sans JP', sans-serif", cursor: 'pointer', transition: 'all 0.15s',
            background: input.trim() && !loading ? S.ink : S.subtle,
            color: input.trim() && !loading ? '#fff' : S.hint,
          }}
        >
          送信
        </button>
      </div>
    </div>
  )
}

/* ─── main feedback content ──────────────────────────────────── */
function FeedbackContent({ session, onBack, streak }) {
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    if (!session?.imageBlob) return
    const url = URL.createObjectURL(session.imageBlob)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [session?.imageBlob])

  const scores = session.scores ?? {}
  const entries = Object.entries(scores)
  const total = entries.reduce((acc, [, v]) => acc + v, 0)
  const max = entries.length * 100
  const pct = max > 0 ? Math.round(total / max * 100) : 0
  const sorted = [...entries].sort((a, b) => b[1] - a[1])
  const bestKey = entries.length > 1 ? sorted[0]?.[0] : null
  const worstKey = entries.length > 1 ? sorted[sorted.length - 1]?.[0] : null

  const dateLabel = session.date
    ? new Date(session.date + 'T12:00:00').toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
    : ''

  return (
    <div style={{ minHeight: '100vh', background: S.surface, fontFamily: "'Noto Sans JP', sans-serif" }}>

      {/* Header: brand bar (tab) or nav-back (overlay) */}
      {onBack ? <NavBack onBack={onBack} /> : <BrandBar streak={streak} />}

      {/* Session meta */}
      <div style={{ padding: '14px 22px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.sub, fontWeight: 600, marginBottom: 6 }}>
          FEEDBACK · {dateLabel} Day {(session.day ?? 0) + 1}
        </div>
        <div style={{ fontSize: 20, lineHeight: 1.4, color: S.ink, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.005em' }}>
          {session.taskText ?? ''}
        </div>
        <div style={{ fontSize: 12.5, color: S.sub, marginBottom: 20 }}>
          Week {session.week ?? 1}
        </div>
      </div>

      {/* Score hero card */}
      <div style={{
        margin: '0 16px 14px', background: S.ink, borderRadius: 18, padding: 20,
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -50, bottom: -50, width: 170, height: 170, borderRadius: '50%', background: '#2A2A24' }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6, position: 'relative', zIndex: 1 }}>
          <span style={{
            fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
            fontSize: 64, fontWeight: 400, lineHeight: 0.9, color: '#fff', letterSpacing: '-0.02em',
          }}>
            {total}
          </span>
          <span style={{ fontSize: 13, color: S.muted, marginBottom: 8 }}>/ {max}</span>
        </div>
        <div style={{ position: 'relative', zIndex: 1, fontSize: 11, color: S.muted, marginBottom: 14 }}>
          ベースライン記録完了
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(232,93,47,0.18)', border: '1px solid rgba(255,177,140,0.3)',
          padding: '4px 9px', borderRadius: 10,
          fontSize: 10, color: '#FFB18C', fontWeight: 600, letterSpacing: '0.06em',
          position: 'relative', zIndex: 1,
        }}>
          <i className="ti ti-flame" style={{ fontSize: 11 }} />{scoreGrade(pct)}
        </div>
      </div>

      {/* Next action card */}
      {session.improvement && (
        <div style={{
          margin: '0 16px 14px', background: S.accentPale2, border: `1px solid ${S.accentRing}`,
          borderRadius: 16, padding: '18px 18px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <i className="ti ti-arrow-bear-right" style={{ color: S.accent, fontSize: 16 }} />
            <span style={{ fontSize: 11, color: S.accentDk, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              明日やる、たった1つ
            </span>
          </div>
          <div style={{ fontSize: 15, color: S.ink, fontWeight: 600, lineHeight: 1.5, marginBottom: 10 }}>
            {session.improvement}
          </div>
          {session.feedback?.[0]?.comment && (() => {
            const m = session.feedback[0].comment.match(/【修正動作】([^【]*)/s)
            const desc = (m?.[1]?.trim() || session.feedback[0].comment).slice(0, 120)
            return desc ? (
              <div style={{ fontSize: 12.5, color: '#3A3A30', lineHeight: 1.65, marginBottom: 14 }}>{desc}</div>
            ) : null
          })()}
          <button style={{
            width: '100%', background: S.ink, color: '#fff', border: 'none', borderRadius: 11,
            padding: 13, fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13, fontWeight: 600,
            letterSpacing: '0.03em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <i className="ti ti-clock-play" style={{ fontSize: 14 }} />今すぐ5分タイマーで試す
          </button>
        </div>
      )}

      {/* Skill scores */}
      {entries.length > 0 && (
        <div style={{ margin: '0 16px 14px', background: S.card, borderRadius: 16, border: `1px solid ${S.subtle}`, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, color: S.sub, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
            スキル別スコア
          </div>
          {entries.map(([key, score]) => {
            const isBest = key === bestKey
            const isWorst = key === worstKey
            const barColor = isBest ? S.ok : isWorst ? S.accent : S.subtle
            return (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: S.ink, fontWeight: 500 }}>
                    {SCORE_LABELS[key] ?? key}
                    {isBest && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: S.okBg, color: S.ok }}>得意</span>}
                    {isWorst && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: S.ngBg, color: S.ng }}>要強化</span>}
                  </div>
                  <span style={{ fontSize: 16, color: S.ink, fontWeight: 700 }}>{score}</span>
                </div>
                <div style={{ height: 5, background: S.subtle, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: barColor, width: `${score}%`, transition: 'width 0.7s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Praise */}
      {session.praise && (
        <div style={{ margin: '0 16px 12px', background: S.card, borderRadius: 14, border: `1px solid ${S.subtle}`, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <i className="ti ti-check" style={{ fontSize: 14, color: S.ok }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.ok }}>今回良かった点</span>
          </div>
          <div style={{ fontSize: 13, color: S.ink, lineHeight: 1.7 }}>{session.praise}</div>
        </div>
      )}

      {/* Problems */}
      {(session.feedback ?? []).length > 0 && (
        <div style={{ margin: '0 16px 12px', background: S.card, borderRadius: 14, border: `1px solid ${S.subtle}`, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 14, color: S.sub }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.sub }}>気づいた問題</span>
          </div>
          {session.feedback.map((item, i) => (
            <div key={i} style={{ marginBottom: i < session.feedback.length - 1 ? 14 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: S.sub, marginBottom: 4 }}>{item.item}</div>
              <div style={{ fontSize: 13, color: S.ink, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{item.comment}</div>
            </div>
          ))}
        </div>
      )}

      {/* NG/OK visualization */}
      {session.svg && (
        <div style={{ margin: '0 16px 14px', background: S.card, borderRadius: 14, border: `1px solid ${S.subtle}`, padding: 16 }}>
          <div style={{ fontSize: 11, color: S.sub, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
            図解 · NG / OK
          </div>
          <div
            style={{ display: 'flex', justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: session.svg.replace(/(<svg[^>]*?)(?:width|height)="[^"]*"/g, '$1').replace('<svg', '<svg style="width:100%;max-width:240px;height:auto"') }}
          />
        </div>
      )}

      {/* Sketch image */}
      {imageUrl && (
        <div style={{ margin: '0 16px 14px', borderRadius: 14, overflow: 'hidden' }}>
          <img src={imageUrl} alt="スケッチ" style={{ width: '100%', objectFit: 'contain', maxHeight: 280, display: 'block' }} />
        </div>
      )}

      {/* Question box */}
      <div style={{ padding: '4px 0 8px' }}>
        <div style={{ padding: '10px 22px 10px' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.16em', color: S.sub, fontWeight: 600, textTransform: 'uppercase' }}>コーチに聞く</span>
        </div>
        <QuestionBox session={session} />
      </div>
    </div>
  )
}

/* ─── empty state ──────────────────────────────────────────── */
function EmptyState({ onBack, streak }) {
  return (
    <div style={{ minHeight: '100vh', background: S.surface, fontFamily: "'Noto Sans JP', sans-serif" }}>
      {onBack ? <NavBack onBack={onBack} /> : <BrandBar streak={streak} />}
      <div style={{ padding: '60px 22px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: S.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <i className="ti ti-message-circle-2" style={{ fontSize: 24, color: S.hint }} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: S.ink, marginBottom: 10 }}>まだフィードバックがありません</div>
        <div style={{ fontSize: 13, color: S.sub, lineHeight: 1.7 }}>
          ホームから今日の課題を始めて、<br />スケッチをアップロードしてみましょう。
        </div>
      </div>
    </div>
  )
}

/* ─── loading ─────────────────────────────────────────────── */
function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: S.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="animate-spin" style={{ width: 24, height: 24, border: `2px solid ${S.subtle}`, borderTopColor: S.accent, borderRadius: '50%', display: 'inline-block' }} />
    </div>
  )
}

/* ─── public component ──────────────────────────────────────── */
export default function Feedback({ session: sessionProp, onBack }) {
  const [session, setSession] = useState(sessionProp ?? null)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(!sessionProp)

  useEffect(() => {
    if (sessionProp) {
      setSession(sessionProp)
      setLoading(false)
      db.sessions.toArray().then(all => setStreak(calcStreak(all)))
      return
    }
    Promise.all([
      db.sessions.orderBy('createdAt').last(),
      db.sessions.toArray(),
    ]).then(([s, all]) => {
      setSession(s ?? null)
      setStreak(calcStreak(all))
      setLoading(false)
    })
  }, [sessionProp])

  if (loading) return <Loading />
  if (!session) return <EmptyState onBack={onBack} streak={streak} />
  return <FeedbackContent session={session} onBack={onBack} streak={streak} />
}
