'use client'
import { usePrefetchOnMount } from '../hooks/usePrefetchOnMount'
import { useResetTransitionOnMount } from '../hooks/useResetTransitionOnMount'
import { ImageViewRenderer } from './ImageViewRenderer'
import type { ImageView } from '@/entities/scenes/types'

type Target = { imageUrl: string; videoUrl?: string }

export function ViewClient({
  view,
  sceneId,
  oneHopTargets,
}: {
  view: ImageView
  sceneId: string
  oneHopTargets: Target[]
}) {
  usePrefetchOnMount(oneHopTargets)
  useResetTransitionOnMount()
  return <ImageViewRenderer view={view} sceneId={sceneId} />
}
