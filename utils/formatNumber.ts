import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/constants/locales'
import { Dec } from '@merlionzone/merlionjs'

interface FormatLocaleNumberArgs {
  number?: number | string | Dec | null
  locale?: string
  options?: Intl.NumberFormatOptions
  sigFigs?: number
  fixedDecimals?: number
  placeholder?: string
}

export function formatNumberWithOptions({
  number,
  locale,
  options = {},
  sigFigs,
  fixedDecimals,
  placeholder,
}: FormatLocaleNumberArgs): string {
  let localeArg: string | string[]
  if (!locale || (locale && !SUPPORTED_LOCALES.includes(locale))) {
    localeArg = DEFAULT_LOCALE
  } else {
    localeArg = [locale, DEFAULT_LOCALE]
  }
  options.minimumFractionDigits = options.minimumFractionDigits || fixedDecimals
  options.maximumFractionDigits = options.maximumFractionDigits || fixedDecimals

  // Fixed decimals should override significant figures.
  options.maximumSignificantDigits =
    options.maximumSignificantDigits || fixedDecimals ? undefined : sigFigs

  let num: number
  if (number === undefined || number === null) {
    num = 0
  } else if (typeof number === 'string') {
    num = Number(number)
  } else if (number instanceof Dec) {
    num = number.toNumber()
  } else {
    num = number
  }

  num = fixedDecimals ? parseFloat(num.toFixed(fixedDecimals)) : num

  const numStr = Intl.NumberFormat(localeArg, options).format(num)

  if (placeholder && (number === undefined || number === null)) {
    return numStr.replace(/\d+(?:\.\d+)?|\.\d+/, placeholder)
  } else {
    return numStr
  }
}

export function formatCurrency(
  number?: number | string | Dec | null,
  placeholder = '--'
): string {
  return formatNumberWithOptions({
    number,
    options: {
      style: 'currency',
      currency: 'USD',
    },
    placeholder,
  })
}

export function formatNumber(
  number?: number | string | Dec | null,
  maximumFractionDigits = 2,
  placeholder?: string
): string {
  return formatNumberWithOptions({
    number,
    options: {
      maximumFractionDigits,
    },
    placeholder,
  })
}

export function formatNumberCompact(
  number?: number | string | Dec | null,
  maximumFractionDigits = 2,
  placeholder?: string
): string {
  return formatNumberWithOptions({
    number,
    options: {
      notation: 'compact',
      compactDisplay: 'short',
      // minimumSignificantDigits: 1,
      // maximumSignificantDigits: 3,
      maximumFractionDigits,
    },
    placeholder,
  })
}

export function formatNumberSuitable(
  number?: number | string | Dec | null,
  negScale?: number,
  maximumFractionDigits = 4,
  placeholder = '--'
): string {
  if (number !== undefined && number !== null && negScale !== undefined) {
    number = new Dec(number).divPow(negScale).toNumber()
  }
  const numStr = formatNumber(number, maximumFractionDigits, placeholder)
  if (numStr.length <= 7 + maximumFractionDigits) {
    return numStr
  }
  return formatNumberCompact(number, maximumFractionDigits, placeholder)
}
