import { EncodeObject } from '@cosmjs/proto-signing'
import {
  Coin,
  Dec,
  MsgBurnByCollateralEncodeObject,
  MsgMintByCollateralEncodeObject,
  typeUrls,
} from '@merlionzone/merlionjs'
import React from 'react'

import { TransactionToast } from '@/components/TransactionToast'
import config from '@/config'
import { SendTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'

export function borrowOrRepay({
  isBorrow,
  account,
  usmAmt,
  sendTx,
  toast,
  onReceipt,
}: {
  isBorrow: boolean
  account: string
  usmAmt: string
  sendTx: SendTx
  toast: ReturnType<typeof useToast>
  onReceipt(): void
}) {
  const usmAmount = new Coin(
    config.merDenom,
    new Dec(usmAmt).mulPow(config.merDenomDecimals)
  ).toProto()

  let msg: EncodeObject
  let title = ''

  if (isBorrow) {
    const msgMintByCollateral: MsgMintByCollateralEncodeObject = {
      typeUrl: typeUrls.MsgMintByCollateral,
      value: {
        sender: account,
        to: '',
        collateralDenom: '',
        mintOut: usmAmount,
      },
    }

    msg = msgMintByCollateral
    title = `Borrow ${usmAmt} ${config.merDisplayDenom}`
  } else {
    const msgBurnByCollateral: MsgBurnByCollateralEncodeObject = {
      typeUrl: typeUrls.MsgBurnByCollateral,
      value: {
        sender: account,
        collateralDenom: '',
        repayInMax: usmAmount, // TODO
      },
    }

    msg = msgBurnByCollateral
    title = `Repay ${usmAmt} ${config.merDisplayDenom}`
  }

  console.debug(`${JSON.stringify(msg)}`)
  const receiptPromise = sendTx(msg)
  receiptPromise?.finally(onReceipt)

  toast({
    render: ({ onClose }) => {
      return (
        <TransactionToast
          title={title}
          receiptPromise={receiptPromise}
          onClose={onClose}
        />
      )
    },
  })
}
