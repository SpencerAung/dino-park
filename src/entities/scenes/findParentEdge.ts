import type { Scene, ParentEdge } from './types'

export function findParentEdge(scene: Scene, viewId: string): ParentEdge | null {
  for (const v of Object.values(scene.views)) {
    const h = v.hotspots.find(h => h.targetViewId === viewId)
    if (h?.returnVideoUrl) {
      return { parentViewId: v.id, returnVideoUrl: h.returnVideoUrl }
    }
  }
  return null
}
