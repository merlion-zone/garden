import { EncodeObject } from '@cosmjs/proto-signing'
import { DeliverTxResponse } from '@cosmjs/stargate'
import { atom, useAtom } from 'jotai'
import { useCallback, useRef } from 'react'

import { useAccountAddress } from '@/hooks/useConnectWallet'
import { useMerlionClient } from '@/hooks/useMerlionClient'
import { promiseOnce } from '@/utils'

const isSendCosmTxReadyAtom = atom<boolean>(true)

export function useSendCosmTx(): {
  sendTx: (
    msgOrMsgs: EncodeObject | EncodeObject[],
    memo?: string
  ) => Promise<DeliverTxResponse> | undefined
  isSendReady: boolean
} {
  const client = useMerlionClient()
  const account = useAccountAddress()

  const [isSendReady, setIsSendReady] = useAtom(isSendCosmTxReadyAtom)
  const promiseResolverQueueRef = useRef<(Function | undefined)[]>([])

  const sendTx = useCallback(
    (
      msgOrMsgs: EncodeObject | EncodeObject[],
      memo?: string
    ): Promise<DeliverTxResponse> | undefined => {
      if (!client || !account) {
        return
      }

      return promiseOnce(
        [isSendReady, setIsSendReady],
        promiseResolverQueueRef,
        client.signAndBroadcast(
          account.mer(),
          Array.isArray(msgOrMsgs) ? msgOrMsgs : [msgOrMsgs],
          'auto',
          memo
        )
      )
    },
    [account, client, isSendReady, setIsSendReady]
  )

  return {
    sendTx,
    isSendReady,
  }
}
