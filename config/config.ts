import { ChainId } from '@merlionzone/merlionjs'

export interface Config
  extends NodeJS.Dict<string | number | boolean | Function> {
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

config.getChainID = () => {
  return new ChainId(config.chainID)
}
