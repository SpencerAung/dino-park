import { Hotspot } from './Hotspot';
import type { ImageView } from '@/entities/scenes/types';

export function ImageViewRenderer({
  view,
  sceneId,
}: {
  view: ImageView;
  sceneId: string;
}) {
  return (
    <div className="relative w-full h-screen bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={view.imageUrl}
        alt=""
        className="w-full h-full object-contain"
      />
      <div className="absolute inset-0">
        {view.hotspots.map((h) => (
          <Hotspot key={h.id} hotspot={h} sceneId={sceneId} />
        ))}
      </div>
    </div>
  );
}
