'use client';
import { usePrefetchOnMount } from '../hooks/usePrefetchOnMount';
import { useResetTransitionOnMount } from '../hooks/useResetTransitionOnMount';
import { ImageViewRenderer } from './ImageViewRenderer';
import { BackButton } from './BackButton';
import type { ImageView, ParentEdge } from '@/entities/scenes/types';

type Target = { imageUrl: string; videoUrl?: string };

export function ViewClient({
  view,
  sceneId,
  oneHopTargets,
  parentEdge,
}: {
  view: ImageView;
  sceneId: string;
  oneHopTargets: Target[];
  parentEdge: ParentEdge | null;
}) {
  usePrefetchOnMount(oneHopTargets);
  useResetTransitionOnMount();
  return (
    <>
      <ImageViewRenderer view={view} sceneId={sceneId} />
      {parentEdge && <BackButton parentEdge={parentEdge} sceneId={sceneId} />}
    </>
  );
}
