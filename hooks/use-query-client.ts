import { useEffect, useState } from 'react'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'
import {
  DistributionExtension,
  QueryClient,
  setupDistributionExtension,
  setupStakingExtension,
  StakingExtension,
} from '@cosmjs/stargate'
import { OracleExtension, setupOracleExtension } from '@merlionzone/merlionjs'
import { ENDPOINT } from '@/constants'

export function useQueryClient() {
  const [tmClient, setTmClient] = useState<Tendermint34Client | null>(null)
  const [queryClient, setQueryClient] = useState<
    | (QueryClient & StakingExtension & OracleExtension & DistributionExtension)
    | null
  >(null)

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
