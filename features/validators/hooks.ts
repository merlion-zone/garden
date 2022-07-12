import { Dec } from '@merlionzone/merlionjs'
import { useMemo } from 'react'
import { useQueries, useQuery } from 'react-query'

import config from '@/config'
import { LION } from '@/constants'
import { BondStatusString, useMerlionQueryClient, useValidators } from '@/hooks'

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
  const { data: validatorsData, isLoading: isValidatorsLoading } =
    useValidators(status)

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
          ? new Dec(validator.tokens).div(bondedTokens).toNumber()
          : null

        const commission = validator.commission?.commissionRates?.rate
          ? new Dec(validator.commission.commissionRates.rate)
              .divPow(18)
              .toNumber()
          : null

        const missCounter = missCounters[index].data
        const uptime =
          slashWindow !== undefined && missCounter !== undefined
            ? 1 -
              new Dec(missCounter.toString())
                .div(slashWindow.toString())
                .toNumber()
            : null

        const rewardsAmount = validatorRewards[index].data?.rewards?.rewards
          .map(({ amount, denom }) => ({
            amount: Dec.fromProto(amount),
            denom,
          }))
          .find(({ denom }) => denom === LION.minimalDenom)?.amount

        const amount: number | null = rewardsAmount
          ? rewardsAmount.div(validator.tokens).times(100).toNumber()
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
