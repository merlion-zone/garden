export const moduleAlerts = {
  usmPriceTooLow: (lowerBound: string) =>
    `USM price is too low to mint (needs to be more than ${lowerBound})`,
  usmPriceTooHigh: (upperBound: string) =>
    `USM price is too high to redeem (needs to be less than ${upperBound})`,
}

export const errors = {
  usmPriceTooLow: 'Too low USM price',
  usmPriceTooHigh: 'Too high USM price',
  backingInsufficientQuota: 'Exceeds backing asset quota',
  collateralInsufficientQuota: 'Exceeds collateral asset quota',
  usmInsufficientQuota: 'Insufficient USM quota',
}

const moduleErrors = {
  maker: {
    'mer stablecoin price too low': errors.usmPriceTooLow,
    'mer stablecoin price too high': errors.usmPriceTooHigh,
    'backing params invalid': '',
    'collateral params invalid': '',
    'backing coin disabled': '',
    'collateral coin disabled': '',
    'backing coin already exists': '',
    'collateral coin already exists': '',
    'backing coin not found': '',
    'collateral coin not found': '',
    'backing coin over slippage': '',
    'lion coin over slippage': '',
    'total backing coin over ceiling': errors.backingInsufficientQuota,
    'total collateral coin over ceiling': errors.collateralInsufficientQuota,
    'total mer coin over ceiling': errors.usmInsufficientQuota,
    'backing coin balance insufficient': '',
    'collateral coin balance insufficient': '',
    'insufficient available lion coin': '',
    'account has no collateral': '',
    'account has insufficient collateral': '',
    'account has no debt': '',
    'position is not undercollateralized': '',
  },
}

export function getModuleErrorMsg(
  module: keyof typeof moduleErrors,
  msg: string
): string {
  const errs = moduleErrors[module]
  for (const key of Object.keys(errs)) {
    if (msg.includes(key)) {
      return (<any>errs)[key]
    }
  }
  return ''
}
