import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { transitionAtom } from '../state/transitionAtom'

export function useResetTransitionOnMount() {
  const setT = useSetAtom(transitionAtom)
  useEffect(() => {
    setT({ phase: 'idle' })
  }, [setT])
}
