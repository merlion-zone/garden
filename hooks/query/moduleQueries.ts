import useSWR, { Fetcher } from 'swr'
import {
  BondStatusString,
  QueryExtensions,
  useMerlionQueryClient,
} from '@/hooks'
import { useCallback } from 'react'
import { Dec } from '@merlionzone/merlionjs'
import { Metadata } from 'cosmjs-types/cosmos/bank/v1beta1/bank'
import { DenomUnit } from '../../../merlionjs/src/proto/cosmos/bank/v1beta1/bank'

export function useMerlionQuery<
  Module extends keyof QueryExtensions,
  Method extends keyof QueryExtensions[Module],
  Params extends QueryExtensions[Module][Method] extends (...args: any[]) => any
    ? Parameters<QueryExtensions[Module][Method]>
    : never,
  Response extends QueryExtensions[Module][Method] extends (
    ...args: any[]
  ) => any
    ? Awaited<ReturnType<QueryExtensions[Module][Method]>>
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
  Module extends keyof QueryExtensions,
  Method extends keyof QueryExtensions[Module],
  Params extends QueryExtensions[Module][Method] extends (...args: any[]) => any
    ? Parameters<QueryExtensions[Module][Method]>
    : never,
  Response extends QueryExtensions[Module][Method] extends (
    ...args: any[]
  ) => any
    ? Awaited<ReturnType<QueryExtensions[Module][Method]>>
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

/****************************** Tendermint ******************************/

export function useStatus() {
  return useMerlionQuery('tendermint', 'status')
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

export interface DenomMetadata extends Metadata {
  denomUnitsMap: Map<string, DenomUnit>
  displayExponent?: number
}

function extendDenomMetadata(metadata: Metadata): DenomMetadata {
  const denomUnitsMap = new Map<string, DenomUnit>()
  metadata.denomUnits.forEach((d) => {
    denomUnitsMap.set(d.denom, d)
  })
  return {
    denomUnitsMap,
    displayExponent: denomUnitsMap.get(metadata.display)?.exponent,
    ...metadata,
  }
}

export function useDenomMetadata(denom: string) {
  const { data, ...remain } = useMerlionQuery('bank', 'denomMetadata', denom)
  return {
    data: data && extendDenomMetadata(data),
    ...remain,
  }
}

export function useDenomsMetadata() {
  const { data, ...remain } = useMerlionQuery('bank', 'denomsMetadata')
  return {
    data: data && data.map((metadata) => extendDenomMetadata(metadata)),
    ...remain,
  }
}

/****************************** Oracle ******************************/

export function useOracleParams() {
  return useMerlionQuery('oracle', 'params')
}

export function useCoinPrice(denom: string): { price?: Dec; error: any } {
  const { data, error } = useMerlionQuery('oracle', 'exchangeRate', denom)
  console.debug(
    `useCoinPrice, denom ${denom}, price ${
      data && Dec.fromProto(data).toString()
    }`
  )
  return {
    price: data ? Dec.fromProto(data) : undefined,
    error,
  }
}

export function useLionPrice(): { price?: Dec; error: any } {
  return useCoinPrice('alion')
}

export function useMerPrice(): { price?: Dec; error: any } {
  return useCoinPrice('uusd')
}

/****************************** Maker ******************************/

export function useMakerParams() {
  return useMerlionQuery('maker', 'params')
}

export function useAllBackingParams() {
  return useMerlionQuery('maker', 'allBackingRiskParams')
}

export function useAllCollateralParams() {
  return useMerlionQuery('maker', 'allCollateralRiskParams')
}

export function useTotalBacking() {
  return useMerlionQuery('maker', 'totalBacking')
}

export function useTotalCollateral() {
  return useMerlionQuery('maker', 'totalCollateral')
}

export function useAllBackingPools() {
  return useMerlionQuery('maker', 'allBackingPools')
}

export function useAllCollateralPools() {
  return useMerlionQuery('maker', 'allCollateralPools')
}

export function useBackingRatio() {
  return useMerlionQuery('maker', 'backingRatio')
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
