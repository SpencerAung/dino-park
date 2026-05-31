import type { Scene } from './types'

export const demoScene: Scene = {
  id: 'demo',
  rootViewId: 'view-a',
  views: {
    'view-a': {
      id: 'view-a',
      mediaType: 'image',
      imageUrl: '/demo/view-a.jpg',
      hotspots: [
        {
          id: 'a-to-b',
          targetViewId: 'view-b',
          geometry: { shape: 'rect', x: 0.4, y: 0.3, w: 0.2, h: 0.2 },
          transitionVideoUrl: '/demo/a-to-b.mp4',
          returnVideoUrl: '/demo/b-to-a.mp4',
        },
      ],
    },
    'view-b': {
      id: 'view-b',
      mediaType: 'image',
      imageUrl: '/demo/view-b.jpg',
      hotspots: [],
    },
  },
}
