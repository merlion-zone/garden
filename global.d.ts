import { Window as KeplrWindow } from '@keplr-wallet/types'

export {}

declare global {
  interface Window extends KeplrWindow {
    ethereum: any
  }
}
