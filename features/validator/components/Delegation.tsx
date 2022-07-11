import { HStack, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'

import { AmountDisplay } from '@/components/NumberDisplay'
import {
  DelegateModal,
  RedelegateModal,
  UndelegateModal,
} from '@/components/TransactionModals'
import config from '@/config'
import { useAccountAddress } from '@/hooks'
import { formatCoin } from '@/utils'

import { useDelegation } from '../hooks'
import { Card } from './Card'

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
            <AmountDisplay
              value={balance?.amount ?? 0}
              suffix={` ${(
                balance?.denom ?? config.displayDenom
              ).toUpperCase()}`}
            />
          </Text>
        </HStack>
        <DelegateModal
          w="full"
          rounded="full"
          colorScheme="brand"
          validatorAddress={validatorAddress!}
        />
        <HStack>
          <RedelegateModal
            w="50%"
            rounded="full"
            variant="outline"
            colorScheme="brand"
            validatorAddress={validatorAddress!}
          />
          <UndelegateModal
            w="50%"
            rounded="full"
            variant="outline"
            colorScheme="brand"
            validatorAddress={validatorAddress!}
          />
        </HStack>
      </Stack>
    </Card>
  )
}
