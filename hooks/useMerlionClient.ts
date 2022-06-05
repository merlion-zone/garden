import { useEffect, useState } from 'react'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'
import {
  DistributionExtension,
  GasPrice,
  QueryClient,
  setupDistributionExtension,
  setupStakingExtension,
  StakingExtension,
} from '@cosmjs/stargate'
import {
  MerlionClient,
  OracleExtension,
  setupOracleExtension,
} from '@merlionzone/merlionjs'
import { ENDPOINT } from '@/constants'
import { useConnectWallet, WalletType } from '@/hooks/useConnectWallet'

export function useMerlionClient(walletType: WalletType): MerlionClient | null {
  const [merlionClient, setMerlionClient] = useState<MerlionClient | null>(null)

  const { signer } = useConnectWallet()

  useEffect(() => {
    if (!signer) {
      return
    }

    MerlionClient.connectWithSigner(ENDPOINT, signer, {
      gasPrice: GasPrice.fromString('1alion'), // TODO
    })
      .then((client) => setMerlionClient(client))
      .catch(console.error)
  }, [signer])

  return merlionClient
}

type MerlionQueryClient = QueryClient &
  StakingExtension &
  OracleExtension &
  DistributionExtension

export function useMerlionQueryClient(): MerlionQueryClient | null {
  const [tmClient, setTmClient] = useState<Tendermint34Client | null>(null)
  const [queryClient, setQueryClient] = useState<MerlionQueryClient | null>(
    null
  )

  useEffect(() => {
    Tendermint34Client.connect(ENDPOINT)
      .then((tmClient) => setTmClient(tmClient))
      .catch((error) => console.log(error))
  }, [])

  useEffect(() => {
    if (!tmClient) return

    setQueryClient(
      QueryClient.withExtensions(
        tmClient,
        setupStakingExtension,
        setupOracleExtension,
        setupDistributionExtension
      )
    )
  }, [tmClient])

  return queryClient
}
