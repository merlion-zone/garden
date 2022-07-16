import { EncodeObject } from '@cosmjs/proto-signing'
import {
  Coin,
  Dec,
  MsgDepositCollateralEncodeObject,
  MsgRedeemCollateralEncodeObject,
  typeUrls,
} from '@merlionzone/merlionjs'
import React from 'react'

import { AmountMetadata } from '@/components/AmountInput'
import { TransactionToast } from '@/components/TransactionToast'
import config from '@/config'
import { SendTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'
import { formatNumberSuitable } from '@/utils'

export function depositOrRedeem({
  isDeposit,
  account,
  collateralToken,
  collateralAmt,
  lionAmt,
  sendTx,
  toast,
  onReceipt,
}: {
  isDeposit: boolean
  account: string
  collateralToken: AmountMetadata
  collateralAmt: string
  lionAmt: string
  sendTx: SendTx
  toast: ReturnType<typeof useToast>
  onReceipt(): void
}) {
  if (!collateralToken.metadata) {
    return
  }

  const collateral = new Coin(
    collateralToken.metadata.base,
    new Dec(collateralAmt)
      .mulPow(collateralToken.metadata.displayExponent)
      .toInt()
  ).toProto()
  const lion = new Coin(
    config.denom,
    new Dec(lionAmt).mulPow(config.denomDecimals).toInt()
  ).toProto()

  let msg: EncodeObject
  let title = ''

  if (isDeposit) {
    msg = {
      typeUrl: typeUrls.MsgDepositCollateral,
      value: {
        sender: account,
        to: '',
        collateralIn: collateral,
        lionIn: lion,
      },
    } as MsgDepositCollateralEncodeObject

    title = `Deposit ${collateralAmt || 0} ${
      collateralToken.metadata.symbol
    } and ${formatNumberSuitable(lionAmt || 0)} ${config.displayDenom}`
  } else {
    msg = {
      typeUrl: typeUrls.MsgRedeemCollateral,
      value: {
        sender: account,
        to: '',
        collateralOut: collateral,
        lionOut: lion,
      },
    } as MsgRedeemCollateralEncodeObject

    title = `Redeem ${collateralAmt || 0} ${
      collateralToken.metadata.symbol
    } and ${formatNumberSuitable(lionAmt || 0)} ${config.displayDenom}`
  }

  console.debug(`${JSON.stringify(msg)}`)
  const receiptPromise = sendTx(msg)
  receiptPromise?.finally(onReceipt).catch(() => {})

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
