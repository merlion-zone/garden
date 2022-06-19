const moduleErrors = {
  maker: {
    'mer stablecoin price too low': '',
    'mer stablecoin price too high': '',
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
    'total backing coin over ceiling': '',
    'total collateral coin over ceiling': '',
    'total mer coin over ceiling': 'Insufficient USM quota',
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
