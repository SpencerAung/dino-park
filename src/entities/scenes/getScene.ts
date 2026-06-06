import { demoScene } from './demo';
import type { Scene } from './types';

export async function getScene(sceneId: string): Promise<Scene | null> {
  if (sceneId === 'demo') return demoScene;
  return null;
}
