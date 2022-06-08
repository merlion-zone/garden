import NumberFormat from 'react-number-format'
import { BigNumber } from 'ethers'

interface AmountDisplayProps {
  value: string | number | null | undefined
  prefix?: string
  suffix?: string
  decimals?: number
  precision?: number
}

export const AmountDisplay = ({
  value,
  prefix,
  suffix,
  decimals,
  precision,
}: AmountDisplayProps) => {
  if (value && decimals) {
    value = BigNumber.from(value)
      .div(BigNumber.from(10).pow(decimals))
      .toString()
  }

  return (
    <NumberFormat
      value={value}
      displayType={'text'}
      thousandSeparator={true}
      prefix={prefix}
      suffix={suffix}
      decimalScale={precision ?? 4}
    />
  )
}
