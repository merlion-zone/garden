import {
  Colors,
  extendTheme,
  theme as baseTheme,
  ThemeConfig,
  withDefaultColorScheme,
} from '@chakra-ui/react'
import { theme as proTheme } from '@chakra-ui/pro-theme'
import {
  cssVar,
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
          solid: (props: StyleFunctionProps) => {
            const { colorScheme: c } = props
            if (c === 'gray') {
              return proTheme.components.Button.variants.solid
            }

            const bg = mode(`${c}.500`, `${c}.400`)(props)
            const grayBg = mode(`gray.100`, `whiteAlpha.200`)(props)

            return {
              bg,
              color: mode('white', `gray.100`)(props),
              _hover: {
                bg: mode(`${c}.600`, `${c}.500`)(props),
                _disabled: {
                  bg: grayBg,
                },
              },
              _disabled: {
                opacity: 1,
                color: mode('gray.500', `gray.400`)(props),
                bg: grayBg,
              },
              _active: { bg: mode(`${c}.700`, `${c}.600`)(props) },
            }
          },
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
      Tooltip: {
        ...proTheme.components.Tooltip,
        baseStyle: (props: StyleFunctionProps) => {
          const borderColor = mode('gray.300', 'gray.700')(props)
          const bg = mode('white', 'gray.800')(props)
          const $bg = cssVar('tooltip-bg')
          const $arrowBg = cssVar('popper-arrow-bg')
          const $arrowShadowColor = cssVar('popper-arrow-shadow-color')
          return {
            ...proTheme.components.Tooltip.baseStyle(props),
            [$bg.variable]: `colors.${bg}`,
            bg: [$bg.reference],
            [$arrowBg.variable]: [$bg.reference],
            [$arrowShadowColor.variable]: `colors.${borderColor}`,
            color: mode('gray.500', 'whiteAlpha.700')(props),
            border: '1px',
            borderRadius: '2xl',
            borderColor,
            px: '16px',
            py: '8px',
          }
        },
      },
    },
  }
)
