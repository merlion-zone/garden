import { ChainInfo } from '@keplr-wallet/types'
import { ethers } from 'ethers'

import config from '@/config'

// https://eips.ethereum.org/EIPS/eip-3085
interface EIP3085AddEthereumChainParameter {
  chainId: string
  chainName?: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
  iconUrls?: string[]
}

// https://eips.ethereum.org/EIPS/eip-3326
interface EIP3326SwitchEthereumChainParameter {
  chainId: string
}

export const addEthereumChainParams: EIP3085AddEthereumChainParameter = {
  chainId: ethers.utils.hexlify(config.getChainID().eip155),
  chainName: config.chainName,
  nativeCurrency: {
    name: config.displayDenom,
    symbol: config.displayDenom,
    decimals: config.denomDecimals,
  },
  rpcUrls: [config.web3RpcEndpoint],
}

export const switchEthereumChainParams: EIP3326SwitchEthereumChainParameter = {
  chainId: ethers.utils.hexlify(config.getChainID().eip155),
}

export const keplrChainInfo: ChainInfo = {
  chainId: config.chainID,
  chainName: config.chainName,
  rpc: config.rpcEndpoint,
  rest: config.restEndpoint,
  bip44: {
    coinType: 60,
  },
  bech32Config: {
    bech32PrefixAccAddr: config.bech32Prefix,
    bech32PrefixAccPub: config.bech32Prefix + 'pub',
    bech32PrefixValAddr: config.bech32Prefix + 'valoper',
    bech32PrefixValPub: config.bech32Prefix + 'valoperpub',
    bech32PrefixConsAddr: config.bech32Prefix + 'valcons',
    bech32PrefixConsPub: config.bech32Prefix + 'valconspub',
  },
  currencies: [
    {
      coinDenom: config.displayDenom,
      coinMinimalDenom: config.denom,
      coinDecimals: config.denomDecimals,
      coinGeckoId: config.displayDenom,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: config.displayDenom,
      coinMinimalDenom: config.denom,
      coinDecimals: config.denomDecimals,
      coinGeckoId: config.displayDenom,
    },
  ],
  stakeCurrency: {
    coinDenom: config.displayDenom,
    coinMinimalDenom: config.denom,
    coinDecimals: config.denomDecimals,
    coinGeckoId: config.displayDenom,
  },
  coinType: 60,
  gasPriceStep: {
    low: 0.01,
    average: 0.025,
    high: 0.03,
  },
}
