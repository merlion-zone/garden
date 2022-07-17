import { Dec, proto } from '@merlionzone/merlionjs'

import { AmountMetadata } from '@/components/AmountInput'
import config from '@/config'
import { BlocksPerMinute, BlocksPerYear } from '@/constants'

export function calculateActualLtv({
  isDeposit,
  collateralParams,
  collateralToken,
  accountCollateral,
  collateralPrice,
  lionPrice,
  collateralAmt,
  lionAmt,
}: {
  isDeposit: boolean
  collateralParams?: proto.maker.CollateralRiskParams
  collateralToken: AmountMetadata
  accountCollateral?: proto.maker.AccountCollateral
  collateralPrice?: Dec
  lionPrice?: Dec
  collateralAmt?: string
  lionAmt?: string
}): {
  catalyticRatio: Dec
  ltv: Dec
  maxLoan: Dec
  error?: boolean
} {
  const maxLtv = Dec.fromProto(collateralParams?.loanToValue || '')
  const basicLtv = Dec.fromProto(collateralParams?.basicLoanToValue || '')
  const fullCatalyticRatio = Dec.fromProto(
    collateralParams?.catalyticLionRatio || ''
  )

  let collateral = new Dec(accountCollateral?.collateral?.amount).divPow(
    collateralToken.metadata?.displayExponent || 0
  )
  let lionCollateralized = new Dec(
    accountCollateral?.lionCollateralized?.amount
  ).divPow(config.denomDecimals)

  if (isDeposit) {
    collateral = collateral.add(collateralAmt || 0)
    lionCollateralized = lionCollateralized.add(lionAmt || 0)
  } else {
    collateral = collateral.sub(collateralAmt || 0)
    lionCollateralized = lionCollateralized.sub(lionAmt || 0)
    if (collateral.lessThan(0) || lionCollateralized.lessThan(0)) {
      return {
        catalyticRatio: new Dec(0),
        ltv: new Dec(0),
        maxLoan: new Dec(0),
        error: true,
      }
    }
  }

  const collateralValue = collateral.mul(collateralPrice || 0)
  let catalyticRatio = collateralValue.greaterThan(0)
    ? lionCollateralized.mul(lionPrice || 0).div(collateralValue)
    : new Dec(0)
  if (catalyticRatio.greaterThan(fullCatalyticRatio)) {
    catalyticRatio = fullCatalyticRatio
  }

  let ltv = basicLtv
  if (fullCatalyticRatio.greaterThan(0)) {
    ltv = maxLtv
      .sub(basicLtv)
      .mul(catalyticRatio)
      .div(fullCatalyticRatio)
      .add(basicLtv)
  }

  const maxLoan = collateral
    .mul(collateralPrice || 0)
    .mul(ltv)
    .mulPow(config.merDenomDecimals)

  return {
    catalyticRatio,
    ltv,
    maxLoan,
  }
}

export function calculateDebt({
  collateralParams,
  accountCollateral,
  latestBlockHeight,
}: {
  collateralParams?: proto.maker.CollateralRiskParams
  accountCollateral?: proto.maker.AccountCollateral
  latestBlockHeight?: number
}): {
  debt: Dec
  interest: Dec
  interestPerMinute: Dec
} {
  const period =
    (latestBlockHeight || 0) -
    (accountCollateral?.lastSettlementBlock.toNumber() || 0)
  const principal = new Dec(accountCollateral?.merDebt!.amount).sub(
    accountCollateral?.lastInterest!.amount || 0
  )
  const interestOfPeriod = principal
    .mul(Dec.fromProto(collateralParams?.interestFee || ''))
    .mul(period)
    .div(BlocksPerYear)

  const interestPerMinute = principal
    .mul(Dec.fromProto(collateralParams?.interestFee || ''))
    .mul(BlocksPerMinute)
    .div(BlocksPerYear)

  const interest = interestOfPeriod.add(
    accountCollateral?.lastInterest!.amount || 0
  )
  const debt = principal.add(interest)

  return {
    debt,
    interest,
    interestPerMinute,
  }
}
