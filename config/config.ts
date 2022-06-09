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
  merDenom: 'uusd',
  merDenomDecimals: 6,
  merDisplayDenom: 'USM',
} as Config

// Mapping to environment variables
export const envConfig = {
  chainID: process.env.CHAIN_ID,
  chainName: process.env.CHAIN_NAME,
  web3RpcEndpoint: process.env.WEB3_RPC_ENDPOINT,
  rpcEndpoint: process.env.RPC_ENDPOINT,
  restEndpoint: process.env.REST_ENDPOINT,
  bech32Prefix: process.env.BECH32_PREFIX,
  denom: process.env.DENOM,
  denomDecimals: process.env.DENOM_DECIMALS,
  displayDenom: process.env.DISPLAY_DENOM,
  merDenom: process.env.MER_DENOM,
  merDenomDecimals: process.env.MER_DENOM_DECIMALS,
  merDisplayDenom: process.env.MER_DISPLAY_DENOM,
}

config.getChainID = () => {
  return new ChainId(config.chainID)
}
