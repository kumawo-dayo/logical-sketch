import { useState, useEffect } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { db } from '../lib/db'
import { getWeekTasks } from '../lib/curriculum'

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
  ng: '#B83838',
  ngBg: '#FBEBEB',
  info: '#5478A0',
  infoBg: '#F0F4F8',
  infoRing: '#D7E2EC',
}

const METRIC_LABELS = {
  line: '線の精度',
  ellipse: '楕円対称性',
  proportion: '形の再現率',
  balance: '全体バランス',
  drillApplied: 'ドリルの成果',
}

function avg(arr) {
  if (!arr.length) return null
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
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

function WeeklyBarChart({ weekDays }) {
  const maxScore = Math.max(...weekDays.map(d => d.scorePct), 10)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 80, padding: '0 4px', gap: 6 }}>
      {weekDays.map((day, i) => {
        const heightPct = day.hasSession ? Math.max((day.scorePct / 100) * 100, 8) : 30
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: '100%',
              height: `${heightPct}%`,
              borderRadius: '4px 4px 0 0',
              minHeight: 6,
              background: day.isFuture
                ? 'transparent'
                : day.isToday
                  ? S.ink
                  : day.hasSession
                    ? S.accent
                    : S.subtle,
              border: day.isFuture ? `1px dashed #C4C0B5` : 'none',
              backgroundImage: day.isFuture
                ? 'repeating-linear-gradient(45deg,#ECEAE3,#ECEAE3 3px,transparent 3px,transparent 6px)'
                : 'none',
              backgroundSize: '6px 6px',
            }} />
            <span style={{
              fontSize: 9,
              color: day.isToday ? S.ink : S.hint,
              fontWeight: day.isToday ? 600 : 500,
            }}>
              {day.dateLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function Progress() {
  const [sessions, setSessions] = useState([])
  const [weekData, setWeekData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      db.sessions.toArray(),
      getWeekTasks(db),
    ]).then(([ss, wd]) => {
      setSessions(ss)
      setWeekData(wd)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: S.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="animate-spin" style={{ width: 24, height: 24, border: '2px solid #ECEAE3', borderTopColor: S.accent, borderRadius: '50%', display: 'inline-block' }} />
      </div>
    )
  }

  const streak = calcStreak(sessions)

  // Metric averages
  const METRICS = ['line', 'ellipse', 'proportion', 'balance']
  const metricAvgs = {}
  for (const key of METRICS) {
    const vals = sessions.filter(s => s.scores?.[key] != null).map(s => s.scores[key])
    metricAvgs[key] = avg(vals)
  }

  const totalSessions = sessions.length
  const allScores = sessions.map(s => {
    const vals = Object.values(s.scores ?? {})
    const tot = vals.reduce((a, b) => a + b, 0)
    const mx = vals.length * 100
    return mx > 0 ? Math.round(tot / mx * 100) : 0
  })
  const avgScore = allScores.length > 0 ? avg(allScores) : null

  // Radar data (5 axes, 3 dummy if not enough data)
  const radarData = [
    { axis: '線の精度', value: metricAvgs.line ?? 0 },
    { axis: 'バランス', value: metricAvgs.balance ?? 0 },
    { axis: '対称性', value: metricAvgs.ellipse ?? 20 },
    { axis: '遠近', value: metricAvgs.proportion ?? 15 },
    { axis: '構図', value: 18 },
  ]

  // Worst real metric for milestone
  const realMetrics = METRICS.filter(k => metricAvgs[k] != null)
  const sortedReal = [...realMetrics].sort((a, b) => (metricAvgs[a] ?? 0) - (metricAvgs[b] ?? 0))
  const worstKey = sortedReal[0] ?? null
  const currentScore = worstKey ? metricAvgs[worstKey] : 0
  const targetScore = Math.min((currentScore ?? 0) + 38, 100)
  const nextWeek = weekData ? weekData.week + 1 : 2

  // Weekly bar chart data
  const todayStr = new Date().toISOString().slice(0, 10)
  const weekDays = weekData ? weekData.tasks.map((t, i) => {
    const offsetDays = i - weekData.currentDayOfWeek
    const d = new Date(todayStr + 'T12:00:00')
    d.setDate(d.getDate() + offsetDays)
    const dateStr = d.toISOString().slice(0, 10)
    const dateLabel = d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
    const session = sessions.find(s => s.date === dateStr)
    const total = session ? Object.values(session.scores ?? {}).reduce((a, b) => a + b, 0) : 0
    const mx = session ? Object.keys(session.scores ?? {}).length * 100 : 400
    const scorePct = session ? Math.round(total / mx * 100) : 0
    return {
      dateStr, dateLabel, session,
      hasSession: !!session,
      scorePct,
      isToday: dateStr === todayStr,
      isPast: offsetDays < 0,
      isFuture: offsetDays > 0,
    }
  }) : []

  // Week date range label
  const weekStart = weekDays.length > 0 ? weekDays[0].dateLabel : ''
  const weekEnd = weekDays.length > 0 ? weekDays[6].dateLabel : ''

  return (
    <div style={{ minHeight: '100vh', background: S.surface, fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '48px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: S.ink, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: S.accent }} />
          LOGICAL SKETCH
        </div>
        {streak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: S.accentPale, borderRadius: 14, padding: '5px 10px 5px 8px' }}>
            <i className="ti ti-flame" style={{ color: S.accent, fontSize: 13 }} />
            <b style={{ fontSize: 12, fontWeight: 700, color: S.accentDk }}>{streak}</b>
            <span style={{ fontSize: 10, color: S.accentDk, fontWeight: 500 }}>日連続</span>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 22px 0' }}>
        <div style={{ fontSize: 22, lineHeight: 1.35, color: S.ink, fontWeight: 700, marginBottom: 4 }}>
          あなたの進捗
        </div>
        <div style={{ fontSize: 12.5, color: S.sub, marginBottom: 22 }}>
          Week {weekData?.week ?? 1}{weekStart && ` · ${weekStart} 〜 ${weekEnd}`}
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ margin: '0 16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        <div style={{ background: S.card, border: `1px solid ${S.subtle}`, borderRadius: 14, padding: '14px 14px 12px' }}>
          <div style={{ fontSize: 10, color: S.sub, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>総投稿</div>
          <div>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, color: S.ink, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {totalSessions}
            </span>
            <span style={{ fontSize: 11, color: S.sub, marginLeft: 3, fontFamily: "'Noto Sans JP', sans-serif" }}>枚</span>
          </div>
          {streak > 0 && (
            <div style={{ fontSize: 10, color: S.ok, fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <i className="ti ti-flame" style={{ fontSize: 11 }} />{streak}日連続継続中
            </div>
          )}
        </div>
        <div style={{ background: S.card, border: `1px solid ${S.subtle}`, borderRadius: 14, padding: '14px 14px 12px' }}>
          <div style={{ fontSize: 10, color: S.sub, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>平均スコア</div>
          <div>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, color: S.ink, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {avgScore ?? '—'}
            </span>
            {avgScore != null && (
              <span style={{ fontSize: 11, color: S.sub, marginLeft: 3, fontFamily: "'Noto Sans JP', sans-serif" }}>/100</span>
            )}
          </div>
          <div style={{ fontSize: 10, color: avgScore != null ? S.sub : S.hint, fontWeight: 600, marginTop: 4 }}>
            {avgScore != null ? (totalSessions === 1 ? 'ベースライン' : '全期間平均') : '—'}
          </div>
        </div>
      </div>

      {/* Radar chart */}
      <div style={{ margin: '0 16px 14px', background: S.card, border: `1px solid ${S.subtle}`, borderRadius: 16, padding: '18px 18px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: S.ink, fontWeight: 600 }}>スキル別バランス</span>
          <span style={{ fontSize: 10, color: S.sub, fontWeight: 500 }}>全期間平均</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
              <PolarGrid stroke={S.subtle} />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 10, fontWeight: 600, fill: S.ink, fontFamily: "'Noto Sans JP', sans-serif" }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke={S.accent}
                fill={S.accent}
                fillOpacity={0.18}
                strokeWidth={2}
                dot={{ fill: S.accent, strokeWidth: 0, r: 3.5 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: S.sub }}>
            <div style={{ width: 8, height: 2, borderRadius: 1, background: S.accent }} />現在
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: S.sub }}>
            <div style={{ width: 8, height: 2, borderRadius: 1, background: S.subtle }} />目標（Week 4）
          </div>
        </div>
      </div>

      {/* Milestone card */}
      {worstKey && (
        <div style={{
          margin: '0 16px 14px',
          background: 'linear-gradient(135deg, #FFF6EF 0%, #FFEDDE 100%)',
          border: `1px solid ${S.accentRing}`,
          borderRadius: 16,
          padding: 18,
        }}>
          <div style={{ fontSize: 10, color: S.accentDk, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="ti ti-flag" style={{ fontSize: 13 }} />次のマイルストーン
          </div>
          <div style={{ fontSize: 14, color: S.ink, fontWeight: 600, lineHeight: 1.45, marginBottom: 12 }}>
            Week {nextWeek} 終了時に「{METRIC_LABELS[worstKey]} {targetScore}点」を達成
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 11, color: S.sub, fontWeight: 500, minWidth: 35, lineHeight: 1.4 }}>
              {currentScore}<br /><span style={{ fontSize: 9, color: '#A88060' }}>現在</span>
            </div>
            <div style={{ flex: 1, height: 6, background: '#fff', borderRadius: 3, overflow: 'hidden', border: `1px solid ${S.accentRing}`, position: 'relative' }}>
              <div style={{ height: '100%', background: S.accent, borderRadius: 3, width: `${Math.round((currentScore / targetScore) * 100)}%` }} />
            </div>
            <div style={{ fontSize: 11, color: S.accentDk, fontWeight: 600, minWidth: 30, textAlign: 'right', lineHeight: 1.4 }}>
              {targetScore}<br /><span style={{ fontSize: 9, color: '#A88060' }}>目標</span>
            </div>
          </div>
        </div>
      )}

      {/* Weekly bar chart */}
      {weekDays.length > 0 && (
        <div style={{ margin: '0 16px 14px', background: S.card, border: `1px solid ${S.subtle}`, borderRadius: 16, padding: '18px 18px 14px' }}>
          <div style={{ fontSize: 11, color: S.sub, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            週間スコア推移
          </div>
          <WeeklyBarChart weekDays={weekDays} />
        </div>
      )}

      {/* Info tip */}
      <div style={{ margin: '0 16px 14px', padding: '14px 16px', background: S.infoBg, border: `1px solid ${S.infoRing}`, borderRadius: 12, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
        <i className="ti ti-info-circle" style={{ color: S.info, fontSize: 14, marginTop: 1 }} />
        <div style={{ fontSize: 12, color: '#3A5170', lineHeight: 1.5, flex: 1 }}>
          {totalSessions === 0
            ? '最初のスケッチをアップロードすると、スキル分析が始まります。'
            : 'Week 2 以降のデータが集まると、スキル別のトレンドグラフが表示されます。'}
        </div>
      </div>
    </div>
  )
}
