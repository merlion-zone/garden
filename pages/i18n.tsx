import { ReactNode, useCallback } from 'react'

import { SupportedLocale } from '@/constants/locales'
import {
  initialLocale,
  useActiveLocale,
  useUserLocale,
} from '@/hooks/useActiveLocale'
import { Provider, dynamicActivate } from '@/lib/i18n'

dynamicActivate(initialLocale)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useActiveLocale()
  const { setUserLocale } = useUserLocale()

  const onActivate = useCallback(
    (locale: SupportedLocale) => {
      document.documentElement.setAttribute('lang', locale)
      setUserLocale(locale) // stores the selected locale to persist across sessions
    },
    [setUserLocale]
  )

  return (
    <Provider
      locale={locale}
      forceRenderAfterLocaleChange={false}
      onActivate={onActivate}
    >
      {children}
    </Provider>
  )
}
