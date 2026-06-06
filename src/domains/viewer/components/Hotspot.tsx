'use client';
import { useHotspotClick } from '../hooks/useHotspotClick';
import type { Hotspot as HotspotType } from '@/entities/scenes/types';

export function Hotspot({
  hotspot,
  sceneId,
}: {
  hotspot: HotspotType;
  sceneId: string;
}) {
  const onClick = useHotspotClick(hotspot, sceneId);
  const { x, y, w, h } = hotspot.geometry;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${w * 100}%`,
        height: `${h * 100}%`,
      }}
      className="cursor-pointer hover:ring-2 ring-white/80"
      aria-label={`Go to ${hotspot.targetViewId}`}
    />
  );
}
