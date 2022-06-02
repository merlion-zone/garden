import { DENOM, DECIMALS, MINIMAL_DENOM } from './env'

export interface Currency {
  readonly denom: string
  readonly decimals: number
  readonly minimalDenom: string
}

export const LION: Currency = {
  denom: DENOM,
  decimals: DECIMALS,
  minimalDenom: MINIMAL_DENOM,
}

export const CURRENCIES: Currency[] = [LION]
