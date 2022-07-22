import { Dec } from '@merlionzone/merlionjs'
import { useMemo } from 'react'

import { LION } from '@/constants'
import {
  BondStatusString,
  useOracleParams,
  useQueryPool,
  useQueryValidatorMissCounters,
  useQueryValidatorRewardsMultiple,
  useQueryValidators,
} from '@/hooks/query'

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
  const { data: poolData } = useQueryPool()
  const isPoolLoading = !poolData

  const { data: oracleParamsData } = useOracleParams()
  const isOracleParamsLoading = !oracleParamsData

  const { data: validatorsData } = useQueryValidators(status)
  const isValidatorsLoading = !validatorsData

  const missCounters = useQueryValidatorMissCounters(
    validatorsData?.validators.map(({ operatorAddress }) => [operatorAddress])
  )

  const validatorRewards = useQueryValidatorRewardsMultiple(
    validatorsData?.validators.map(({ operatorAddress }) => [operatorAddress])
  )

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

        const missCounter = missCounters.data?.[index]
        const uptime =
          slashWindow !== undefined && missCounter !== undefined
            ? 1 -
              new Dec(missCounter.toString())
                .div(slashWindow.toString())
                .toNumber()
            : null

        const rewardsAmount = validatorRewards.data?.[index]?.rewards?.rewards
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
