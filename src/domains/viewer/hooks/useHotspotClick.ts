import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { transitionAtom } from '../state/transitionAtom'
import type { Hotspot } from '@/entities/scenes/types'

export function useHotspotClick(hotspot: Hotspot, sceneId: string) {
  const setT = useSetAtom(transitionAtom)
  return useCallback(() => {
    if (hotspot.transitionVideoUrl) {
      setT({
        phase: 'playing',
        videoUrl: hotspot.transitionVideoUrl,
        targetViewId: hotspot.targetViewId,
        sceneId,
      })
    } else {
      setT({
        phase: 'fading',
        targetViewId: hotspot.targetViewId,
        sceneId,
      })
    }
  }, [hotspot, sceneId, setT])
}
