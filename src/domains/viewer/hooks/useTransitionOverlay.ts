import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { transitionAtom } from '../state/transitionAtom'

export function useTransitionOverlay() {
  const [t, setT] = useAtom(transitionAtom)
  const router = useRouter()

  const onVideoEnded = useCallback(() => {
    if (t.phase !== 'playing') return
    setT({ phase: 'fading', targetViewId: t.targetViewId, sceneId: t.sceneId })
  }, [t, setT])

  useEffect(() => {
    if (t.phase === 'fading') router.push(`/p/${t.sceneId}/${t.targetViewId}`)
  }, [t, router])

  return {
    phase: t.phase,
    videoUrl: t.phase === 'playing' ? t.videoUrl : null,
    onVideoEnded,
  }
}
