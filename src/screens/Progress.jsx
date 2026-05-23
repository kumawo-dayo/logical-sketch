import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { db } from '../lib/db'

const METRICS = ['line', 'ellipse', 'proportion', 'balance']
const METRIC_LABELS = {
  line: '線の精度',
  ellipse: '楕円対称性',
  proportion: '形の再現率',
  balance: '全体バランス',
}
const METRIC_COLORS = {
  line: '#2563eb',
  ellipse: '#7c3aed',
  proportion: '#059669',
  balance: '#d97706',
}

function avg(arr) {
  if (!arr.length) return null
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10
}

export default function Progress({ onBack }) {
  const [totalSessions, setTotalSessions] = useState(0)
  const [metricAvgs, setMetricAvgs] = useState({})
  const [weeklyTrend, setWeeklyTrend] = useState([])

  useEffect(() => {
    db.sessions.toArray().then((sessions) => {
      setTotalSessions(sessions.length)

      // 全期間の指標別平均
      const avgs = {}
      for (const key of METRICS) {
        const vals = sessions.filter(s => s.scores?.[key] != null).map(s => s.scores[key])
        avgs[key] = avg(vals)
      }
      setMetricAvgs(avgs)

      // 週別の指標別平均
      const byWeek = {}
      sessions.forEach((s) => {
        const w = s.week ?? 1
        if (!byWeek[w]) byWeek[w] = { week: `W${w}`, _counts: {} }
        for (const key of METRICS) {
          if (s.scores?.[key] != null) {
            if (!byWeek[w][`_${key}`]) byWeek[w][`_${key}`] = []
            byWeek[w][`_${key}`].push(s.scores[key])
          }
        }
      })

      const trend = Object.values(byWeek)
        .sort((a, b) => parseInt(a.week.slice(1)) - parseInt(b.week.slice(1)))
        .map((w) => {
          const entry = { week: w.week }
          for (const key of METRICS) {
            const arr = w[`_${key}`]
            if (arr?.length) entry[key] = avg(arr)
          }
          return entry
        })
      setWeeklyTrend(trend)
    })
  }, [])

  const sortedMetrics = METRICS.filter(k => metricAvgs[k] != null)
    .sort((a, b) => (metricAvgs[b] ?? 0) - (metricAvgs[a] ?? 0))

  const best = sortedMetrics[0]
  const worst = sortedMetrics[sortedMetrics.length - 1]

  const activeKeys = METRICS.filter(k =>
    weeklyTrend.some(w => w[k] != null)
  )

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-blue-600 font-medium text-sm">← 戻る</button>
        <span className="font-semibold text-gray-900 text-base">進捗</span>
      </header>

      <div className="p-4 space-y-4">
        {/* 総投稿数 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">総投稿数</div>
            <div className="text-3xl font-bold text-gray-900">{totalSessions}<span className="text-base font-normal text-gray-400 ml-1">枚</span></div>
          </div>
          {best && worst && best !== worst && (
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">得意 / 苦手</div>
              <div className="text-xs">
                <span className="text-green-600 font-semibold">{METRIC_LABELS[best]}</span>
                <span className="text-gray-300 mx-1">/</span>
                <span className="text-red-500 font-semibold">{METRIC_LABELS[worst]}</span>
              </div>
            </div>
          )}
        </div>

        {/* 指標別スキルバー */}
        {sortedMetrics.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-700 mb-4">指標別スキル（全期間平均）</div>
            <div className="space-y-3">
              {sortedMetrics.map((key) => {
                const score = metricAvgs[key]
                const isBest = key === best
                const isWorst = key === worst && best !== worst
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        {METRIC_LABELS[key]}
                        {isBest && <span className="text-xs bg-green-100 text-green-700 rounded px-1">得意</span>}
                        {isWorst && <span className="text-xs bg-red-100 text-red-600 rounded px-1">要強化</span>}
                      </span>
                      <span className="text-2xl font-bold text-gray-900">{score}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${score}%`,
                          backgroundColor: METRIC_COLORS[key],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 週別成長トレンド */}
        {weeklyTrend.length >= 2 && activeKeys.length > 0 ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-700 mb-4">週別成長トレンド</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v, name) => [v, METRIC_LABELS[name] ?? name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }}
                />
                <Legend
                  formatter={(value) => METRIC_LABELS[value] ?? value}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                {activeKeys.map(key => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={METRIC_COLORS[key]}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : weeklyTrend.length === 1 ? (
          <div className="bg-blue-50 rounded-2xl p-4 text-center text-sm text-blue-600">
            Week 2 以降のデータが集まるとトレンドグラフが表示されます
          </div>
        ) : null}

        {totalSessions === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm">まだ投稿がありません</div>
        )}
      </div>
    </div>
  )
}
