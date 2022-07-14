import { Coin, Dec } from '@merlionzone/merlionjs'
import { Coin as CosmCoin } from 'cosmjs-types/cosmos/base/v1beta1/coin'

import { MerlionQueryClient } from '@/hooks'
import { DenomMetadata, getModuleErrorMsg } from '@/hooks/query'
import { isValidAmount } from '@/utils'

export enum InputKind {
  None = 'none',
  Backing = 'backing',
  Collateral = 'collateral',
  Lion = 'lion',
  Usm = 'usm',
}

interface EstimateSwapMintArgs {
  isMint: boolean
  inputKind: InputKind
  backingMetadata: DenomMetadata
  lionMetadata: DenomMetadata
  usmMetadata: DenomMetadata
  backingAmt: string
  lionAmt: string
  usmAmt: string
  displayAmount: (coin?: CosmCoin, oldAmt?: string | boolean) => string
  queryClient: MerlionQueryClient
}

export async function estimateSwapMint({
  isMint,
  inputKind,
  backingMetadata,
  lionMetadata,
  usmMetadata,
  backingAmt,
  lionAmt,
  usmAmt,
  displayAmount,
  queryClient,
}: EstimateSwapMintArgs): Promise<{
  backingAmt: string
  lionAmt: string
  usmAmt: string
  feeAmt: string
  estimated: boolean
  errMsg?: string
}> {
  const estimateSwapMintOut = async () => {
    const backingInMax = new Coin(
      backingMetadata.base,
      new Dec(inputKind === InputKind.Backing ? backingAmt : 0).mulPow(
        backingMetadata.displayExponent || 0
      )
    ).toProto()

    const lionInMax = new Coin(
      lionMetadata.base,
      new Dec(inputKind === InputKind.Lion ? lionAmt : 0).mulPow(
        lionMetadata.displayExponent || 0
      )
    ).toProto()

    const resp = await queryClient?.maker.estimateMintBySwapOut({
      backingInMax,
      lionInMax,
      fullBacking: false, // TODO
    })

    return {
      backingAmt: displayAmount(
        resp.backingIn,
        inputKind === InputKind.Backing && backingAmt
      ),
      lionAmt: displayAmount(
        resp.lionIn,
        inputKind === InputKind.Lion && lionAmt
      ),
      usmAmt: displayAmount(resp.mintOut),
      feeAmt: displayAmount(resp.mintFee),
    }
  }

  const estimateSwapMintIn = async () => {
    const usmOut = new Coin(
      usmMetadata.base,
      new Dec(usmAmt).mulPow(usmMetadata.displayExponent || 0)
    ).toProto()

    const resp = await queryClient?.maker.estimateMintBySwapIn({
      mintOut: usmOut,
      backingDenom: backingMetadata.base,
      fullBacking: false, // TODO
    })

    return {
      backingAmt: displayAmount(resp.backingIn),
      lionAmt: displayAmount(resp.lionIn),
      usmAmt,
      feeAmt: displayAmount(resp.mintFee),
    }
  }

  const estimateSwapBurnOut = async () => {
    const usmIn = new Coin(
      usmMetadata.base,
      new Dec(usmAmt).mulPow(usmMetadata.displayExponent || 0)
    ).toProto()

    const resp = await queryClient?.maker.estimateBurnBySwapOut({
      burnIn: usmIn,
      backingDenom: backingMetadata.base,
    })

    return {
      backingAmt: displayAmount(resp.backingOut),
      lionAmt: displayAmount(resp.lionOut),
      usmAmt,
      feeAmt: displayAmount(resp.burnFee),
    }
  }

  const estimateSwapBurnIn = async () => {
    const backingOutMax = new Coin(
      backingMetadata.base,
      new Dec(inputKind === InputKind.Backing ? backingAmt : 0).mulPow(
        backingMetadata.displayExponent || 0
      )
    ).toProto()

    const lionOutMax = new Coin(
      lionMetadata.base,
      new Dec(inputKind === InputKind.Lion ? lionAmt : 0).mulPow(
        lionMetadata.displayExponent || 0
      )
    ).toProto()

    const resp = await queryClient?.maker.estimateBurnBySwapIn({
      backingOutMax,
      lionOutMax,
    })

    return {
      backingAmt: displayAmount(
        resp.backingOut,
        inputKind === InputKind.Backing && backingAmt
      ),
      lionAmt: displayAmount(
        resp.lionOut,
        inputKind === InputKind.Lion && lionAmt
      ),
      usmAmt: displayAmount(resp.burnIn),
      feeAmt: displayAmount(resp.burnFee),
    }
  }

  const cleanAmouts = (skipDenom: InputKind) => {
    return {
      backingAmt: skipDenom === InputKind.Backing ? backingAmt : '',
      lionAmt: skipDenom === InputKind.Lion ? lionAmt : '',
      usmAmt: skipDenom === InputKind.Usm ? usmAmt : '',
      feeAmt: '',
      estimated: false,
    }
  }

  switch (inputKind) {
    case InputKind.None:
      throw new Error('invalid denom input kind')
    case InputKind.Backing:
      if (!isValidAmount(backingAmt)) {
        return cleanAmouts(InputKind.Backing)
      }
      break
    case InputKind.Lion:
      if (!isValidAmount(lionAmt)) {
        return cleanAmouts(InputKind.Lion)
      }
      break
    case InputKind.Usm:
      if (!isValidAmount(usmAmt)) {
        return cleanAmouts(InputKind.Usm)
      }
      break
  }

  let promise

  if (isMint) {
    // mint
    if (inputKind === InputKind.Backing || inputKind === InputKind.Lion) {
      promise = estimateSwapMintOut()
    } else {
      promise = estimateSwapMintIn()
    }
  } else {
    // burn
    if (inputKind === InputKind.Usm) {
      promise = estimateSwapBurnOut()
    } else {
      promise = estimateSwapBurnIn()
    }
  }

  try {
    const result = await promise
    return {
      ...result,
      estimated: !!(result.backingAmt || result.lionAmt || result.usmAmt),
    }
  } catch (e: any) {
    console.warn(`estimateSwapMint: ${e}`)
    return {
      ...cleanAmouts(inputKind),
      errMsg: getModuleErrorMsg('maker', e.toString()),
    }
  }
}
