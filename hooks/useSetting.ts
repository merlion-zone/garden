import { Dec } from '@merlionzone/merlionjs'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useMemo } from 'react'

export function useFiatCurrency() {
  // TODO
  return 'USD'
}

const slippageToleranceAtom = atomWithStorage<string | ''>(
  'swap-mint-slippage-tolerance',
  ''
)
const expertModeAtom = atomWithStorage<boolean>('swap-mint-expert-mode', false)

export function useSwapMintSettings() {
  const [slippageTolerancePercentage, setSlippageTolerancePercentage] = useAtom(
    slippageToleranceAtom
  )

  const [expertMode, setExpertMode] = useAtom(expertModeAtom)

  const slippageTolerance = useMemo(() => {
    let slippage = new Dec(slippageTolerancePercentage || 0.5)
    if (slippage.greaterThan(50)) {
      slippage = new Dec(50)
    }
    return slippage.div(100)
  }, [slippageTolerancePercentage])

  return {
    slippageTolerance,
    slippageTolerancePercentage,
    setSlippageTolerancePercentage,
    expertMode,
    setExpertMode,
  }
}
