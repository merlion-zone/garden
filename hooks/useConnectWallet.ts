import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import detectEthereumProvider from '@metamask/detect-provider'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { ChainInfo } from '@keplr-wallet/types'
import { ChainId, EIP712Signer, Web3EIP712Signer } from '@merlionzone/merlionjs'

export type WalletType = 'metamask' | 'keplr'

export function useConnectWallet(walletType: WalletType): {
  web3Provider: Web3Provider | null
  chainID: number | null
  signer: OfflineSigner | EIP712Signer | null
  account: string | null
} {
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | null>(null)
  const [chainID, setChainID] = useState<number | null>(null)
  const [signer, setSigner] = useState<OfflineSigner | EIP712Signer | null>(
    null
  )
  const [account, setAccount] = useState<string | null>(null)

  useEffect(() => {
    const setupMetaMask = async () => {
      const ethProvider = await detectEthereumProvider()
      if (!ethProvider) {
        console.error('No ethereum wallet detected')
        return
      }
      if (ethProvider !== window.ethereum) {
        console.error('Do you have multiple ethereum wallets installed?')
        return
      }

      const chainID = await window.ethereum.request({ method: 'eth_chainId' })
      setChainID(+chainID)

      window.ethereum.on('chainChanged', () => {
        // Reload page since chain has been changed
        window.location.reload()
      })

      const handleAccountsChanged = (accounts: string[]) => {
        if (!accounts.length) {
          console.warn('Please connect to MetaMask')
        } else {
          setAccount(accounts[0])
        }
      }

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        })
        handleAccountsChanged(accounts)
      } catch (err) {
        console.error(err)
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        handleAccountsChanged(accounts)
      } catch (err) {
        if ((<any>err).code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.warn('Please connect to MetaMask')
        } else {
          console.error(err)
        }
        return
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setWeb3Provider(provider)

      const signer = new Web3EIP712Signer(provider)
      setSigner(signer)
    }

    const setupKeplr = async () => {
      if (!window.keplr) {
        throw new Error('Keplr not found')
      }

      // https://docs.keplr.app/api/suggest-chain.html
      await window.keplr.experimentalSuggestChain(chainInfo)
      // https://docs.keplr.app/api/cosmjs.html
      await window.keplr.enable(chainInfo.chainId)

      const signer = window.getOfflineSigner!(chainInfo.chainId)
      const accounts = await signer.getAccounts()
      setSigner(signer)
      if (accounts.length) {
        setAccount(accounts[0].address)
      }

      setChainID(new ChainId(chainInfo.chainId).eip155)
    }

    switch (walletType) {
      case 'metamask':
        setupMetaMask().catch(console.error)
        break
      case 'keplr':
        setupKeplr().catch(console.error)
        break
    }
  }, [walletType])

  return {
    web3Provider,
    chainID,
    signer,
    account,
  }
}

const chainInfo: ChainInfo = {
  chainId: 'merlion_5000-101',
  chainName: 'Merlion Localnet',
  rpc: 'http://172.20.243.86:26657',
  rest: 'http://172.20.243.86:1317',
  bip44: {
    coinType: 60,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'mer',
    bech32PrefixAccPub: 'mer' + 'pub',
    bech32PrefixValAddr: 'mer' + 'valoper',
    bech32PrefixValPub: 'mer' + 'valoperpub',
    bech32PrefixConsAddr: 'mer' + 'valcons',
    bech32PrefixConsPub: 'mer' + 'valconspub',
  },
  currencies: [
    {
      coinDenom: 'LION',
      coinMinimalDenom: 'alion',
      coinDecimals: 18,
      coinGeckoId: 'LION',
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'LION',
      coinMinimalDenom: 'alion',
      coinDecimals: 18,
      coinGeckoId: 'LION',
    },
  ],
  stakeCurrency: {
    coinDenom: 'LION',
    coinMinimalDenom: 'alion',
    coinDecimals: 18,
    coinGeckoId: 'LION',
  },
  coinType: 60,
  gasPriceStep: {
    low: 0.01,
    average: 0.025,
    high: 0.03,
  },
}
