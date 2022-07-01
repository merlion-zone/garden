export const moduleAlerts = {
  usmPriceTooLow: (lowerBound: string) =>
    `USM price is too low to mint (needs to be more than ${lowerBound})`,
  usmPriceTooHigh: (upperBound: string) =>
    `USM price is too high to redeem (needs to be less than ${upperBound})`,
}

export const errors = {
  backingDisabled: 'Backing asset is disabled',
  collateralDisabled: 'Collateral asset is disabled',
  usmPriceTooLow: 'Too low USM price',
  usmPriceTooHigh: 'Too high USM price',
  backingInsufficientQuota: 'Exceeds backing asset quota',
  collateralInsufficientQuota: 'Exceeds collateral asset quota',
  usmInsufficientQuota: 'Insufficient USM quota',
  backingInsufficientBalance: 'Insufficient backing asset balance',
  collateralInsufficientBalance: 'Insufficient collateral asset balance',
  lionInsufficientBalance: 'Insufficient LION balance',
  usmInsufficientBalance: 'Insufficient USM balance',
  insufficientBalance: (denom?: string) => `Insufficient ${denom} balance`,
  invalidReceiverAddress: 'Invalid receiver address',
  noExcessBackingValue: 'No excess value allows buyback',
  noLackingBackingValue: 'No lacking value allows reback',
}

const moduleErrors = {
  maker: {
    'mer stablecoin price too low': errors.usmPriceTooLow,
    'mer stablecoin price too high': errors.usmPriceTooHigh,
    'backing params invalid': '',
    'collateral params invalid': '',
    'backing coin disabled': errors.backingDisabled,
    'collateral coin disabled': errors.collateralDisabled,
    'backing coin already exists': '',
    'collateral coin already exists': '',
    'backing coin not found': '',
    'collateral coin not found': '',
    'mer under slippage': '', // TODO
    'backing coin over slippage': '', // TODO
    'lion coin over slippage': '', // TODO
    'total backing coin over ceiling': errors.backingInsufficientQuota,
    'total collateral coin over ceiling': errors.collateralInsufficientQuota,
    'total mer coin over ceiling': errors.usmInsufficientQuota,
    'backing coin balance insufficient': errors.backingInsufficientQuota, // TODO
    'collateral coin balance insufficient': errors.collateralInsufficientQuota, // TODO
    'insufficient available lion coin': '', // TODO
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
  return 'Invalid amount entered'
}
