import { atom } from 'jotai'

export type TransitionState =
  | { phase: 'idle' }
  | { phase: 'playing'; videoUrl: string; targetViewId: string; sceneId: string }
  | { phase: 'fading';  targetViewId: string; sceneId: string }

export const transitionAtom = atom<TransitionState>({ phase: 'idle' })
