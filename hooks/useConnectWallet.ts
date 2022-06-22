import { useCallback } from 'react'
import { ethers } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import detectEthereumProvider from '@metamask/detect-provider'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Address, EIP712Signer, Web3EIP712Signer } from '@merlionzone/merlionjs'
import { useCallbackRef } from '@chakra-ui/hooks'
import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import {
  addEthereumChainParams,
  keplrChainInfo,
  switchEthereumChainParams,
} from '@/config/chainInfo'
import config from '@/config'

export type WalletType = 'metamask' | 'keplr'

const walletTypeAtom = atomWithStorage<WalletType | false>(
  'connect-wallet-type',
  false
)
const connectedAtom = atom<boolean | null>(null)
const web3ProviderAtom = atom<Web3Provider | null>(null)
const chainIDAtom = atom<number | null>(null)
const signerAtom = atom<OfflineSigner | EIP712Signer | null>(null)
const accountAtom = atom<string | null>(null)

let connSignal = 0
const incConnSignal = () => {
  ++connSignal
}

export function useConnectWallet(): {
  // string: wallet type, false: wallet not selected
  walletType: WalletType | false
  // true: connected, null: not connected, false: connected but wrong chain
  connected: boolean | null
  web3Provider: Web3Provider | null
  chainID: number | null
  signer: OfflineSigner | EIP712Signer | null
  account: string | null
  onConnect: (walletType: WalletType | null) => void
  onDisconnect: () => void
} {
  const [walletType, setWalletType] = useAtom(walletTypeAtom)
  const [connected, setConnected] = useAtom(connectedAtom)
  const [web3Provider, setWeb3Provider] = useAtom(web3ProviderAtom)
  const [chainID, setChainID] = useAtom(chainIDAtom)
  const [signer, setSigner] = useAtom(signerAtom)
  const [account, setAccount] = useAtom(accountAtom)

  const handleEthereumChainChanged = useCallbackRef(
    (chainIDStr: string) => {
      if (walletType !== 'metamask') {
        return
      }
      // Reload page since chain has been changed
      // window.location.reload()

      const chainID = Number(chainIDStr)
      setConnected(chainID === config.getChainID().eip155)
      setChainID(chainID)
    },
    [walletType]
  )

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
      if (!willConnect) {
        addOrRemoveListeners(false)
        setWalletType(false)
      }
      setWeb3Provider(null)
      setConnected(null)
      setChainID(null)
      setSigner(null)
      setAccount(null)
    },
    [
      setWalletType,
      setWeb3Provider,
      setConnected,
      setChainID,
      setSigner,
      setAccount,
      addOrRemoveListeners,
    ]
  )

  const onDisconnect = useCallbackRef(() => {
    incConnSignal()
    disconnect(false)
  })

  const connect = useCallback(
    (newWalletType: WalletType | null) => {
      if (typeof window === 'undefined') {
        return
      }

      addOrRemoveListeners(false)
      disconnect(true)
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

        const chainID = Number(
          await window.ethereum.request({ method: 'eth_chainId' })
        )
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = new Web3EIP712Signer(provider) // TODO

        if (cancelled()) return
        if (chainID !== config.getChainID().eip155) {
          await switchEthereumChain()
        }

        if (cancelled()) return
        const onConnected = (account: string) => {
          addOrRemoveListeners(true)
          setWeb3Provider(provider)
          setConnected(chainID === config.getChainID().eip155)
          setChainID(chainID)
          setSigner(signer)
          setAccount(account)
        }

        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          })
          if (cancelled()) return
          if (accounts.length) {
            // account connected
            onConnected(accounts[0])
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
          if (accounts.length) {
            onConnected(accounts[0])
          }
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
        await window.keplr.experimentalSuggestChain(keplrChainInfo)
        if (cancelled()) return
        // https://docs.keplr.app/api/cosmjs.html
        await window.keplr.enable(config.chainID)

        const signer = window.getOfflineSigner!(config.chainID)
        const accounts = await signer.getAccounts()

        if (cancelled()) return
        addOrRemoveListeners(true)
        setConnected(true)
        setChainID(config.getChainID().eip155)
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
      setConnected,
      setWeb3Provider,
      setChainID,
      setSigner,
      setAccount,
      addOrRemoveListeners,
      disconnect,
    ]
  )

  const onConnect = useCallbackRef(connect)

  return {
    walletType,
    connected,
    web3Provider,
    chainID,
    signer,
    account,
    onConnect,
    onDisconnect,
  }
}

export async function switchEthereumChain() {
  if (typeof window === 'undefined' || !window.ethereum) {
    return
  }
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [switchEthereumChainParams],
    })
  } catch (switchError) {
    if ((<any>switchError).code === 4902) {
      // the chain has not been added to MetaMask
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [addEthereumChainParams],
        })
      } catch (addError) {
        console.error(addError)
      }
    } else {
      console.error(switchError)
    }
  }
}

export function useAccountAddress(): Address | undefined {
  const { account } = useConnectWallet()
  return account ? new Address(account) : undefined
}
