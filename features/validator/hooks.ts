import { useQuery } from 'react-query'
import BigNumber from 'bignumber.js'
import { useMerlionQueryClient } from '@/hooks'

export function useValidator(address?: string) {
  const queryClient = useMerlionQueryClient()

  return useQuery(
    ['validator', address],
    async () => {
      const { validator } = await queryClient!.staking.validator(address!)
      return validator
    },
    { enabled: !!queryClient && !!address }
  )
}

export function useCommission(address?: string) {
  const { data: validator, ...reset } = useValidator(address)

  const rate = validator
    ? new BigNumber(validator.commission!.commissionRates!.rate).div(
        '1000000000000000000'
      )
    : null

  const maxRate = validator
    ? new BigNumber(validator.commission!.commissionRates!.maxRate).div(
        '1000000000000000000'
      )
    : null

  const maxChangeRate = validator
    ? new BigNumber(validator.commission!.commissionRates!.maxChangeRate).div(
        '1000000000000000000'
      )
    : null

  const updateTime = validator
    ? new Date(
        validator.commission!.updateTime!.seconds.toNumber() * 1000 +
          validator.commission!.updateTime!.nanos
      )
    : null

  return {
    data: {
      rate,
      maxRate,
      maxChangeRate,
      updateTime,
    },
    ...reset,
  }
}

export function useDelegations(address?: string) {
  const queryClient = useMerlionQueryClient()

  return useQuery(
    ['validator', 'delegations', address],
    async () => {
      const { delegationResponses } =
        await queryClient!.staking.validatorDelegations(address!)
      return delegationResponses
    },
    { enabled: !!queryClient && !!address }
  )
}

export function useDelegation(
  delegator?: string | null,
  validator?: string | null
) {
  const queryClient = useMerlionQueryClient()

  return useQuery(
    ['delegation', delegator, validator],
    async () => {
      const { delegationResponse } = await queryClient!.staking.delegation(
        delegator!,
        validator!
      )
      return delegationResponse
    },
    { enabled: !!queryClient && !!delegator && !!validator }
  )
}
