import { useQuery } from 'react-query'
import { useMerlionQueryClient } from './useMerlionClient'

export type BondStatusString =
  | ''
  | 'BOND_STATUS_UNBONDED'
  | 'BOND_STATUS_UNBONDING'
  | 'BOND_STATUS_BONDED'
  | 'UNRECOGNIZED'

export function useValidators(status: BondStatusString = '') {
  const queryClient = useMerlionQueryClient()

  return useQuery(
    ['validators', status],
    // @ts-ignore
    async () => queryClient!.staking.validators(status),
    { enabled: !!queryClient }
  )
}
