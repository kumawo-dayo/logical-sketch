import Dexie from 'dexie'

export const db = new Dexie('SketchTrainer')

db.version(1).stores({
  sessions: '++id, date, week, day, createdAt',
})
