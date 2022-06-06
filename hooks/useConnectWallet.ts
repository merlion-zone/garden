import { useCallback } from 'react'
import { ethers } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import detectEthereumProvider from '@metamask/detect-provider'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { ChainInfo } from '@keplr-wallet/types'
import { ChainId, EIP712Signer, Web3EIP712Signer } from '@merlionzone/merlionjs'
import { useCallbackRef } from '@chakra-ui/hooks'
import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export type WalletType = 'metamask' | 'keplr'

const walletTypeAtom = atomWithStorage<WalletType | false>(
  'connect-wallet-type',
  false
)
const web3ProviderAtom = atom<Web3Provider | null>(null)
const chainIDAtom = atom<number | null>(null)
const signerAtom = atom<OfflineSigner | EIP712Signer | null>(null)
const accountAtom = atom<string | null>(null)

let connSignal = 0
const incConnSignal = () => {
  ++connSignal
}

export function useConnectWallet(): {
  walletType: WalletType | false
  web3Provider: Web3Provider | null
  chainID: number | null
  signer: OfflineSigner | EIP712Signer | null
  account: string | null
  onConnect: (walletType: WalletType | null) => void
  onDisconnect: () => void
} {
  const [walletType, setWalletType] = useAtom(walletTypeAtom)
  const [web3Provider, setWeb3Provider] = useAtom(web3ProviderAtom)
  const [chainID, setChainID] = useAtom(chainIDAtom)
  const [signer, setSigner] = useAtom(signerAtom)
  const [account, setAccount] = useAtom(accountAtom)

  const handleEthereumChainChanged = useCallbackRef(() => {
    if (walletType !== 'metamask') {
      return
    }
    // Reload page since chain has been changed
    window.location.reload()
  }, [walletType])

  const handleEthereumAccountsChanged = useCallbackRef(
    (accounts: string[]) => {
      if (walletType !== 'metamask') {
        return
      }
      if (!accounts.length) {
        console.warn('Please connect to MetaMask')
        disconnect(true)
      } else {
        setAccount(accounts[0])
      }
    },
    [walletType]
  )

  const handleKeplrAccountsChanged = useCallbackRef(() => {
    if (walletType !== 'keplr') {
      return
    }
    disconnect(true)
    onConnect(walletType)
  }, [walletType])

  const addOrRemoveListeners = useCallback(
    (on: boolean) => {
      if (window.ethereum) {
        const action = (event: any, handler: any) => {
          on
            ? window.ethereum.on(event, handler)
            : window.ethereum.removeListener(event, handler)
        }
        action('chainChanged', handleEthereumChainChanged)
        action('accountsChanged', handleEthereumAccountsChanged)
      } else if (window.keplr) {
        const action = (event: any, handler: any) => {
          on
            ? window.addEventListener(event, handler)
            : window.removeEventListener(event, handler)
        }
        action('keplr_keystorechange', handleKeplrAccountsChanged)
      }
    },
    [
      handleEthereumChainChanged,
      handleEthereumAccountsChanged,
      handleKeplrAccountsChanged,
    ]
  )

  const disconnect = useCallback(
    (willConnect: boolean) => {
      incConnSignal()
      if (!willConnect) {
        addOrRemoveListeners(false)
        setWalletType(false)
      }
      setWeb3Provider(null)
      setChainID(null)
      setSigner(null)
      setAccount(null)
    },
    [
      addOrRemoveListeners,
      setWalletType,
      setWeb3Provider,
      setChainID,
      setSigner,
      setAccount,
    ]
  )

  const onDisconnect = useCallbackRef(() => {
    disconnect(false)
  })

  const connect = useCallback(
    (newWalletType: WalletType | null) => {
      if (typeof window === 'undefined') {
        return
      }

      addOrRemoveListeners(false)
      incConnSignal()
      const thisConnSignal = connSignal
      const cancelled = () => {
        return connSignal !== thisConnSignal
      }

      if (!newWalletType && walletType) {
        newWalletType = walletType
      }
      if (!newWalletType) {
        return
      }
      if (newWalletType !== walletType) {
        setWalletType(newWalletType)
      }

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
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = new Web3EIP712Signer(provider) // TODO

        if (cancelled()) return
        addOrRemoveListeners(true)
        setWeb3Provider(provider)
        setChainID(+chainID)
        setSigner(signer)

        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          })
          if (cancelled()) return
          handleEthereumAccountsChanged(accounts)
          if (accounts.length) {
            // account connected
            return
          }
        } catch (err) {
          console.error(err)
        }

        // request account connection
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          })
          if (cancelled()) return
          handleEthereumAccountsChanged(accounts)
        } catch (err) {
          if ((<any>err).code === 4001) {
            // EIP-1193 userRejectedRequest error
            // If this happens, the user rejected the connection request.
            console.warn('Please connect to MetaMask')
          } else {
            console.error(err)
          }
        }
      }

      const setupKeplr = async () => {
        if (!window.keplr) {
          console.error('No keplr wallet detected')
          return
        }

        if (cancelled()) return
        // https://docs.keplr.app/api/suggest-chain.html
        await window.keplr.experimentalSuggestChain(chainInfo)
        if (cancelled()) return
        // https://docs.keplr.app/api/cosmjs.html
        await window.keplr.enable(chainInfo.chainId)

        const signer = window.getOfflineSigner!(chainInfo.chainId)
        const accounts = await signer.getAccounts()

        if (cancelled()) return
        addOrRemoveListeners(true)
        setChainID(new ChainId(chainInfo.chainId).eip155)
        setSigner(signer)
        if (accounts.length) {
          setAccount(accounts[0].address)
        }
      }

      switch (newWalletType) {
        case 'metamask':
          setupMetaMask().catch(console.error)
          break
        case 'keplr':
          setupKeplr().catch(console.error)
          break
        default:
          throw new Error(`Wallet type ${newWalletType} not supported`)
      }
    },
    [
      walletType,
      setWalletType,
      setWeb3Provider,
      setChainID,
      setSigner,
      setAccount,
      handleEthereumAccountsChanged,
      addOrRemoveListeners,
    ]
  )

  const onConnect = useCallbackRef(connect)

  return {
    walletType,
    web3Provider,
    chainID,
    signer,
    account,
    onConnect,
    onDisconnect,
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
