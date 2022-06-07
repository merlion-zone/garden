import {
  Colors,
  extendTheme,
  theme as baseTheme,
  ThemeConfig,
  withDefaultColorScheme,
} from '@chakra-ui/react'
import { theme as proTheme } from '@chakra-ui/pro-theme'

export const theme: Record<string, any> = extendTheme(
  {
    styles: {
      global: {
        'html, body': {
          fontSize: 'md',
        },
      },
    },
    colors: { ...proTheme.colors, brand: proTheme.colors.green } as Colors,
    config: {
      cssVarPrefix: 'ck',
      initialColorMode: 'dark',
      useSystemColorMode: false,
    } as ThemeConfig,
  },
  withDefaultColorScheme({ colorScheme: 'brand' }),
  // Last extension as base theme
  {
    ...proTheme,
    components: {
      ...proTheme.components,
      Button: {
        ...proTheme.components.Button,
        variants: {
          ...proTheme.components.Button.variants,
          ghost: baseTheme.components.Button.variants.ghost,
          outline: baseTheme.components.Button.variants.outline,
        },
      },
    },
  }
)
