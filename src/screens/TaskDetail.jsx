import { useState, useEffect, useRef } from 'react'
import { generatePatternSvg } from '../lib/claude'

function TaskTimer({ duration }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setDone(true)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function reset() {
    clearInterval(intervalRef.current)
    setTimeLeft(duration)
    setRunning(false)
    setDone(false)
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const progress = 1 - timeLeft / duration
  const circumference = 2 * Math.PI * 44

  if (!running && timeLeft === duration && !done) {
    return (
      <button
        onClick={() => setRunning(true)}
        className="w-full py-3.5 rounded-2xl bg-gray-900 text-white font-semibold text-sm active:opacity-80"
      >
        課題スタート ▶ {Math.floor(duration / 60)}分タイマー
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* 円形プログレス */}
        <div className="relative shrink-0">
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#f3f4f6" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={done ? '#10b981' : '#2563eb'} strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {done
              ? <span className="text-2xl">✓</span>
              : <span className="text-lg font-bold text-gray-900 tabular-nums">{mins}:{secs}</span>
            }
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {done ? (
            <p className="text-sm font-semibold text-green-700">タイマー終了！お疲れ様でした</p>
          ) : (
            <p className="text-xs text-gray-500">残り {mins}分 {secs}秒</p>
          )}
          <div className="flex gap-2">
            {!done && (
              <button
                onClick={() => setRunning(r => !r)}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold active:opacity-80"
              >
                {running ? '一時停止' : '再開'}
              </button>
            )}
            <button
              onClick={reset}
              className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold active:opacity-80"
            >
              リセット
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function WeekFlowMini({ tasks }) {
  return (
    <div className="divide-y divide-gray-50">
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
  )
}

export default function TaskDetail({ task, onBack, onUpload, weekData }) {
  const [showFlow, setShowFlow] = useState(false)
  const [patternSvg, setPatternSvg] = useState(null)
  const [svgLoading, setSvgLoading] = useState(false)
  const [svgError, setSvgError] = useState(null)

  function loadPatternSvg(t) {
    if (!t?.successPattern && !t?.failPattern) return
    const cacheKey = `pattern-svg-w${t.week}-d${t.dayOfWeek}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) { setPatternSvg(cached); setSvgError(null); return }
    setSvgLoading(true)
    setSvgError(null)
    generatePatternSvg(t.task, t.successPattern, t.failPattern)
      .then(svg => { setPatternSvg(svg); localStorage.setItem(cacheKey, svg) })
      .catch(e => setSvgError(e.message))
      .finally(() => setSvgLoading(false))
  }

  useEffect(() => { loadPatternSvg(task) }, [task?.week, task?.dayOfWeek])

  const cardColor = task?.isSunday
    ? 'bg-purple-600'
    : task?.isFriday
    ? 'bg-orange-500'
    : task?.isSaturday
    ? 'bg-teal-600'
    : 'bg-blue-600'

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-blue-600 font-medium text-sm">← 戻る</button>
        <span className="font-semibold text-gray-900 text-base">課題の詳細</span>
      </header>

      <div className="p-4 space-y-4 pb-32">
        {/* 課題カード */}
        <div className={`rounded-2xl p-4 text-white ${cardColor}`}>
          <div className="text-xs font-medium opacity-80 mb-1">
            Week {task?.week} Day {task?.dayNum}
          </div>
          <div className="text-base font-semibold leading-snug">{task?.task}</div>
          {task?.isFriday && (
            <div className="mt-2 text-xs bg-white/20 rounded-lg px-2 py-1 inline-block">
              応用課題 · ドリルの成果も評価されます
            </div>
          )}
        </div>

        {/* 適応選択バナー（Thursday のみ） */}
        {task?.adaptation && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-start gap-2.5">
            <span className="text-blue-500 text-base shrink-0">🎯</span>
            <div>
              <div className="text-xs font-semibold text-blue-700 mb-0.5">今日の重点（自動選択）</div>
              <div className="text-sm text-blue-900">{task.adaptation}</div>
            </div>
          </div>
        )}

        {/* ゴール */}
        {task?.goal && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">今日のゴール</div>
            <p className="text-sm text-gray-800 leading-relaxed">{task.goal}</p>
          </div>
        )}

        {/* ウォームアップ */}
        {task?.warmup && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">準備運動（10分）</div>
            <p className="text-sm text-gray-700 leading-relaxed">{task.warmup}</p>
          </div>
        )}

        {/* ポイント */}
        {task?.tips?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">今日の手順</div>
            <ul className="space-y-2.5">
              {task.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* タイマー */}
        {task?.duration && <TaskTimer duration={task.duration} />}

        {/* 成功・失敗パターン */}
        {(task?.successPattern || task?.failPattern) && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">成功・失敗パターン</div>
            <div className="grid grid-cols-2 gap-3">
              {task.failPattern && (
                <div className="bg-red-50 rounded-xl p-3">
                  <div className="text-xs font-semibold text-red-700 mb-1.5">NG</div>
                  <p className="text-xs text-red-900 leading-relaxed">{task.failPattern}</p>
                </div>
              )}
              {task.successPattern && (
                <div className="bg-green-50 rounded-xl p-3">
                  <div className="text-xs font-semibold text-green-700 mb-1.5">OK</div>
                  <p className="text-xs text-green-900 leading-relaxed">{task.successPattern}</p>
                </div>
              )}
            </div>
            {svgLoading && (
              <div className="flex justify-center py-3">
                <span className="animate-spin w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full inline-block" />
              </div>
            )}
            {svgError && (
              <div className="text-center space-y-2">
                <p className="text-xs text-red-500">{svgError}</p>
                <button
                  onClick={() => loadPatternSvg(task)}
                  className="text-xs text-blue-600 underline"
                >
                  再試行
                </button>
              </div>
            )}
            {patternSvg && (
              <div
                className="flex justify-center [&>svg]:w-full [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: patternSvg }}
              />
            )}
          </div>
        )}

        {/* 今週の流れ */}
        {weekData && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowFlow(f => !f)}
              className="w-full px-4 py-3 flex items-center justify-between active:bg-gray-50"
            >
              <span className="text-sm font-semibold text-gray-700">今週の課題の流れ</span>
              <span className="text-gray-400 text-xs">{showFlow ? '▲' : '▼'}</span>
            </button>
            {showFlow && (
              <div className="border-t border-gray-50">
                <WeekFlowMini tasks={weekData.tasks} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* アップロードボタン（固定フッター） */}
      {!task?.isSunday && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 bg-white/90 backdrop-blur border-t border-gray-100">
          <button
            onClick={onUpload}
            className={`w-full py-4 rounded-2xl text-white font-semibold text-base active:opacity-80 ${cardColor}`}
          >
            この課題のスケッチをアップロード →
          </button>
        </div>
      )}
    </div>
  )
}
