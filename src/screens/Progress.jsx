import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { db } from '../lib/db'

export default function Progress({ onBack }) {
  const [weeklyData, setWeeklyData] = useState([])
  const [totalSessions, setTotalSessions] = useState(0)

  useEffect(() => {
    db.sessions.toArray().then((sessions) => {
      setTotalSessions(sessions.length)

      const byWeek = {}
      sessions.forEach((s) => {
        const key = s.week
        if (!byWeek[key]) byWeek[key] = { week: `W${key}`, total: 0, count: 0 }
        const score = s.scores
          ? Object.values(s.scores).reduce((a, b) => a + b, 0)
          : 0
        byWeek[key].total += score
        byWeek[key].count++
      })

      const data = Object.values(byWeek)
        .sort((a, b) => {
          const wa = parseInt(a.week.slice(1))
          const wb = parseInt(b.week.slice(1))
          return wa - wb
        })
        .map((w) => ({ week: w.week, 合計: w.total }))

      setWeeklyData(data)
    })
  }, [])

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-blue-600 font-medium text-sm">
          ← 戻る
        </button>
        <span className="font-semibold text-gray-900 text-base">進捗</span>
      </header>

      <div className="p-4 space-y-4">
        {/* Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">総投稿数</div>
            <div className="text-3xl font-bold text-gray-900">{totalSessions}</div>
          </div>
          <div className="text-3xl">🎨</div>
        </div>

        {/* Weekly chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 mb-4">週ごとの合計スコア</div>
          {weeklyData.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-sm">
              データがまだありません
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 160]}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="合計"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: '#2563eb', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
