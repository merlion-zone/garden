import { ChainId } from '@merlionzone/merlionjs'

export interface Config
  extends Record<string, string | number | boolean | Function> {
  chainID: string
  chainName: string
  web3RpcEndpoint: string
  rpcEndpoint: string
  restEndpoint: string
  bech32Prefix: string
  denom: string
  denomDecimals: number
  displayDenom: string
  merDenom: string
  merDenomDecimals: number
  merDisplayDenom: string

  getChainID: () => ChainId
}

export const config: Config = {
  // Default config key-value pairs
  chainID: 'merlion_5000-101',
  chainName: 'Merlion Localnet',
  web3RpcEndpoint: 'http://127.0.0.1:8545',
  rpcEndpoint: 'http://127.0.0.1:26657',
  restEndpoint: 'http://127.0.0.1:1317',
  bech32Prefix: 'mer',
  denom: 'alion',
  denomDecimals: 18,
  displayDenom: 'LION',
  merDenom: 'uusm',
  merDenomDecimals: 6,
  merDisplayDenom: 'USM',
} as Config

// Mapping to environment variables
export const envConfig = {
  chainID: process.env.NEXT_PUBLIC_CHAIN_ID,
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME,
  web3RpcEndpoint: process.env.NEXT_PUBLIC_WEB3_RPC_ENDPOINT,
  rpcEndpoint: process.env.NEXT_PUBLIC_RPC_ENDPOINT,
  restEndpoint: process.env.NEXT_PUBLIC_REST_ENDPOINT,
  bech32Prefix: process.env.NEXT_PUBLIC_BECH32_PREFIX,
  denom: process.env.NEXT_PUBLIC_DENOM,
  denomDecimals: process.env.NEXT_PUBLIC_DENOM_DECIMALS,
  displayDenom: process.env.NEXT_PUBLIC_DISPLAY_DENOM,
  merDenom: process.env.NEXT_PUBLIC_MER_DENOM,
  merDenomDecimals: process.env.NEXT_PUBLIC_MER_DENOM_DECIMALS,
  merDisplayDenom: process.env.NEXT_PUBLIC_MER_DISPLAY_DENOM,
}

config.getChainID = () => {
  return new ChainId(config.chainID)
}
