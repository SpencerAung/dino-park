import { useEffect } from 'react';

type Target = { imageUrl: string; videoUrl?: string };

export function usePrefetchOnMount(targets: Target[]) {
  useEffect(() => {
    const controller = new AbortController();
    for (const t of targets) {
      fetch(t.imageUrl, {
        signal: controller.signal,
        priority: 'low' as RequestInit['priority'],
      }).catch(() => {});
      if (t.videoUrl) {
        fetch(t.videoUrl, {
          signal: controller.signal,
          priority: 'low' as RequestInit['priority'],
        }).catch(() => {});
      }
    }
    return () => controller.abort();
  }, [targets]);
}
