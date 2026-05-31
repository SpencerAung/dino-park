'use client'
import { useBackNavClick } from '../hooks/useBackNavClick'
import type { ParentEdge } from '@/entities/scenes/types'

export function BackButton({
  parentEdge,
  sceneId,
}: {
  parentEdge: ParentEdge
  sceneId: string
}) {
  const onClick = useBackNavClick(parentEdge, sceneId)
  return (
    <button
      onClick={onClick}
      aria-label={`Back to ${parentEdge.parentViewId}`}
      className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center
                 rounded-full bg-black/40 text-white backdrop-blur-sm
                 transition hover:bg-black/60 focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-white/80"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )
}
