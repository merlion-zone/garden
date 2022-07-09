import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback, useEffect } from 'react'

import config from '@/config'

const cachedDenomsAtom = atomWithStorage<string[]>('cached-denoms', [])

export function useCachedDenoms() {
  const [cachedDenoms, setCachedDenoms] = useAtom(cachedDenomsAtom)

  const addDenom = useCallback(
    (denom: string) => {
      const index = cachedDenoms.indexOf(denom)
      if (index < 0) {
        setCachedDenoms(cachedDenoms.concat(denom))
      }
    },
    [cachedDenoms, setCachedDenoms]
  )

  const removeDenom = useCallback(
    (denom: string) => {
      const index = cachedDenoms.indexOf(denom)
      if (index >= 0) {
        setCachedDenoms(cachedDenoms.splice(index, 1))
      }
    },
    [cachedDenoms, setCachedDenoms]
  )

  const hasDenom = useCallback(
    (denom: string) => cachedDenoms.indexOf(denom) >= 0,
    [cachedDenoms]
  )

  useEffect(() => {
    if (!cachedDenoms.length) {
      setCachedDenoms([config.denom, config.merDenom])
    }
  }, [cachedDenoms, setCachedDenoms])

  return {
    cachedDenoms,
    addDenom,
    removeDenom,
    hasDenom,
  }
}
