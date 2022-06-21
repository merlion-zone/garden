import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

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
  const [slippageTolerance, setSlippageTolerance] = useAtom(
    slippageToleranceAtom
  )
  const [expertMode, setExpertMode] = useAtom(expertModeAtom)
  return {
    defaultSlippageTolerance: '0.5', // percentage
    slippageTolerance, // percentage
    setSlippageTolerance,
    expertMode,
    setExpertMode,
  }
}
