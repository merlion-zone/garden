import {
  Colors,
  extendTheme,
  theme as baseTheme,
  ThemeConfig,
  withDefaultColorScheme,
} from '@chakra-ui/react'
import { theme as proTheme } from '@chakra-ui/pro-theme'
import {
  mode,
  StyleFunctionProps,
  transparentize,
} from '@chakra-ui/theme-tools'

export const theme: Record<string, any> = extendTheme(
  {
    styles: {
      global: {
        'html, body': {
          fontSize: 'md',
        },
        '*::-webkit-scrollbar': {
          display: 'none',
        },
        '*': {
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        },
      },
    },
    colors: {
      ...proTheme.colors,
      brand: {
        '50': '#eaebfe',
        '100': '#c4c4ee',
        '200': '#9d9ce0',
        '300': '#7675d4',
        '400': '#4f4ec7',
        '500': '#3735ae',
        '600': '#2a2987',
        '700': '#1e1d61',
        '800': '#11113b',
        '900': '#050518',
      },
    } as Colors,
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
          'ghost-on-accent': (props: StyleFunctionProps) => {
            const { colorScheme: c, theme } = props
            const darkActiveBg = transparentize(`${c}.200`, 0.24)(theme)
            return {
              ...proTheme.components.Button.variants['ghost-on-accent'],
              _hover: {
                bg: mode(`${c}.500`, darkActiveBg)(props),
              },
              _active: {
                bg: mode(`${c}.500`, darkActiveBg)(props),
              },
            }
          },
        },
      },
    },
  }
)
