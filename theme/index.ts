import { Colors, extendTheme, ThemeConfig } from '@chakra-ui/react'
import { theme as baseTheme } from '@chakra-ui/pro-theme'

export const theme: Record<string, any> = extendTheme(
  {
    styles: {
      global: {
        'html, body': {
          fontSize: 'md',
        },
      },
    },
    colors: { ...baseTheme.colors, brand: baseTheme.colors.green } as Colors,
    config: {
      cssVarPrefix: 'ck',
      initialColorMode: 'dark',
      useSystemColorMode: false,
    } as ThemeConfig,
  },
  baseTheme
)
