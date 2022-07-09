import { Dec } from '@merlionzone/merlionjs'
import { useQuery } from 'react-query'

import { useMerlionQueryClient } from '@/hooks'
import { getTime } from '@/pages/proposal/utils'

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
    ? new Dec(validator.commission!.commissionRates!.rate).divPow(18)
    : null

  const maxRate = validator
    ? new Dec(validator.commission!.commissionRates!.maxRate).divPow(18)
    : null

  const maxChangeRate = validator
    ? new Dec(validator.commission!.commissionRates!.maxChangeRate).divPow(18)
    : null

  const updateTime = validator
    ? getTime(validator.commission!.updateTime)
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
