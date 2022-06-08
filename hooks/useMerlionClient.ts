import { useEffect, useState } from 'react'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'
import {
  AuthExtension,
  BankExtension,
  DistributionExtension,
  GasPrice,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupDistributionExtension,
  setupStakingExtension,
  StakingExtension,
} from '@cosmjs/stargate'
import {
  MerlionClient,
  OracleExtension,
  setupOracleExtension,
} from '@merlionzone/merlionjs'
import config from '@/config'
import { useConnectWallet } from '@/hooks/useConnectWallet'
import { atom, useAtom } from 'jotai'

const merlionClientAtom = atom<MerlionClient | null>(null)

export function useMerlionClient(): MerlionClient | null {
  const [merlionClient, setMerlionClient] = useAtom(merlionClientAtom)

  const { signer } = useConnectWallet()

  useEffect(() => {
    if (!signer) {
      return
    }

    MerlionClient.connectWithSigner(config.rpcEndpoint, signer, {
      gasPrice: GasPrice.fromString('1alion'), // TODO
    })
      .then((client) => setMerlionClient(client))
      .catch(console.error)
  }, [setMerlionClient, signer])

  return merlionClient
}

export type MerlionQueryClient = QueryClient &
  AuthExtension &
  BankExtension &
  StakingExtension &
  DistributionExtension &
  OracleExtension

export const QueryModules = {
  AUTH: 'auth' as const,
  BANK: 'bank' as const,
  STAKING: 'staking' as const,
  DISTRIBUTION: 'distribution' as const,
  ORACLE: 'oracle' as const,
}

const merlionQueryClientAtom = atom<MerlionQueryClient | null>(null)

export function useMerlionQueryClient(): MerlionQueryClient | null {
  const [queryClient, setQueryClient] = useAtom(merlionQueryClientAtom)

  useEffect(() => {
    const connect = async () => {
      const tmClient = await Tendermint34Client.connect(config.rpcEndpoint)
      setQueryClient(
        QueryClient.withExtensions(
          tmClient,
          setupAuthExtension,
          setupBankExtension,
          setupStakingExtension,
          setupDistributionExtension,
          setupOracleExtension
        )
      )
    }
    connect().catch(console.error)
  }, [setQueryClient])

  return queryClient
}
