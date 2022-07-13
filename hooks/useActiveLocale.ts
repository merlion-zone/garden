import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  SupportedLocale,
} from 'constants/locales'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useMemo } from 'react'

import useParsedQueryString from './useParsedQueryString'
import { parsedQueryString } from './useParsedQueryString'

/**
 * Given a locale string (e.g. from user agent), return the best match for corresponding SupportedLocale
 * @param maybeSupportedLocale the fuzzy locale identifier
 */
function parseLocale(
  maybeSupportedLocale: unknown
): SupportedLocale | undefined {
  if (typeof maybeSupportedLocale !== 'string') return undefined
  const lowerMaybeSupportedLocale = maybeSupportedLocale.toLowerCase()
  return SUPPORTED_LOCALES.find(
    (locale) =>
      locale.toLowerCase() === lowerMaybeSupportedLocale ||
      locale.split('-')[0] === lowerMaybeSupportedLocale
  )
}

/**
 * Returns the supported locale read from the user agent (navigator)
 */
export function navigatorLocale(): SupportedLocale | undefined {
  if (typeof navigator === 'undefined' || !navigator.language) return undefined

  const [language, region] = navigator.language.split('-')

  if (region) {
    return (
      parseLocale(`${language}-${region.toUpperCase()}`) ??
      parseLocale(language)
    )
  }

  return parseLocale(language)
}

const userLocaleKey = 'userLocale'
const userLocaleAtom = atomWithStorage<SupportedLocale | null>(
  userLocaleKey,
  null
)

export function useUserLocale() {
  const [userLocale, setUserLocale] = useAtom(userLocaleAtom)
  return {
    userLocale,
    setUserLocale,
  }
}

function userLocale(): SupportedLocale | undefined {
  const userLocaleStr =
    typeof localStorage !== 'undefined' && localStorage.getItem(userLocaleKey)
  if (!userLocaleStr) {
    return
  }
  let userLocale
  try {
    userLocale = JSON.parse(userLocaleStr)
  } catch {}
  return parseLocale(userLocale)
}

const urlLocaleKey = 'lng'

function useUrlLocale() {
  const parsed = useParsedQueryString()
  return parseLocale(parsed.get(urlLocaleKey))
}

export const initialLocale =
  parseLocale(parsedQueryString().get(urlLocaleKey)) ??
  userLocale() ??
  navigatorLocale() ??
  DEFAULT_LOCALE

/**
 * Returns the currently active locale, from a combination of user agent, query string, and user settings stored in redux
 * Stores the query string locale in localStorage (if set) to persist across sessions
 */
export function useActiveLocale(): SupportedLocale {
  const urlLocale = useUrlLocale()
  const { userLocale } = useUserLocale()
  return useMemo(
    () => urlLocale ?? userLocale ?? navigatorLocale() ?? DEFAULT_LOCALE,
    [urlLocale, userLocale]
  )
}
