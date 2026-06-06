import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { transitionAtom } from '../state/transitionAtom';

export function useTransitionOverlay() {
  const [transition, setTransition] = useAtom(transitionAtom);
  const router = useRouter();

  const onVideoEnded = useCallback(() => {
    if (transition.phase !== 'playing') return;
    setTransition({
      phase: 'fading',
      targetViewId: transition.targetViewId,
      sceneId: transition.sceneId,
    });
  }, [transition, setTransition]);

  useEffect(() => {
    if (transition.phase === 'fading')
      router.push(`/p/${transition.sceneId}/${transition.targetViewId}`);
  }, [transition, router]);

  return {
    phase: transition.phase,
    videoUrl: transition.phase === 'playing' ? transition.videoUrl : null,
    onVideoEnded,
  };
}
