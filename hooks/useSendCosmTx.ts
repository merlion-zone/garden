import { useAccountAddress } from '@/hooks/useConnectWallet'
import { useMerlionClient } from '@/hooks/useMerlionClient'
import { EncodeObject } from '@cosmjs/proto-signing'
import { useCallback, useRef } from 'react'
import { atom, useAtom } from 'jotai'
import { DeliverTxResponse } from '@cosmjs/stargate'

const isSendCosmTxReadyAtom = atom<boolean>(true)

export function useSendCosmTx(): {
  sendTx: (msg: EncodeObject) => Promise<DeliverTxResponse> | undefined
  isSendReady: boolean
} {
  const client = useMerlionClient()
  const account = useAccountAddress()

  const [isSendReady, setIsSendReady] = useAtom(isSendCosmTxReadyAtom)
  const isPromiseQueueRef = useRef<(Function | undefined)[]>([])

  const sendTx = useCallback(
    (msg: EncodeObject): Promise<DeliverTxResponse> | undefined => {
      if (!client || !account) {
        return
      }

      // Only one transaction can be sent and waited for at a time

      let readyPromise
      if (!isSendReady) {
        let resolve = undefined
        readyPromise = new Promise((r) => {
          resolve = r
        })
        isPromiseQueueRef.current.push(resolve)
      } else {
        readyPromise = Promise.resolve()
      }

      return readyPromise.then(() => {
        setIsSendReady(false)

        return client.signAndBroadcast(account.mer(), [msg]).finally(() => {
          setIsSendReady(true)
          const resolve = isPromiseQueueRef.current.shift()
          resolve && resolve()
        })
      })
    },
    [account, client, isSendReady, setIsSendReady]
  )

  return {
    sendTx,
    isSendReady,
  }
}
