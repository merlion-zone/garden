import { useQuery } from 'react-query'

import { useMerlionClient } from './useMerlionClient'

export const useBalance = (address?: string, denom?: string) => {
  const merlionClient = useMerlionClient('keplr') // TODO

  return useQuery(
    ['balance', address, denom],
    async () => merlionClient!.getBalance(address!, denom!),
    { enabled: !!(merlionClient && address && denom) }
  )
}
