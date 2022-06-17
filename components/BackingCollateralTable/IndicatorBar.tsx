import { Box, HStack, Text } from '@chakra-ui/react'
import { AmountDisplay, DecDisplay } from '@/components/NumberDisplay'

interface IndicatorBarProps {
  color?: string
  w?: string
  h?: string
}

export const IndicatorBar = ({ color, w, h }: IndicatorBarProps) => {
  return (
    <Box display="inline" bg={color ?? 'red'} w={w ?? '2'} h={h ?? '2px'}></Box>
  )
}

const indicatorColors = {
  USM: 'red',
  Backing: 'green',
  Collateral: 'green',
  LION: 'blue',
  Mint: 'teal',
  Burn: 'orange',
  Buyback: 'cyan',
  Reback: 'purple',
  Interest: 'orange',
  Basic: 'cyan',
  Max: 'purple',
  Catalytic: 'teal',
  Fee: 'yellow.500',
  Threshold: 'cyan',
}

interface IndicatorTextProps {
  name: keyof typeof indicatorColors
  content?: any
  hint?: string
  decimals?: number
  percentage?: boolean
}

export const IndicatorText = ({
  name,
  content,
  hint,
  decimals,
  percentage,
}: IndicatorTextProps) => {
  return (
    <HStack key={name}>
      <IndicatorBar color={indicatorColors[name]} />
      <Text>
        {percentage ? (
          <DecDisplay value={content} percentage />
        ) : typeof decimals === 'number' ? (
          <AmountDisplay value={content} decimals={decimals}></AmountDisplay>
        ) : (
          content ?? name
        )}
      </Text>
    </HStack>
  )
}

interface IndicatorTextBoxProps {
  items: IndicatorTextProps[]
  percentage?: boolean
}

export const IndicatorTextBox = ({
  items,
  percentage,
}: IndicatorTextBoxProps) => {
  return (
    <HStack>
      <Box>
        {items.map((item) =>
          IndicatorText({
            ...item,
            percentage,
          })
        )}
      </Box>
    </HStack>
  )
}
