import { useQuery } from 'react-query'
import { useMerlionQueryClient } from './useMerlionClient'

export type BondStatusString =
  | 'BOND_STATUS_UNBONDED'
  | 'BOND_STATUS_UNBONDING'
  | 'BOND_STATUS_BONDED'
  | 'UNRECOGNIZED'

export function useValidators(status: BondStatusString = 'BOND_STATUS_BONDED') {
  const queryClient = useMerlionQueryClient()

  return useQuery(
    ['validators', status],
    async () => queryClient!.staking.validators(status),
    { enabled: !!queryClient }
  )
}
