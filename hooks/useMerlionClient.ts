import { useEffect } from 'react'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'
import {
  AuthExtension,
  BankExtension,
  DistributionExtension,
  GasPrice,
  GovExtension,
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupDistributionExtension,
  setupGovExtension,
  setupStakingExtension,
  StakingExtension,
} from '@cosmjs/stargate'
import {
  MerlionClient,
  OracleExtension,
  MakerExtension,
  setupOracleExtension,
  setupMakerExtension,
  setupVeExtension,
  VeExtension,
  setupTendermintExtension,
  TendermintExtension,
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

export type QueryExtensions = TendermintExtension &
  AuthExtension &
  BankExtension &
  DistributionExtension &
  GovExtension &
  OracleExtension &
  MakerExtension &
  StakingExtension &
  VeExtension

export type MerlionQueryClient = QueryClient & QueryExtensions

const merlionQueryClientAtom = atom<MerlionQueryClient | null>(null)

export function useMerlionQueryClient(): MerlionQueryClient | null {
  const [queryClient, setQueryClient] = useAtom(merlionQueryClientAtom)

  useEffect(() => {
    const connect = async () => {
      const tmClient = await Tendermint34Client.connect(config.rpcEndpoint)
      setQueryClient(
        QueryClient.withExtensions(
          tmClient,
          setupTendermintExtension(tmClient),
          setupAuthExtension,
          setupBankExtension,
          setupStakingExtension,
          setupDistributionExtension,
          setupGovExtension,
          setupOracleExtension,
          setupMakerExtension,
          setupVeExtension
        )
      )
    }
    connect().catch(console.error)
  }, [setQueryClient])

  return queryClient
}
