import { useMemo } from 'react'
import { useQueries, useQuery } from 'react-query'
import BigNumber from 'bignumber.js'

import { LION } from '@/constants'
import { useMerlionQueryClient } from '@/hooks'

export type BondStatusString =
  | 'BOND_STATUS_UNBONDED'
  | 'BOND_STATUS_UNBONDING'
  | 'BOND_STATUS_BONDED'
  | 'UNRECOGNIZED'

export interface Validator {
  operatorAddress: string
  description?: {
    moniker: string
    identity: string
    website: string
    securityContact: string
    details: string
  }
  votingPower: number | null
  commission: number | null
  uptime: number | null
  rewards: {
    amount: number | null
    denom: string
  }
}

export function useValidatorsData(status: BondStatusString) {
  const queryClient = useMerlionQueryClient()

  const { data: poolData, isLoading: isPoolLoading } = useQuery(
    ['pool'],
    async () => queryClient?.staking.pool(),
    {
      enabled: !!queryClient,
    }
  )
  const { data: oracleParamsData, isLoading: isOracleParamsLoading } = useQuery(
    ['oracleParams'],
    async () => queryClient!.oracle.params(),
    {
      enabled: !!queryClient,
    }
  )
  const { data: validatorsData, isLoading: isValidatorsLoading } = useQuery(
    ['validators', status],
    async () => queryClient!.staking.validators(status),
    { enabled: !!queryClient }
  )

  const missCounters = useQueries({
    queries:
      validatorsData?.validators.map(({ operatorAddress }) => ({
        queryKey: ['missCounter', operatorAddress],
        queryFn: async () => queryClient!.oracle.missCounter(operatorAddress),
        enabled: !!queryClient,
      })) ?? [],
  })

  const validatorRewards = useQueries({
    queries:
      validatorsData?.validators.map(({ operatorAddress }) => ({
        queryKey: ['validatorRewards', operatorAddress],
        queryFn: async () =>
          queryClient!.distribution.validatorOutstandingRewards(
            operatorAddress
          ),
        enabled: !!queryClient,
      })) ?? [],
  })

  const data: Validator[] = useMemo(() => {
    const bondedTokens = poolData?.pool?.bondedTokens
    const slashWindow = oracleParamsData?.slashWindow
    return (
      validatorsData?.validators.map((validator, index) => {
        const votingPower = bondedTokens
          ? new BigNumber(validator.tokens).div(bondedTokens).toNumber()
          : null

        const commission = validator.commission?.commissionRates?.rate
          ? new BigNumber(validator.commission.commissionRates.rate)
              .div('1000000000000000000')
              .toNumber()
          : null

        const missCounter = missCounters[index].data
        const uptime =
          slashWindow && missCounter
            ? 1 -
              new BigNumber(missCounter.toString())
                .div(slashWindow.toString())
                .toNumber()
            : null

        const rewardsAmount = validatorRewards[
          index
        ].data?.rewards?.rewards.find(
          ({ denom }) => denom === LION.minimalDenom
        )?.amount

        const amount: number | null = rewardsAmount
          ? new BigNumber(rewardsAmount)
              .div(validator.tokens)
              .div('1000000000000000000')
              .times(100)
              .toNumber()
          : null

        return {
          operatorAddress: validator.operatorAddress,
          description: validator.description,
          votingPower,
          commission,
          uptime,
          rewards: { amount, denom: 'lion' },
        }
      }) ?? []
    )
  }, [
    missCounters,
    oracleParamsData,
    poolData,
    validatorRewards,
    validatorsData,
  ])

  return {
    data,
    missCounters,
    validatorRewards,
    isPoolLoading,
    isOracleParamsLoading,
    isValidatorsLoading,
  }
}
