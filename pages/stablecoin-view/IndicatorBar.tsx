import { Box, HStack, Text, chakra, useColorModeValue } from '@chakra-ui/react'

import { DecDisplay } from '@/components/NumberDisplay'
import { formatNumberSuitable } from '@/utils'

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
  decorator?: string
  decimals?: number
  percentage?: boolean
  hint?: string
}

export const IndicatorText = ({
  name,
  content,
  decorator,
  decimals,
  percentage,
}: IndicatorTextProps) => {
  const decoratorColor = useColorModeValue('gray.600', 'gray.200')
  return (
    <HStack key={name}>
      <IndicatorBar color={indicatorColors[name]} />
      <Text>
        {percentage ? (
          <>
            <chakra.span color={decoratorColor} fontSize="sm">
              {decorator || name}&nbsp;
            </chakra.span>
            <DecDisplay value={content} percentage />
          </>
        ) : typeof decimals === 'number' ? (
          <>
            <chakra.span>{formatNumberSuitable(content, decimals)}</chakra.span>
            <chakra.span color={decoratorColor} fontSize="sm">
              &nbsp;{decorator || name}
            </chakra.span>
          </>
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
