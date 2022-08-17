import { useCallbackRef } from '@chakra-ui/hooks'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Web3Provider } from '@ethersproject/providers'
import {
  Address,
  ChainId,
  EIP712Signer,
  Web3EIP712Signer,
} from '@merlionzone/merlionjs'
import detectEthereumProvider from '@metamask/detect-provider'
import { MetaMaskInpageProvider } from '@metamask/providers'
import { ethers } from 'ethers'
import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback, useEffect, useRef } from 'react'

import config from '@/config'
import { addEthereumChainParams, keplrChainInfo } from '@/config/chainInfo'
import { SUPPORTED_NETWORKS } from '@/pages/bridge/networks'
import { promiseOnce } from '@/utils'
import {
  getMemorizedHandler,
  setMemorizedHandler,
} from '@/utils/memorizedHandler'

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

const isSetupAvailableAtom = atom<boolean>(true)

export function useConnectWallet(): {
  // string: wallet type, false: wallet not selected
  walletType: WalletType | false
  // true: connected, null: not connected, false: connected but wrong chain
  connected: boolean | null
  web3Provider: Web3Provider | null
  chainID: number | null
  signer: OfflineSigner | EIP712Signer | null
  account: string | null
  onConnect: (walletType: WalletType | null, chainID?: ChainId) => void
  onDisconnect: () => void
} {
  const [walletType, setWalletType] = useAtom(walletTypeAtom)
  const [connected, setConnected] = useAtom(connectedAtom)
  const [web3Provider, setWeb3Provider] = useAtom(web3ProviderAtom)
  const [chainID, setChainID] = useAtom(chainIDAtom)
  const [signer, setSigner] = useAtom(signerAtom)
  const [account, setAccount] = useAtom(accountAtom)

  const handleEthereumChainChanged = useCallback(
    (chainIDStr: string) => {
      if (walletType !== 'metamask') {
        return
      }
      // Reload page since chain has been changed
      // window.location.reload()

      const chainID = Number(chainIDStr)
      const network = SUPPORTED_NETWORKS.find(
        (network) => network.id === chainID
      )
      setConnected(!!network)
      setChainID(chainID)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletType]
  )
  useEffect(() => {
    setMemorizedHandler('chainChanged', handleEthereumChainChanged)
  }, [handleEthereumChainChanged])

  const handleEthereumAccountsChanged = useCallback(
    (accounts: string[]) => {
      if (walletType !== 'metamask') {
        return
      }
      if (!accounts.length) {
        console.warn('Please connect to MetaMask')
        // TODO: when MetaMask locked
        disconnect(true)
      } else {
        setAccount(accounts[0])
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletType]
  )
  useEffect(() => {
    setMemorizedHandler('accountsChanged', handleEthereumAccountsChanged)
  }, [handleEthereumAccountsChanged])

  const handleKeplrAccountsChanged = useCallback(() => {
    if (walletType !== 'keplr') {
      return
    }
    disconnect(true)
    onConnect(walletType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletType])
  useEffect(() => {
    setMemorizedHandler('keplr_keystorechange', handleKeplrAccountsChanged)
  }, [handleKeplrAccountsChanged])

  const disconnect = useCallback(
    (willConnect: boolean) => {
      if (!willConnect) {
        removeListeners()
        setWalletType(false)
      }
      setWeb3Provider(null)
      setConnected(null)
      setChainID(null)
      setSigner(null)
      setAccount(null)
    },
    [
      setWeb3Provider,
      setConnected,
      setChainID,
      setSigner,
      setAccount,
      setWalletType,
    ]
  )

  const onDisconnect = useCallbackRef(() => {
    disconnect(false)
  })

  const [isSetupAvailable, setIsSetupAvailable] = useAtom(isSetupAvailableAtom)
  const promiseResolverQueueRef = useRef<(Function | undefined)[]>([])

  const connect = useCallback(
    (newWalletType: WalletType | null, chainID = config.getChainID()) => {
      if (typeof window === 'undefined') {
        return
      }

      removeListeners()
      disconnect(true)

      if (!newWalletType && walletType) {
        newWalletType = walletType
      }
      if (!newWalletType) {
        return
      }
      if (newWalletType !== walletType) {
        setWalletType(newWalletType)
      }

      let setup: (...args: any[]) => Promise<Connection>
      switch (newWalletType) {
        case 'metamask':
          setup = connectMetaMask
          break
        case 'keplr':
          setup = connectKeplr
          break
        default:
          throw new Error(`Wallet type ${newWalletType} not supported`)
      }

      promiseOnce(
        [isSetupAvailable, setIsSetupAvailable],
        promiseResolverQueueRef,
        setup(chainID)
      )
        .then(({ providerOrSigner, chainId, account }) => {
          addListeners(newWalletType!)
          if (newWalletType === 'metamask') {
            setWeb3Provider(providerOrSigner as any)
          }
          const network = SUPPORTED_NETWORKS.find(
            (network) => network.id === chainId
          )
          setConnected(!!account && !!network)
          setChainID(chainId)
          setSigner(providerOrSigner as any)
          setAccount(account ?? null)
        })
        .catch(console.error)
    },
    [
      disconnect,
      isSetupAvailable,
      setAccount,
      setChainID,
      setConnected,
      setIsSetupAvailable,
      setSigner,
      setWalletType,
      setWeb3Provider,
      walletType,
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

export async function switchEthereumChain(
  chainID: number | string = config.getChainID().eip155
) {
  if (typeof window === 'undefined' || !window.ethereum) {
    return
  }
  try {
    await window.ethereum.request?.({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ethers.utils.hexlify(Number(chainID)) }],
    })
  } catch (switchError) {
    if (
      (switchError as any).code === 4902 &&
      Number(chainID) === config.getChainID().eip155
    ) {
      // the chain has not been added to MetaMask
      try {
        await window.ethereum.request?.({
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

interface Connection {
  providerOrSigner: EIP712Signer | OfflineSigner
  account?: string
  chainId: number
}

async function connectMetaMask(chainId: ChainId): Promise<Connection> {
  const provider: MetaMaskInpageProvider = (await detectEthereumProvider({
    mustBeMetaMask: true,
  })) as any

  const accounts = await provider.request<string[]>({
    method: 'eth_requestAccounts',
  })
  const currentChainId = await provider.request<string>({
    method: 'eth_chainId',
  })

  if (Number(currentChainId) !== chainId.eip155) {
    await switchEthereumChain(chainId.eip155)
  }

  return {
    providerOrSigner: new Web3EIP712Signer(
      new ethers.providers.Web3Provider(provider as any)
    ),
    account: accounts?.[0],
    chainId: chainId.eip155,
  }
}

async function connectKeplr(): Promise<Connection> {
  if (!window.keplr) {
    throw new Error('No keplr wallet detected')
  }
  // https://docs.keplr.app/api/suggest-chain.html
  await window.keplr.experimentalSuggestChain(keplrChainInfo)
  // https://docs.keplr.app/api/cosmjs.html
  await window.keplr.enable(config.chainID)

  const signer = window.getOfflineSigner!(config.chainID)
  const accounts = await signer.getAccounts()

  return {
    providerOrSigner: signer,
    account: accounts[0].address,
    chainId: config.getChainID().eip155,
  }
}

function addListeners(walletType: WalletType) {
  const handleEthereumChainChanged = getMemorizedHandler('chainChanged')
  const handleEthereumAccountsChanged = getMemorizedHandler('accountsChanged')
  const handleKeplrAccountsChanged = getMemorizedHandler('keplr_keystorechange')

  if (walletType === 'metamask') {
    window.ethereum?.on('chainChanged', handleEthereumChainChanged!)
    window.ethereum?.on('accountsChanged', handleEthereumAccountsChanged!)
  } else if (walletType === 'keplr') {
    window.addEventListener(
      'keplr_keystorechange',
      handleKeplrAccountsChanged as any
    )
  }
}

function removeListeners() {
  const handleEthereumChainChanged = getMemorizedHandler('chainChanged')
  const handleEthereumAccountsChanged = getMemorizedHandler('accountsChanged')
  const handleKeplrAccountsChanged = getMemorizedHandler('keplr_keystorechange')

  window.ethereum?.removeListener('chainChanged', handleEthereumChainChanged!)
  window.ethereum?.removeListener(
    'accountsChanged',
    handleEthereumAccountsChanged!
  )
  window.removeEventListener(
    'keplr_keystorechange',
    handleKeplrAccountsChanged as any
  )
}
