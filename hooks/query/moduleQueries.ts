import { Coin, Dec, Events } from '@merlionzone/merlionjs'
import { Pagination } from '@merlionzone/merlionjs/dist/queryclient'
import { DenomUnit, Metadata } from 'cosmjs-types/cosmos/bank/v1beta1/bank'
import { ProposalStatus } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import { useCallback, useMemo } from 'react'
import useSWR, { Fetcher } from 'swr'

import config from '@/config'
import {
  BondStatusString,
  QueryExtensions,
  useMerlionQueryClient,
} from '@/hooks'
import { formatNumber } from '@/utils'

export function useMerlionQuery<
  Module extends keyof QueryExtensions,
  Method extends keyof QueryExtensions[Module],
  Params extends QueryExtensions[Module][Method] extends (...args: any[]) => any
    ? Parameters<QueryExtensions[Module][Method]> extends (infer Param)[]
      ? (Param | undefined)[]
      : never
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
    querier as Fetcher<Response, any>,
    {
      onError: (err: Error, key: string) => {
        if (
          err.stack?.includes(
            'panic message redacted to hide potentially sensitive system info'
          )
        ) {
          console.error(`${key}: ${err.stack}`)
        } else {
          // console.debug(`${key}: ${err.stack}`)
        }
      },
    }
  )
}

export function useMerlionQueryMultiple<
  Module extends keyof QueryExtensions,
  Method extends keyof QueryExtensions[Module],
  Params extends QueryExtensions[Module][Method] extends (...args: any[]) => any
    ? Parameters<QueryExtensions[Module][Method]>
    : never,
  ParamsWithUndefined extends Params extends (infer Param)[]
    ? (Param | undefined)[]
    : never,
  Response extends QueryExtensions[Module][Method] extends (
    ...args: any[]
  ) => any
    ? Awaited<ReturnType<QueryExtensions[Module][Method]>>
    : never
>(module: Module, method: Method, params: ParamsWithUndefined[] | undefined) {
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
    client &&
      params?.every((p) => p.every((p) => p !== undefined && p !== null))
      ? [module, method, ...params]
      : null,
    querier as Fetcher<Response[], any>
  )
}

/****************************** Tendermint ******************************/

export function useChainStatus() {
  return useMerlionQuery('tendermint', 'status')
}

/****************************** Bank ******************************/

export function useBalance(address?: string, denom?: string) {
  const { data, ...rest } = useMerlionQuery('bank', 'balance', address, denom)
  return {
    balance: data && data.amount,
    ...rest,
  }
}

// deprecated: it cannot fetch all denom balances
export function useBalances(address?: string) {
  return useMerlionQuery('bank', 'allBalances', address)
}

// deprecated: it cannot fetch all denom balances
export function useBalancesMap(address?: string) {
  const { data: balances, error } = useBalances(address)
  const data = useMemo(() => {
    const balancesMap = new Map()
    balances?.forEach((b) => {
      balancesMap.set(b.denom, b.amount)
    })
    return balancesMap
  }, [balances])
  return { data, error }
}

export function useSupplyOf(denom?: string) {
  return useMerlionQuery('bank', 'supplyOf', denom)
}

export interface DenomMetadata extends Metadata {
  denomUnitsMap: Map<string, DenomUnit>
  displayExponent: number
}

function extendDenomMetadata(metadata: Metadata): DenomMetadata {
  const denomUnitsMap = new Map<string, DenomUnit>()
  metadata.denomUnits.forEach((d) => {
    denomUnitsMap.set(d.denom, d)
  })
  return {
    denomUnitsMap,
    displayExponent: denomUnitsMap.get(metadata.display)?.exponent || 0,
    ...metadata,
  }
}

const lionMetadata: Metadata = {
  base: config.denom,
  denomUnits: [
    { denom: config.denom, exponent: 0, aliases: [] },
    {
      denom: config.displayDenom.toLowerCase(),
      exponent: config.denomDecimals,
      aliases: [],
    },
  ],
  description: 'The native gas & staking token of the Merlion.',
  display: config.displayDenom.toLowerCase(),
  name: config.displayDenom,
  symbol: config.displayDenom,
}

export function useDenomMetadata(denom?: string) {
  const { data, ...remain } = useMerlionQuery('bank', 'denomMetadata', denom)
  return useMemo(() => {
    if (denom === config.denom) {
      return {
        data: extendDenomMetadata(lionMetadata),
      }
    }
    return {
      data: data && extendDenomMetadata(data),
      ...remain,
    }
  }, [data, denom, remain])
}

// TODO: pagination
export function useDenomsMetadata() {
  const { data, ...remain } = useMerlionQuery('bank', 'denomsMetadata')
  const denomsMetadata = useMemo(() => {
    return (
      data &&
      data
        .concat([lionMetadata])
        .map((metadata) => extendDenomMetadata(metadata))
    )
  }, [data])

  return {
    data: denomsMetadata,
    ...remain,
  }
}

// TODO: limit denom list
export function useDenomsMetadataMap() {
  const { data: denomsMetadata, ...rest } = useDenomsMetadata()

  const data = useMemo(() => {
    if (!denomsMetadata) {
      return denomsMetadata
    }
    const denomsMetadataMap = new Map<string, DenomMetadata>()
    denomsMetadata.forEach((metadata) => {
      denomsMetadataMap.set(metadata.base, metadata)
    })
    return denomsMetadataMap
  }, [denomsMetadata])

  return {
    data,
    ...rest,
  }
}

function parseCoin(coin?: string): Coin | undefined {
  if (!coin) {
    return undefined
  }
  try {
    return Coin.fromString(coin)
  } catch {
    return undefined
  }
}

function formatCoin(
  denomsMetadata?: Map<string, DenomMetadata>,
  coin?: Coin | string,
  maximumFractionDigits?: number
): string | undefined {
  let parsed = coin
  if (typeof parsed === 'string') {
    parsed = parseCoin(parsed)
  }
  if (!parsed) {
    return
  }
  const metadata = denomsMetadata?.get(parsed.denom)
  if (!metadata) {
    return
  }
  return `${formatNumber(
    new Dec(parsed?.amount).divPow(metadata.displayExponent).toString(),
    maximumFractionDigits ?? metadata.displayExponent
  )} ${metadata.symbol}`
}

export function useFormatCoin(
  coin?: Coin | string,
  maximumFractionDigits?: number
): string | undefined {
  const { data: denomsMetadata } = useDenomsMetadataMap()

  return useMemo(() => {
    return formatCoin(denomsMetadata, coin, maximumFractionDigits)
  }, [coin, denomsMetadata, maximumFractionDigits])
}

export function useFormatCoins(
  coins?: (Coin | string)[],
  maximumFractionDigits?: number
): (string | undefined)[] | undefined {
  const { data: denomsMetadata } = useDenomsMetadataMap()
  return useMemo(() => {
    return coins?.map((coin) =>
      formatCoin(denomsMetadata, coin, maximumFractionDigits)
    )
  }, [coins, denomsMetadata, maximumFractionDigits])
}

/****************************** Oracle ******************************/

export function useOracleParams() {
  return useMerlionQuery('oracle', 'params')
}

export function useCoinPrice(denom?: string) {
  const { data, ...rest } = useMerlionQuery('oracle', 'exchangeRate', denom)
  return useMemo(() => {
    return {
      data: data ? Dec.fromProto(data) : undefined,
      ...rest,
    }
  }, [data, rest])
}

export function usePrices(denoms?: [string?][]) {
  return useMerlionQueryMultiple('oracle', 'exchangeRate', denoms)
}

export function useLionPrice() {
  return useCoinPrice(config.denom)
}

export function useMerPrice() {
  return useCoinPrice(config.merDenom)
}

function displayCoinPrice(
  metadata?: DenomMetadata,
  price?: Dec
): Dec | undefined {
  if (!metadata || !price || metadata.displayExponent === undefined) {
    return undefined
  }
  // TODO: 1e6
  return price.mulPow(metadata.displayExponent).div(1e6)
}

export function useDisplayPrice(denom?: string) {
  const { data: denomsMetadata, error: err1 } = useDenomsMetadataMap()
  const { data: price, error: err2 } = useCoinPrice(denom)
  const data = useMemo(
    () => displayCoinPrice(denomsMetadata?.get(denom || ''), price),
    [denom, denomsMetadata, price]
  )
  return {
    data,
    error: err1 || err2,
  }
}

export function useDisplayPrices(denoms?: [string?][]) {
  const { data: denomsMetadata, error: err1 } = useDenomsMetadataMap()
  const { data: prices, error: err2 } = usePrices(denoms)
  const data = useMemo(
    () =>
      prices?.map((price, i) =>
        displayCoinPrice(
          denomsMetadata?.get(denoms?.[i][0] || ''),
          Dec.fromProto(price)
        )
      ),
    [denoms, denomsMetadata, prices]
  )
  return {
    data,
    error: err1 || err2,
  }
}

/****************************** Maker ******************************/

export function useMerTargetPrice() {
  // TODO: get on-chain
  return useMemo(() => {
    return {
      data: new Dec(1),
    }
  }, [])
}

export function useMakerParams() {
  return useMerlionQuery('maker', 'params')
}

export function useAllBackingParams() {
  return useMerlionQuery('maker', 'allBackingRiskParams')
}

export function useAllCollateralParams() {
  return useMerlionQuery('maker', 'allCollateralRiskParams')
}

export function useFirstCollateralDenom() {
  const { data: allParams, ...rest } = useAllCollateralParams()
  const denom = useMemo(() => allParams?.at(0)?.collateralDenom, [allParams])
  return {
    denom,
    ...rest,
  }
}

export function useCollateralParams(denom?: string) {
  const { data: allParams, ...rest } = useAllCollateralParams()
  const params = useMemo(
    () => allParams?.find((params) => params.collateralDenom === denom),
    [allParams, denom]
  )
  return {
    params,
    ...rest,
  }
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

export function useCollateralPool(denom?: string) {
  const { data: allPools, ...rest } = useAllCollateralPools()
  const pool = useMemo(
    () => allPools?.find((params) => params.collateral?.denom === denom),
    [allPools, denom]
  )
  return {
    pool,
    ...rest,
  }
}

export function useAccountCollateral(
  account?: string,
  collateralDenom?: string
) {
  return useMerlionQuery(
    'maker',
    'collateralOfAccount',
    account,
    collateralDenom
  )
}

export function useBackingRatio() {
  const { data, ...rest } = useMerlionQuery('maker', 'backingRatio')
  return useMemo(() => {
    return {
      data: data && {
        ...data,
        backingRatio: Dec.fromProto(data.backingRatio),
      },
      ...rest,
    }
  }, [data, rest])
}

/***************************** Staking ******************************/

export function useQueryPool() {
  return useMerlionQuery('staking', 'pool')
}

export function useQueryValidators(status: BondStatusString) {
  // @ts-ignore
  return useMerlionQuery('staking', 'validators', status)
}

export function useQueryDelegatorValidators(address?: string) {
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

export function useQueryValidatorDelegations(
  address?: string,
  pagination?: Pagination
) {
  return useMerlionQuery('staking', 'validatorDelegations', address, pagination)
}

export function useQueryDelegation(
  delegatorAddress?: string,
  validatorAddress?: string
) {
  return useMerlionQuery(
    'staking',
    'delegation',
    delegatorAddress,
    validatorAddress
  )
}

export function useQueryDelegatorDelegations(address?: string | null) {
  return useMerlionQuery('staking', 'delegatorDelegations', address as string)
}

export function useQueryProposals(
  proposalStatus: ProposalStatus,
  depositor: string,
  voter: string,
  pagination: {
    key?: Uint8Array | undefined
    offset?: string | number | undefined
    limit?: string | number | undefined
    countTotal?: boolean | undefined
    reverse?: boolean | undefined
  } = {}
) {
  return useMerlionQuery(
    'gov',
    'proposals',
    proposalStatus,
    depositor,
    voter,
    pagination
  )
}

export function useQueryProposal(id: string) {
  return useMerlionQuery('gov', 'proposal', id)
}

export function useQueryProposalTallyResult(id?: string) {
  return useMerlionQuery('gov', 'tally', id)
}

export function useQueryGovParams(type: 'deposit' | 'tallying' | 'voting') {
  return useMerlionQuery('gov', 'params', type)
}

/***************************** Txs ******************************/

export function useTxs(events?: Events, page: number = 1, limit: number = 10) {
  return useMerlionQuery('tx', 'getTxsEvent', events, {
    offset: (page - 1) * limit,
    limit,
    isDesc: true,
  })
}
