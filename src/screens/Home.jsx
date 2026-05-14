import { useState, useEffect } from 'react'
import { db } from '../lib/db'
import { getCurrentTask } from '../lib/curriculum'

function SessionThumb({ session }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!session.imageBlob) return
    const u = URL.createObjectURL(session.imageBlob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [session.imageBlob])

  const total = session.scores
    ? Object.values(session.scores).reduce((a, b) => a + b, 0)
    : null

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
      {url ? (
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-200" />
      )}
      {total !== null && (
        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs rounded px-1">
          {total}/40
        </div>
      )}
    </div>
  )
}

export default function Home({ onUpload, onProgress }) {
  const [task, setTask] = useState(null)
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    getCurrentTask(db).then(setTask)
    db.sessions.orderBy('createdAt').reverse().toArray().then(setSessions)
  }, [])

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-base font-bold text-gray-900">Sketch Trainer</h1>
        <button
          onClick={onProgress}
          className="text-sm text-blue-600 font-medium px-2 py-1"
        >
          進捗
        </button>
      </header>

      <div className="p-4 space-y-4 flex-1">
        {/* Today's task card */}
        <div className="bg-blue-600 rounded-2xl p-4 text-white">
          <div className="text-xs font-medium opacity-80 mb-1">
            {task ? `Week ${task.week} · Day ${task.day}` : '読み込み中...'}
          </div>
          <div className="text-base font-semibold leading-snug">
            {task?.task ?? ''}
          </div>
        </div>

        {/* Upload button */}
        <button
          onClick={onUpload}
          className="w-full bg-gray-900 text-white rounded-2xl py-4 text-base font-semibold active:opacity-80 transition-opacity"
        >
          スケッチをアップする
        </button>

        {/* Past sessions */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">過去の投稿</h2>
          {sessions.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-sm">
              まだ投稿がありません
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {sessions.map((s) => (
                <SessionThumb key={s.id} session={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
