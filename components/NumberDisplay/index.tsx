import NumberFormat from 'react-number-format'
import { Dec } from '@merlionzone/merlionjs'

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
    value = Dec.withPrecision(value, decimals).toString()
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

interface DecDisplayProps {
  value: Dec | string | number | null | undefined
  prefix?: string
  suffix?: string
  percentage?: boolean
  precision?: number
}

export const DecDisplay = ({
  value,
  prefix,
  suffix,
  percentage,
  precision,
}: DecDisplayProps) => {
  if (value !== null && value !== undefined) {
    if (typeof value === 'string') {
      value = Dec.fromProto(value).toString()
    } else if (value instanceof Dec) {
      value = value.toString()
    }

    if (percentage) {
      value = new Dec(value).mul(100).toString()
      suffix = suffix ? `%${suffix}` : '%'
    }
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
