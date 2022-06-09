import useSWR from 'swr'
import { QueryModules, useMerlionQueryClient } from '@/hooks'
import { useCallback } from 'react'
import { QueryDenomMetadataResponse } from 'cosmjs-types/cosmos/bank/v1beta1/query'
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin'

function useMerlionQuery<Data = any, Error = any>(
  module: string,
  method: string,
  ...params: string[]
): {
  data?: Data
  error?: Error
} {
  const client = useMerlionQueryClient()

  const querier = useCallback(
    (module: string, method: string, ...params: string[]) => {
      if (!client) {
        throw new Error('Null query client')
      }
      if (!(module in client)) {
        throw new Error(`Module ${module} not found in Merlion client`)
      }
      const moduleQuery = (<any>client)[module]
      if (!(method in moduleQuery)) {
        throw new Error(
          `RPC method ${method} not found in module ${module} of Merlion client`
        )
      }

      return moduleQuery[method](...params)
    },
    [client]
  )

  return useSWR<Data, Error>(
    client ? [module, method, ...params] : null,
    querier
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
  const { data, error } = useMerlionQuery<Coin>(
    QueryModules.BANK,
    'balance',
    address,
    denom
  )
  return {
    balance: data && data.amount,
    error,
  }
}

export function useSupplyOf(denom: string) {
  const { data, error } = useMerlionQuery<Coin>(
    QueryModules.BANK,
    'supplyOf',
    denom
  )
  return {
    supply: data && data.amount,
    error,
  }
}

export function useDenomMetadata(denom: string) {
  return useMerlionQuery<QueryDenomMetadataResponse>(
    QueryModules.BANK,
    'denomMetadata',
    denom
  )
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
