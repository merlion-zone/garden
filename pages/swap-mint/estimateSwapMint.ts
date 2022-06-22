import { DenomMetadata } from '@/hooks/query'
import { Coin, Dec } from '@merlionzone/merlionjs'
import { Coin as CosmCoin } from 'cosmjs-types/cosmos/base/v1beta1/coin'
import { MerlionQueryClient } from '@/hooks'
import { isValidAmount } from '@/utils'

export enum DenomInput {
  None = 'None',
  Backing = 'backing',
  Lion = 'lion',
  Usm = 'usm',
}

interface EstimateSwapMintArgs {
  isMint: boolean
  denomInput: DenomInput
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
  denomInput,
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
}> {
  const estimateSwapMintOut = async () => {
    const backingInMax = new Coin(
      backingMetadata.base,
      new Dec(denomInput === DenomInput.Backing ? backingAmt : 0).mulPow(
        backingMetadata.displayExponent || 0
      )
    ).toProto()

    const lionInMax = new Coin(
      lionMetadata.base,
      new Dec(denomInput === DenomInput.Lion ? lionAmt : 0).mulPow(
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
        denomInput === DenomInput.Backing && backingAmt
      ),
      lionAmt: displayAmount(
        resp.lionIn,
        denomInput === DenomInput.Lion && lionAmt
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
      new Dec(denomInput === DenomInput.Backing ? backingAmt : 0).mulPow(
        backingMetadata.displayExponent || 0
      )
    ).toProto()

    const lionOutMax = new Coin(
      lionMetadata.base,
      new Dec(denomInput === DenomInput.Lion ? lionAmt : 0).mulPow(
        lionMetadata.displayExponent || 0
      )
    ).toProto()

    const resp = await queryClient?.maker.estimateBurnBySwapIn({
      backingOutMax,
      lionOutMax,
    })

    return {
      backingAmt: displayAmount(resp.backingOut),
      lionAmt: displayAmount(resp.lionOut),
      usmAmt: displayAmount(resp.burnIn),
      feeAmt: displayAmount(resp.burnFee),
    }
  }

  const cleanAmouts = (skipDenom: DenomInput) => {
    return {
      backingAmt: skipDenom === DenomInput.Backing ? backingAmt : '',
      lionAmt: skipDenom === DenomInput.Lion ? lionAmt : '',
      usmAmt: skipDenom === DenomInput.Usm ? usmAmt : '',
      feeAmt: '',
      estimated: false,
    }
  }

  switch (denomInput) {
    case DenomInput.None:
      throw new Error('invalid denom input kind')
    case DenomInput.Backing:
      if (!isValidAmount(backingAmt)) {
        return cleanAmouts(DenomInput.Backing)
      }
      break
    case DenomInput.Lion:
      if (!isValidAmount(lionAmt)) {
        return cleanAmouts(DenomInput.Lion)
      }
      break
    case DenomInput.Usm:
      if (!isValidAmount(usmAmt)) {
        return cleanAmouts(DenomInput.Usm)
      }
      break
  }

  let promise

  if (isMint) {
    // mint
    if (denomInput === DenomInput.Backing || denomInput === DenomInput.Lion) {
      promise = estimateSwapMintOut()
    } else {
      promise = estimateSwapMintIn()
    }
  } else {
    // burn
    if (denomInput === DenomInput.Usm) {
      promise = estimateSwapBurnOut()
    } else {
      promise = estimateSwapBurnIn()
    }
  }

  const result = await promise
  return {
    ...result,
    estimated: !!(result.backingAmt || result.lionAmt || result.usmAmt),
  }
}
