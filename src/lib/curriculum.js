export const curriculum = {
  1: [
    { day: 1, task: '水平線・垂直線を50本ずつ（定規なし）' },
    { day: 2, task: '斜線（45°）を50本' },
    { day: 3, task: 'Cカーブを30本（肘を軸に）' },
    { day: 4, task: '楕円を30個（正円・つぶれ・傾き各10個）' },
    { day: 5, task: '円柱の外形をフリーハンドで10個' },
    { day: 6, task: '目の前の円柱形オブジェクトを3枚スケッチ' },
    { day: 7, task: '週の振り返り（今週の最初と最後を並べて確認）' },
  ],
}

export async function getCurrentTask(db) {
  const first = await db.sessions.orderBy('createdAt').first()
  if (!first) {
    return { week: 1, day: 1, task: curriculum[1][0].task }
  }

  const daysSinceStart = Math.floor(
    (Date.now() - new Date(first.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  const week = Math.min(Math.floor(daysSinceStart / 7) + 1, 12)
  const day = (daysSinceStart % 7) + 1

  if (curriculum[week]) {
    return { week, day, task: curriculum[week][day - 1]?.task ?? '自由スケッチ' }
  }
  return { week, day, task: 'Coming soon（Week 2以降は準備中）' }
}
