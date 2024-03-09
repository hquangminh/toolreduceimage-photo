// App.tsx
import React from 'react'
import './App.css'
import UploadComponent from './CompressionToolImage/UploadComponent'
import UploadComponentVideo from './CompressionToolVideo/UploadComponentVideo'

function App() {
  return (
    <div className='App'>
      <UploadComponent />
      {/* <UploadComponentVideo /> */}
    </div>
  )
}

export default App
