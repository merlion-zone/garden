import {
  MsgBurnBySwapEncodeObject,
  MsgMintBySwapEncodeObject,
} from '@merlionzone/merlionjs'
import { Address, Coin, Dec, typeUrls } from '@merlionzone/merlionjs'
import { EncodeObject } from '@cosmjs/proto-signing'
import { DeliverTxResponse } from '@cosmjs/stargate'
import config from '@/config'
import { useToast } from '@/hooks/useToast'
import { DenomMetadata } from '@/hooks/query'
import { TransactionToast } from '@/components/TransactionToast'

interface SwapMintArgs {
  isMint: boolean
  account?: Address
  backingMetadata?: DenomMetadata
  backingAmt: string | number
  lionAmt: string | number
  usmAmt: string | number
  slippageTolerance: Dec
  sendTx: (msg: EncodeObject) => Promise<DeliverTxResponse> | undefined
  toast: ReturnType<typeof useToast>
}

export function swapMint({
  isMint,
  account,
  backingMetadata,
  backingAmt,
  lionAmt,
  usmAmt,
  slippageTolerance,
  sendTx,
  toast,
}: SwapMintArgs) {
  if (!account || !backingMetadata?.displayExponent) {
    return
  }

  const tolerance = new Dec(1).sub(slippageTolerance)

  let msg: EncodeObject
  let title = ''
  if (isMint) {
    const msgMintBySwap: MsgMintBySwapEncodeObject = {
      typeUrl: typeUrls.MsgMintBySwap,
      value: {
        sender: account.mer(),
        to: '',
        mintOutMin: new Coin(
          config.merDenom,
          new Dec(usmAmt).mul(tolerance).mulPow(config.merDenomDecimals).toInt()
        ).toProto(),
        backingInMax: new Coin(
          backingMetadata.base,
          new Dec(backingAmt).mulPow(backingMetadata.displayExponent).toInt()
        ).toProto(),
        lionInMax: new Coin(
          config.denom,
          new Dec(lionAmt).mulPow(config.denomDecimals).toInt()
        ).toProto(),
        fullBacking: false, // TODO
      },
    }
    msg = msgMintBySwap
    title = `Swap ${backingAmt} ${backingMetadata.display} + ${lionAmt} ${config.displayDenom} for ${usmAmt} ${config.merDisplayDenom}`
  } else {
    const msgBurnBySwap: MsgBurnBySwapEncodeObject = {
      typeUrl: typeUrls.MsgBurnBySwap,
      value: {
        sender: account.mer(),
        to: '',
        burnIn: new Coin(
          config.merDenom,
          new Dec(usmAmt).mulPow(config.merDenomDecimals).toInt()
        ).toProto(),
        backingOutMin: new Coin(
          backingMetadata.base,
          new Dec(backingAmt)
            .mul(tolerance)
            .mulPow(backingMetadata.displayExponent)
            .toInt()
        ).toProto(),
        lionOutMin: new Coin(
          config.denom,
          new Dec(lionAmt).mul(tolerance).mulPow(config.denomDecimals).toInt()
        ).toProto(),
      },
    }
    msg = msgBurnBySwap
    title = `Swap ${usmAmt} ${config.merDisplayDenom} for ${backingAmt} ${backingMetadata.display} + ${lionAmt} ${config.displayDenom}`
  }

  console.debug(`${JSON.stringify(msg)}`)
  const receiptPromise = sendTx(msg)

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
