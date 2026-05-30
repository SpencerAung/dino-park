'use client'
import { useTransitionOverlay } from '../hooks/useTransitionOverlay'

export function TransitionOverlay() {
  const { phase, videoUrl, onVideoEnded } = useTransitionOverlay()

  if (phase === 'idle') return null

  if (phase === 'playing' && videoUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <video
          src={videoUrl}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          onEnded={onVideoEnded}
        />
      </div>
    )
  }

  // phase === 'fading'
  return <div className="fixed inset-0 z-50 bg-black" />
}
