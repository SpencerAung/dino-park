export type Scene = {
  id: string;
  rootViewId: string;
  views: Record<string, View>;
};

export type View = ImageView;

export type ImageView = {
  id: string;
  mediaType: 'image';
  imageUrl: string;
  hotspots: Hotspot[];
};

export type Hotspot = {
  id: string;
  targetViewId: string;
  geometry: Rect2D;
  transitionVideoUrl?: string;
  returnVideoUrl?: string;
};

export type ParentEdge = {
  parentViewId: string;
  returnVideoUrl: string;
};

export type Rect2D = {
  shape: 'rect';
  x: number;
  y: number;
  w: number;
  h: number;
};
