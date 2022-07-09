import { HStack, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'

import { DecDisplay } from '@/components/NumberDisplay'
import { useAccountAddress } from '@/hooks'
import { formatCoin } from '@/utils'

import { useDelegation } from '../hooks'
import { Card } from './Card'
import { Delegate } from './Delegate'
import { Redelegate } from './Redelegate'
import { Undelegate } from './Undelegate'

export interface DelegationProps {
  validatorAddress?: string
}

export function Delegation({ validatorAddress }: DelegationProps) {
  const address = useAccountAddress()
  const { data } = useDelegation(address?.mer(), validatorAddress)
  const balance = useMemo(
    () => (data && data.balance ? formatCoin(data.balance) : null),
    [data]
  )

  return (
    <Card>
      <Stack spacing="4">
        <Text fontSize="lg" fontWeight="medium">
          My delegation
        </Text>
        <HStack alignItems="baseline" mb="4">
          <Text fontSize="4xl">
            <DecDisplay
              value={balance?.amount}
              suffix={` ${balance?.denom.toUpperCase()}`}
            />
          </Text>
        </HStack>
        <Delegate />
        <HStack>
          <Redelegate />
          <Undelegate />
        </HStack>
      </Stack>
    </Card>
  )
}
