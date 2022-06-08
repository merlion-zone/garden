import config from '@/config'
import { useConnectWallet } from '@/hooks'
import { formatCoin } from '@/utils'
import { HStack, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useDelegation } from '../hooks'
import { Card } from './Card'
import { Delegate } from './Delegate'
import { Redelegate } from './Redelegate'
import { Undelegate } from './Undelegate'

export function Delegation() {
  const { query } = useRouter()
  const { account } = useConnectWallet()
  const { data } = useDelegation(account, query.address as string)
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
          <Text fontSize="4xl">{balance?.amount ?? 0}</Text>
          <Text>{balance?.denom.toUpperCase() ?? config.displayDenom}</Text>
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
