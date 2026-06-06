import { notFound, redirect } from 'next/navigation';
import { getScene } from '@/entities/scenes/getScene';

export default async function ScenePage({
  params,
}: {
  params: Promise<{ scene: string }>;
}) {
  const { scene: sceneId } = await params;
  const scene = await getScene(sceneId);
  if (!scene) notFound();
  redirect(`/p/${scene.id}/${scene.rootViewId}`);
}
