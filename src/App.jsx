import { useState } from 'react'
import Home from './screens/Home'
import Upload from './screens/Upload'
import Progress from './screens/Progress'
import SessionDetail from './screens/SessionDetail'
import TaskDetail from './screens/TaskDetail'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedWeekData, setSelectedWeekData] = useState(null)
  const [uploadTask, setUploadTask] = useState(null)

  function openSession(session) {
    setSelectedSession(session)
    setScreen('session')
  }

  function openTaskDetail(task, weekData) {
    setSelectedTask(task)
    setSelectedWeekData(weekData)
    setScreen('taskDetail')
  }

  function startUpload(task) {
    setUploadTask(task ?? null)
    setScreen('upload')
  }

  return (
    <>
      {screen === 'home' && (
        <Home
          onTaskDetail={openTaskDetail}
          onUpload={(task) => startUpload(task)}
          onProgress={() => setScreen('progress')}
          onSessionSelect={openSession}
        />
      )}
      {screen === 'taskDetail' && (
        <TaskDetail
          task={selectedTask}
          weekData={selectedWeekData}
          onBack={() => setScreen('home')}
          onUpload={() => startUpload(selectedTask)}
        />
      )}
      {screen === 'upload' && (
        <Upload
          task={uploadTask}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'progress' && <Progress onBack={() => setScreen('home')} />}
      {screen === 'session' && (
        <SessionDetail session={selectedSession} onBack={() => setScreen('home')} />
      )}
    </>
  )
}
