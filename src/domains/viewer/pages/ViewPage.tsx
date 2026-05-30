import { notFound } from 'next/navigation'
import { getScene } from '@/entities/scenes/getScene'
import { ViewClient } from '../components/ViewClient'

type Target = { imageUrl: string; videoUrl?: string }

// Next.js (latest, App Router): `params` is a Promise that must be awaited.
export async function ViewPage({
  params,
}: {
  params: Promise<{ scene: string; viewId: string }>
}) {
  const { scene: sceneId, viewId } = await params
  const scene = await getScene(sceneId)
  const view = scene?.views[viewId]
  if (!scene || !view || view.mediaType !== 'image') notFound()

  const oneHopTargets: Target[] = view.hotspots
    .map((h): Target | null => {
      const target = scene.views[h.targetViewId]
      if (target?.mediaType !== 'image') return null
      const t: Target = { imageUrl: target.imageUrl }
      if (h.transitionVideoUrl) t.videoUrl = h.transitionVideoUrl
      return t
    })
    .filter((x): x is Target => x !== null)

  return <ViewClient view={view} sceneId={sceneId} oneHopTargets={oneHopTargets} />
}
