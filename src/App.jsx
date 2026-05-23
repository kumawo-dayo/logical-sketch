import { useState } from 'react'
import Home from './screens/Home'
import Feedback from './screens/Feedback'
import Progress from './screens/Progress'
import TaskDetail from './screens/TaskDetail'
import Upload from './screens/Upload'

const TABS = [
  { id: 'home', icon: 'ti-home', label: 'ホーム' },
  { id: 'feedback', icon: 'ti-message-circle-2', label: 'フィードバック' },
  { id: 'progress', icon: 'ti-chart-radar', label: '進捗' },
]

function TabNav({ active, onChange }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 14,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(min(100vw, 430px) - 32px)',
      maxWidth: 398,
      zIndex: 50,
    }}>
      <div style={{
        display: 'flex',
        gap: 4,
        padding: 8,
        borderRadius: 22,
        background: 'rgba(28,28,24,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '9px 6px',
              borderRadius: 15,
              border: 'none',
              cursor: 'pointer',
              background: active === tab.id ? '#E85D2F' : 'transparent',
              color: active === tab.id ? '#fff' : '#76746C',
              fontFamily: "'Noto Sans JP', sans-serif",
              transition: 'all 0.18s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <i className={`ti ${tab.icon}`} style={{ fontSize: 18 }} />
            <span style={{
              fontSize: 9.5,
              fontWeight: active === tab.id ? 600 : 500,
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [overlay, setOverlay] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedWeekData, setSelectedWeekData] = useState(null)
  const [uploadTask, setUploadTask] = useState(null)

  function closeOverlay() { setOverlay(null) }

  if (overlay === 'taskDetail') {
    return (
      <TaskDetail
        task={selectedTask}
        weekData={selectedWeekData}
        onBack={closeOverlay}
        onUpload={() => { setUploadTask(selectedTask); setOverlay('upload') }}
      />
    )
  }
  if (overlay === 'upload') {
    return <Upload task={uploadTask} onBack={closeOverlay} />
  }
  if (overlay === 'sessionDetail') {
    return <Feedback session={selectedSession} onBack={closeOverlay} />
  }

  return (
    <div style={{
      background: '#E8E5DE',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '0',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 430,
        minHeight: '100vh',
        background: '#F7F5F0',
        position: 'relative',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08)',
      }}>
        <div style={{ paddingBottom: 90 }}>
          {activeTab === 'home' && (
            <Home
              onTaskDetail={(task, weekData) => {
                setSelectedTask(task)
                setSelectedWeekData(weekData)
                setOverlay('taskDetail')
              }}
              onUpload={(task) => { setUploadTask(task); setOverlay('upload') }}
              onSessionSelect={(session) => { setSelectedSession(session); setOverlay('sessionDetail') }}
              onProgress={() => setActiveTab('progress')}
              onFeedbackTab={() => setActiveTab('feedback')}
            />
          )}
          {activeTab === 'feedback' && (
            <Feedback
              onSessionSelect={(session) => { setSelectedSession(session); setOverlay('sessionDetail') }}
            />
          )}
          {activeTab === 'progress' && <Progress />}
        </div>
        <TabNav active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  )
}
