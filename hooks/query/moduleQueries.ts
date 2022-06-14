import useSWR, { Fetcher } from 'swr'
import { BondStatusString, QueryModules, useMerlionQueryClient } from '@/hooks'
import { useCallback } from 'react'

export function useMerlionQuery<
  Module extends keyof QueryModules,
  Method extends keyof QueryModules[Module],
  Params extends QueryModules[Module][Method] extends (...args: any[]) => any
    ? Parameters<QueryModules[Module][Method]>
    : never,
  Response extends QueryModules[Module][Method] extends (...args: any[]) => any
    ? Awaited<ReturnType<QueryModules[Module][Method]>>
    : never
>(module: Module, method: Method, ...params: Params) {
  const client = useMerlionQueryClient()

  const querier = useCallback(
    (module: Module, method: Method, ...params: Params) => {
      if (!client) {
        throw new Error('Null query client')
      }
      if (!(module in client)) {
        throw new Error(`Module ${module} not found in Merlion client`)
      }
      const moduleQuery = client[module]
      if (!(method in moduleQuery)) {
        throw new Error(
          `RPC method ${String(
            method
          )} not found in module ${module} of Merlion client`
        )
      }

      const fun: (...args: Params) => Promise<Response> = moduleQuery[
        method
      ] as any

      return fun(...params)
    },
    [client]
  )

  return useSWR(
    client && params.every((p) => p !== undefined && p !== null)
      ? [module, method, ...params]
      : null,
    querier as Fetcher<Response, any> // TODO
  )
}

export function useMerlionQueryMultiple<
  Module extends keyof QueryModules,
  Method extends keyof QueryModules[Module],
  Params extends QueryModules[Module][Method] extends (...args: any[]) => any
    ? Parameters<QueryModules[Module][Method]>
    : never,
  Response extends QueryModules[Module][Method] extends (...args: any[]) => any
    ? Awaited<ReturnType<QueryModules[Module][Method]>>
    : never
>(module: Module, method: Method, params: Params[]) {
  const client = useMerlionQueryClient()

  const querier = useCallback(
    (module: Module, method: Method, ...params: Params) => {
      if (!client) {
        throw new Error('Null query client')
      }
      if (!(module in client)) {
        throw new Error(`Module ${module} not found in Merlion client`)
      }
      const moduleQuery = client[module]
      if (!(method in moduleQuery)) {
        throw new Error(
          `RPC method ${String(
            method
          )} not found in module ${module} of Merlion client`
        )
      }

      const fun: (...args: Params) => Promise<Response> = moduleQuery[
        method
      ] as any

      return Promise.all(params.map((p) => fun(...p)))
    },
    [client]
  )

  return useSWR(
    client && params.every((p) => p.every((p) => p !== undefined && p !== null))
      ? [module, method, ...params]
      : null,
    querier as Fetcher<Response[], any> // TODO
  )
}

/****************************** Bank ******************************/

export function useBalance(
  address: string,
  denom: string
): {
  balance?: string
  error?: any
} {
  const { data, error } = useMerlionQuery('bank', 'balance', address, denom)
  return {
    balance: data && data.amount,
    error,
  }
}

export function useSupplyOf(denom: string) {
  return useMerlionQuery('bank', 'supplyOf', denom)
}

export function useDenomMetadata(denom: string) {
  return useMerlionQuery('bank', 'denomMetadata', denom)
}

export function useQueryOracleParams() {
  return useMerlionQuery('oracle', 'params')
}

/****************************** Oracle ******************************/

export function useCoinPrice(denom: string): number {
  // TODO
  return 0
}

export function useLionPrice(): number {
  // TODO
  return 10
}

export function useMerPrice(): number {
  // TODO
  return 1
}

/***************************** Staking ******************************/

export function useQueryPool() {
  return useMerlionQuery('staking', 'pool')
}

export function useQueryValidators(status: BondStatusString) {
  // @ts-ignore
  return useMerlionQuery('staking', 'validators', status)
}

export function useQueryDelegatorValidators(address: string) {
  return useMerlionQuery('staking', 'delegatorValidators', address)
}

export function useQueryValidatorRewardsMultiple(params: [string][]) {
  return useMerlionQueryMultiple(
    'distribution',
    'validatorOutstandingRewards',
    params
  )
}

export function useQueryDelegatorRewardsMultiple(params: [string, string][]) {
  return useMerlionQueryMultiple('distribution', 'delegationRewards', params)
}

export function useQueryValidatorMissCounters(params: [string][]) {
  return useMerlionQueryMultiple('oracle', 'missCounter', params)
}

export function useQueryDelegatorDelegations(address?: string | null) {
  return useMerlionQuery('staking', 'delegatorDelegations', address as string)
}
