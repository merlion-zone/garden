import { IconProps } from '@chakra-ui/react'
import { ReactElement } from 'react'

import { EthereumIcon } from '@/components/Icons/Ethereum'
import { EvmosIcon } from '@/components/Icons/Evmos'
import { MerlionIcon } from '@/components/Icons/Merlion'

// TODO
export const SUPPORTED_NETWORKS: {
  name: string
  id: number
  icon: (props: IconProps) => ReactElement
}[] = [
  { name: 'Merlion', id: 5000, icon: MerlionIcon },
  { name: 'Ethereum', id: 1, icon: EthereumIcon },
  { name: 'Evmos', id: 9001, icon: EvmosIcon },
]
