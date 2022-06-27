import { useAccountAddress } from '@/hooks/useConnectWallet'
import { useMerlionClient } from '@/hooks/useMerlionClient'
import { EncodeObject } from '@cosmjs/proto-signing'
import { useCallback, useRef } from 'react'
import { atom, useAtom } from 'jotai'
import { DeliverTxResponse } from '@cosmjs/stargate'
import { promiseOnce } from '@/utils'

const isSendCosmTxReadyAtom = atom<boolean>(true)

export function useSendCosmTx(): {
  sendTx: (msg: EncodeObject) => Promise<DeliverTxResponse> | undefined
  isSendReady: boolean
} {
  const client = useMerlionClient()
  const account = useAccountAddress()

  const [isSendReady, setIsSendReady] = useAtom(isSendCosmTxReadyAtom)
  const promiseResolverQueueRef = useRef<(Function | undefined)[]>([])

  const sendTx = useCallback(
    (msg: EncodeObject): Promise<DeliverTxResponse> | undefined => {
      if (!client || !account) {
        return
      }

      // Only one transaction can be sent and waited for at a time
      return promiseOnce(
        [isSendReady, setIsSendReady],
        promiseResolverQueueRef,
        client.signAndBroadcast(account.mer(), [msg])
      )
    },
    [account, client, isSendReady, setIsSendReady]
  )

  return {
    sendTx,
    isSendReady,
  }
}
