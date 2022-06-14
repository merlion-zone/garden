import {
  useQueryDelegatorDelegations,
  useQueryDelegatorRewardsMultiple,
  useQueryDelegatorValidators,
  useQueryPool,
} from '@/hooks/query'
import { formatCoin } from '@/utils'
import config from '@/config'
import { Coin } from '@cosmjs/stargate'
import type { Validator as ValidatorPB } from 'cosmjs-types/cosmos/staking/v1beta1/staking'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'

export interface Validator
  extends Pick<ValidatorPB, 'description' | 'operatorAddress'> {
  votingPower: number | null
  delegation: Coin
  rewards: Coin
}

export function useValidators(address: string | null) {
  const { data: poolData } = useQueryPool()
  const { data: validatorsData } = useQueryDelegatorValidators(address ?? '')
  const { data: delegationsData } = useQueryDelegatorDelegations(address ?? '')

  const { data: rewardsData } = useQueryDelegatorRewardsMultiple(
    validatorsData?.validators.map(({ operatorAddress }) => [
      address as string,
      operatorAddress,
    ]) ?? []
  )

  const balances = delegationsData?.delegationResponses.map(({ balance }) =>
    formatCoin(balance!)
  )

  const totalBonded =
    balances
      ?.map(({ amount }) => Number(amount))
      .reduce((prev, current) => prev + current) ?? 0

  const data: Validator[] = useMemo(() => {
    const bondedTokens = poolData?.pool?.bondedTokens

    return (
      validatorsData?.validators.map(
        ({ description, operatorAddress, tokens }, index) => {
          const votingPower = bondedTokens
            ? new BigNumber(tokens).div(bondedTokens).toNumber()
            : null

          const balance = delegationsData?.delegationResponses.find(
            ({ delegation }) => delegation?.validatorAddress === operatorAddress
          )?.balance ?? { amount: '0', denom: config.denom }

          const rewards = rewardsData?.[index].rewards.find(
            ({ denom }) => denom === config.denom
          ) ?? { amount: '0', denom: config.denom }

          return {
            description: description!,
            votingPower,
            operatorAddress,
            rewards: formatCoin(rewards),
            delegation: formatCoin(balance),
          }
        }
      ) ?? []
    )
  }, [delegationsData, poolData, validatorsData, rewardsData])

  return { data, totalBonded }
}
