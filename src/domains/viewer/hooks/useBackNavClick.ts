import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { transitionAtom } from '../state/transitionAtom';
import type { ParentEdge } from '@/entities/scenes/types';

export function useBackNavClick(parentEdge: ParentEdge, sceneId: string) {
  const setT = useSetAtom(transitionAtom);
  return useCallback(() => {
    setT({
      phase: 'playing',
      videoUrl: parentEdge.returnVideoUrl,
      targetViewId: parentEdge.parentViewId,
      sceneId,
    });
  }, [parentEdge, sceneId, setT]);
}
