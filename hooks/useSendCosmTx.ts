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
    msg: EncodeObject,
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
      msg: EncodeObject,
      memo?: string
    ): Promise<DeliverTxResponse> | undefined => {
      if (!client || !account) {
        return
      }

      // Only one transaction can be sent and waited for at a time
      return promiseOnce(
        [isSendReady, setIsSendReady],
        promiseResolverQueueRef,
        client.signAndBroadcast(account.mer(), [msg], 'auto', memo)
      )
    },
    [account, client, isSendReady, setIsSendReady]
  )

  return {
    sendTx,
    isSendReady,
  }
}
