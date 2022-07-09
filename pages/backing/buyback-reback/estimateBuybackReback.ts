import { Dec, proto } from '@merlionzone/merlionjs'

import { InputKind } from '@/pages/backing/swap-mint/estimateSwapMint'
import { isValidAmount } from '@/utils'

interface EstimateBuybackRebackArgs {
  isBuyback: boolean
  inputKind: InputKind
  makerParams: proto.makerGenesis.Params
  backingParams: proto.maker.BackingRiskParams
  excessBackingValue: Dec
  backingPrice: Dec
  lionPrice: Dec
  backingAmt: string
  lionAmt: string
}

export function estimateBuybackReback({
  isBuyback,
  inputKind,
  makerParams,
  backingParams,
  excessBackingValue,
  backingPrice,
  lionPrice,
  backingAmt,
  lionAmt,
}: EstimateBuybackRebackArgs) {
  const cleanAmouts = (skipDenom: InputKind) => {
    return {
      resolvedBackingAmt: skipDenom === InputKind.Backing ? backingAmt : '',
      resolvedLionAmt: skipDenom === InputKind.Lion ? lionAmt : '',
      resolvedFeeAmt: '',
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
  }

  let resolvedBackingAmt = new Dec(0)
  let resolvedLionAmt = new Dec(0)
  let resolvedFeeAmt = new Dec(0)

  switch (inputKind) {
    case InputKind.Backing:
      {
        if (isBuyback) {
          const buybackFee = Dec.fromProto(backingParams.buybackFee)
          const maxBackingAmt = excessBackingValue
            .mul(new Dec(1).sub(buybackFee))
            .div(backingPrice)
          // TODO: check backing balance of module account
          resolvedBackingAmt = maxBackingAmt.lessThan(backingAmt)
            ? maxBackingAmt
            : new Dec(backingAmt)
          const resolvedBackingAmtWithFee = resolvedBackingAmt.div(
            new Dec(1).sub(buybackFee)
          )
          resolvedLionAmt = resolvedBackingAmtWithFee
            .mul(backingPrice)
            .div(lionPrice)
          resolvedFeeAmt = resolvedBackingAmtWithFee.mul(buybackFee)
        } else {
          const rebackBonus = Dec.fromProto(makerParams.rebackBonus)
          const rebackFee = Dec.fromProto(backingParams.rebackFee)
          const maxBackingAmt = new Dec(excessBackingValue.neg()).div(
            backingPrice
          )
          resolvedBackingAmt = maxBackingAmt.lessThan(backingAmt)
            ? maxBackingAmt
            : new Dec(backingAmt)
          const resolvedLionAmtWithFee = new Dec(resolvedBackingAmt)
            .mul(backingPrice)
            .div(lionPrice)
          const resolvedBonusAmt = resolvedLionAmtWithFee.mul(rebackBonus)
          resolvedFeeAmt = resolvedLionAmtWithFee.mul(rebackFee)
          resolvedLionAmt = resolvedLionAmtWithFee
            .add(resolvedBonusAmt)
            .sub(resolvedFeeAmt)
        }
      }
      break
    case InputKind.Lion:
      {
        if (isBuyback) {
          const buybackFee = Dec.fromProto(backingParams.buybackFee)
          const maxLionAmt = excessBackingValue.div(lionPrice)
          // TODO: check backing balance of module account
          resolvedLionAmt = maxLionAmt.lessThan(lionAmt)
            ? maxLionAmt
            : new Dec(lionAmt)
          const resolvedBackingAmtWithFee = resolvedLionAmt
            .mul(lionPrice)
            .div(backingPrice)
          resolvedFeeAmt = resolvedBackingAmtWithFee.mul(buybackFee)
          resolvedBackingAmt = resolvedBackingAmtWithFee.sub(resolvedFeeAmt)
        } else {
          const rebackBonus = Dec.fromProto(makerParams.rebackBonus)
          const rebackFee = Dec.fromProto(backingParams.rebackFee)
          const maxLionAmt = new Dec(excessBackingValue.neg())
            .div(lionPrice)
            .mul(new Dec(1).add(rebackBonus).sub(rebackFee))
          resolvedLionAmt = maxLionAmt.lessThan(lionAmt)
            ? maxLionAmt
            : new Dec(lionAmt)
          const resolvedLionAmtWithFee = resolvedLionAmt.div(
            new Dec(1).add(rebackBonus).sub(rebackFee)
          )
          resolvedBackingAmt = resolvedLionAmtWithFee
            .mul(lionPrice)
            .div(backingPrice)
          const resolvedBonusAmt = resolvedLionAmtWithFee.mul(rebackBonus)
          resolvedFeeAmt = resolvedLionAmtWithFee.mul(rebackFee)
        }
      }
      break
  }

  return {
    resolvedBackingAmt,
    resolvedLionAmt,
    resolvedFeeAmt,
    estimated: !!(resolvedLionAmt || resolvedLionAmt || resolvedFeeAmt),
  }
}
