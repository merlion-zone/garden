import { typeUrls } from '@merlionzone/merlionjs'
import { TransactionToast } from '@/components/TransactionToast'
import config from '@/config'
import { useAccountAddress } from '@/hooks'
import { useMerlionQuery } from '@/hooks/query'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'
import { formatCoin } from '@/utils'
import { Button, HStack, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { Card } from './Card'
import { useDelegation } from '../hooks'

export function Rewards() {
  const toast = useToast()
  const { query } = useRouter()
  const { sendTx } = useSendCosmTx()
  const address = useAccountAddress()
  const { data: delegationData } = useDelegation(
    address?.mer(),
    query.address as string
  )
  const balance = useMemo(
    () =>
      delegationData && delegationData.balance
        ? formatCoin(delegationData.balance)
        : null,
    [delegationData]
  )

  const { data } = useMerlionQuery(
    'distribution',
    'delegationRewards',
    address?.mer(),
    query.address as string
  )
  const reward = useMemo(() => {
    const reward = data?.rewards.find((r) => r.denom === config.denom)
    return reward && formatCoin(reward)
  }, [data])

  const onWithdraw = () => {
    if (!address || !query.address) {
      toast({
        title: 'Please connect wallet first',
        status: 'warning',
      })
    }
    const msg = {
      typeUrl: typeUrls.MsgWithdrawDelegatorReward,
      value: {
        delegatorAddress: address?.mer(),
        validatorAddress: query.address,
      },
    }

    const receiptPromise = sendTx(msg)

    toast({
      render: ({ onClose }) => (
        <TransactionToast
          title={`Withdraw validator(${query.address?.slice(
            0,
            14
          )}...${query.address?.slice(-4)}) Reward`}
          receiptPromise={receiptPromise}
          onClose={onClose}
        />
      ),
    })
  }

  return (
    <Card>
      <Stack spacing="4">
        <Text fontSize="lg" fontWeight="medium">
          My rewards
        </Text>
        <HStack alignItems="baseline" mb="4">
          <Text fontSize="4xl">{reward?.amount ?? 0}</Text>
          <Text>{config.displayDenom}</Text>
        </HStack>
        <Button
          w="full"
          rounded="full"
          colorScheme="brand"
          disabled={Number(balance?.amount ?? 0) <= 0}
          onClick={onWithdraw}
        >
          Withdraw rewards
        </Button>
      </Stack>
    </Card>
  )
}
