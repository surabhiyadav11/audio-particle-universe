import React, { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Play, Pause, Mic } from 'lucide-react'
import AudioParticles from './AudioParticles'

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [useMic, setUseMic] = useState(false)
  const audioRef = useRef(null)
  const analyserRef = useRef(null)
  const audioCtxRef = useRef(null)

  const setupAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64

      const source = ctx.createMediaElementSource(audioRef.current)
      source.connect(analyser)
      analyser.connect(ctx.destination)

      audioCtxRef.current = ctx
      analyserRef.current = analyser
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }

  const togglePlay = () => {
    setupAudio()
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const enableMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64

      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)

      analyserRef.current = analyser
      setUseMic(true)
      setIsPlaying(true)
    }catch (err) {
  console.error("Error:", err);
  console.error("Name:", err.name);
  console.error("Message:", err.message);

  alert(`${err.name}\n${err.message}`);
}
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <audio
        ref={audioRef}
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"
        crossOrigin="anonymous"
        loop
      />

      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        gap: '15px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        padding: '12px 24px',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {!useMic && (
          <button onClick={togglePlay} style={btnStyle}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            {isPlaying ? 'Pause Demo Audio' : 'Play Demo Audio'}
          </button>
        )}

        <button onClick={enableMic} style={{ ...btnStyle, background: useMic ? '#ec4899' : 'rgba(255, 255, 255, 0.1)' }}>
          <Mic size={18} />
          {useMic ? 'Mic Active' : 'Use Microphone'}
        </button>
      </div>

      <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
        <color attach="background" args={['#050508']} />
        <ambientLight intensity={0.5} />
        <AudioParticles analyserRef={analyserRef} isPlaying={isPlaying} />
        <OrbitControls enableZoom={true} enablePan={false} rotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}

const btnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(255, 234, 0, 0.15)',
  color: 'white',
  border: 'none',
  padding: '10px 18px',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600'
}