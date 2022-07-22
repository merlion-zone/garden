import { Dec } from '@merlionzone/merlionjs'

import {
  useQueryDelegation,
  useQueryValidator,
  useQueryValidatorDelegations,
} from '@/hooks/query'
import { getTime } from '@/pages/proposal/utils'

export function useValidator(address?: string) {
  const result = useQueryValidator(address)

  return { ...result, data: result.data?.validator }
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
  const result = useQueryValidatorDelegations(address)

  return { ...result, data: result.data?.delegationResponses }
}

export function useDelegation(delegator?: string, validator?: string) {
  const result = useQueryDelegation(delegator, validator)

  return { ...result, data: result.data?.delegationResponse }
}
