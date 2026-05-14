import { useState } from 'react'
import Home from './screens/Home'
import Upload from './screens/Upload'
import Progress from './screens/Progress'

export default function App() {
  const [screen, setScreen] = useState('home')

  return (
    <>
      {screen === 'home' && (
        <Home
          onUpload={() => setScreen('upload')}
          onProgress={() => setScreen('progress')}
        />
      )}
      {screen === 'upload' && <Upload onBack={() => setScreen('home')} />}
      {screen === 'progress' && <Progress onBack={() => setScreen('home')} />}
    </>
  )
}
