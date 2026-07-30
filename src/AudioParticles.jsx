import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function AudioParticles({ analyserRef, isPlaying }) {
  const pointsRef = useRef()
  const count = 12000

  const [positions, originalPositions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const origPos = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)

    const color1 = new THREE.Color('#3b82f6')
    const color2 = new THREE.Color('#ec4899')

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count)
      const theta = Math.sqrt(count * Math.PI) * phi
      const radius = 2.5 + (Math.random() - 0.5) * 0.2

      const x = radius * Math.cos(theta) * Math.sin(phi)
      const y = radius * Math.sin(theta) * Math.sin(phi)
      const z = radius * Math.cos(phi)

      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z
      origPos[i * 3] = x; origPos[i * 3 + 1] = y; origPos[i * 3 + 2] = z

      const mixedColor = color1.clone().lerp(color2, (y + 2.5) / 5)
      cols[i * 3] = mixedColor.r
      cols[i * 3 + 1] = mixedColor.g
      cols[i * 3 + 2] = mixedColor.b
    }

    return [pos, origPos, cols]
  }, [count])

  const dataArray = useMemo(() => new Uint8Array(32), [])

  useFrame((state) => {
    if (!pointsRef.current) return

    pointsRef.current.rotation.y += 0.002
    pointsRef.current.rotation.x += 0.001

    let bassLevel = 0
    if (analyserRef.current && isPlaying) {
      analyserRef.current.getByteFrequencyData(dataArray)
      bassLevel = (dataArray[1] + dataArray[2] + dataArray[3]) / (3 * 255)
    }

    const positionsAttr = pointsRef.current.geometry.attributes.position
    const time = state.clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      const ox = originalPositions[idx]
      const oy = originalPositions[idx + 1]
      const oz = originalPositions[idx + 2]

      const expansion = 1 + bassLevel * 0.8
      const wave = Math.sin(time * 3 + oy * 2) * 0.08 * (1 + bassLevel * 2)

      positionsAttr.array[idx] = ox * expansion + wave
      positionsAttr.array[idx + 1] = oy * expansion + wave
      positionsAttr.array[idx + 2] = oz * expansion + wave
    }

    positionsAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
}