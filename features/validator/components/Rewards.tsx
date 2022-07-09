import { Button, HStack, Stack, Text } from '@chakra-ui/react'
import { typeUrls } from '@merlionzone/merlionjs'
import { useMemo } from 'react'

import { TransactionToast } from '@/components/TransactionToast'
import config from '@/config'
import { useAccountAddress, useConnectWallet } from '@/hooks'
import { useMerlionQuery } from '@/hooks/query'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'
import { formatCoin } from '@/utils'

import { useDelegation } from '../hooks'
import { Card } from './Card'

export interface RewardsProps {
  validatorAddress?: string
}

export function Rewards({ validatorAddress }: RewardsProps) {
  const toast = useToast()
  const { sendTx } = useSendCosmTx()
  const address = useAccountAddress()
  const { connected } = useConnectWallet()
  const { data: delegationData } = useDelegation(
    address?.mer(),
    validatorAddress
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
    validatorAddress
  )
  const reward = useMemo(() => {
    const reward = data?.rewards.find((r) => r.denom === config.denom)
    return reward && formatCoin(reward)
  }, [data])

  const onWithdraw = () => {
    if (!connected) {
      toast({
        title: 'Please connect wallet first',
        status: 'warning',
      })
      return
    }

    if (!address || !validatorAddress) {
      return
    }

    const msg = {
      typeUrl: typeUrls.MsgWithdrawDelegatorReward,
      value: {
        delegatorAddress: address?.mer(),
        validatorAddress: validatorAddress,
      },
    }

    const receiptPromise = sendTx(msg)

    toast({
      render: ({ onClose }) => (
        <TransactionToast
          title={`Withdraw validator(${validatorAddress?.slice(
            0,
            14
          )}...${validatorAddress?.slice(-4)}) Reward`}
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
