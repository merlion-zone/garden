export const ENDPOINT = process.env.ENDPOINT as string

export const CHAIN_ID = process.env.CHAIN_ID ?? 'merlion_5000-1'
export const BECH32_PREFIX = process.env.BECH32_PREFIX ?? 'mer'

export const DENOM = process.env.DENOM ?? 'lion'
export const DECIMALS = Number(process.env.DECIMALS ?? 18)
export const MINIMAL_DENOM = process.env.MINIMAL_DENOM ?? 'alion'
