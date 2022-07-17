import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  useColorModeValue,
  useToken,
} from '@chakra-ui/react'
import { SystemStyleObject } from '@chakra-ui/styled-system'
import { TinyColor } from '@ctrl/tinycolor'
import { Dec } from '@merlionzone/merlionjs'
import Avvvatars from 'avvvatars-react'

import { WithHint } from '@/components/Hint'
import { AmountDisplay } from '@/components/NumberDisplay'
import { useAccountAddress } from '@/hooks'
import { DenomMetadata, useBalance } from '@/hooks/query'
import { formatNumberSuitable } from '@/utils'

export interface AmountMetadata {
  metadata?: DenomMetadata
  price?: Dec | null
  proportion?: string
  proportionHint?: string
}

interface AmountInputProps {
  id?: string
  token: AmountMetadata
  value: string
  onSelectToken?: false | (() => void)
  onInput?: (name: string, value: string) => void
  isDisabled?: boolean
  noAnnotation?: boolean
  noMaxButton?: boolean
  bg?: string
  border?: SystemStyleObject
  hoverBorder?: boolean | SystemStyleObject
  focusBorder?: boolean | SystemStyleObject
  transition?: boolean
}

export const AmountInput = ({
  id,
  token,
  value,
  onSelectToken,
  onInput,
  isDisabled,
  noAnnotation,
  noMaxButton,
  bg,
  border = {},
  hoverBorder,
  focusBorder,
}: AmountInputProps) => {
  const account = useAccountAddress()
  const { balance } = useBalance(account?.mer(), token.metadata?.base)
  const balanceDisplay = new Dec(balance).divPow(
    token.metadata?.displayExponent || 0
  )

  const amountValue = value && token.price && new Dec(value).mul(token.price)

  const bgDefault = useColorModeValue('gray.50', 'gray.800')

  const borderColor = useColorModeValue('gray.300', 'gray.600')
  const focusBorderColor = useColorModeValue('brand.500', 'brand.200')

  const [brand500, brand200] = useToken('colors', ['brand.500', 'brand.200'])
  const focusBoxShadow = useColorModeValue(
    `0px 0px 0px 1px ${new TinyColor(brand500).setAlpha(1.0).toRgbString()}`,
    `0px 0px 0px 1px ${new TinyColor(brand200).setAlpha(1.0).toRgbString()}`
  )

  const selectTokenBtnBoxShadow = useColorModeValue('md', 'md-dark')
  const selectTokenBtnBg = useColorModeValue('gray.200', 'gray.800')
  const selectTokenBtnHoverBg = useColorModeValue('gray.300', 'gray.700')

  return (
    <Box
      w="full"
      h={!noAnnotation ? '28' : '16'}
      bg={bg || bgDefault}
      sx={{
        borderColor: hoverBorder ? 'transparent' : borderColor,
        borderRadius: '3xl',
        borderWidth: '1px',
        ...border,
      }}
      _hover={
        hoverBorder === true
          ? { borderColor }
          : hoverBorder
          ? hoverBorder
          : undefined
      }
      _focusWithin={
        focusBorder === true
          ? {
              borderColor: focusBorderColor,
              boxShadow: focusBoxShadow,
            }
          : focusBorder
          ? focusBorder
          : undefined
      }
      transitionProperty="common"
      transitionDuration="normal"
    >
      <HStack px="4" py={!noAnnotation ? '4' : '3'}>
        <Input
          id={id}
          variant="unstyled"
          fontSize={!noAnnotation ? '3xl' : 'xl'}
          fontWeight="550"
          placeholder="0.0"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          pattern="^[0-9]*[.,]?[0-9]*$"
          minLength={1}
          maxLength={79}
          spellCheck={false}
          name={token.metadata?.base}
          value={value}
          onChange={(event) => {
            const { name, value } = event.target
            if (!value.match(/^\d*[.,]?\d*$/)) {
              return
            }
            onInput?.(name, value)
          }}
          isDisabled={isDisabled || !onInput}
        ></Input>
        <Box borderRadius="2xl" boxShadow={selectTokenBtnBoxShadow}>
          <Button
            variant="ghost"
            colorScheme="gray"
            bg={selectTokenBtnBg}
            _hover={{ bg: onSelectToken ? selectTokenBtnHoverBg : undefined }}
            _active={{ bg: onSelectToken ? selectTokenBtnHoverBg : undefined }}
            borderRadius="2xl"
            leftIcon={
              <Avvvatars
                value={token.metadata?.base ?? ''}
                style="shape"
                size={24}
              />
            }
            rightIcon={
              <ChevronDownIcon color={!onSelectToken ? 'transparent' : ''} />
            }
            onClick={onSelectToken || (() => {})}
          >
            {token.metadata?.symbol}
          </Button>
        </Box>
      </HStack>
      {!noAnnotation && (
        <HStack justify="space-between" px="5">
          <HStack fontSize="sm" color="subtle">
            {token.proportion && (
              <Text>
                <WithHint placement="right" hint={token.proportionHint}>
                  {token.proportion}
                </WithHint>
              </Text>
            )}
            <Text>
              {amountValue && '$' + formatNumberSuitable(amountValue)}
            </Text>
          </HStack>
          <Text
            fontSize="sm"
            color="subtle"
            cursor="pointer"
            onClick={() => {
              if (noMaxButton) {
                return
              }
              balanceDisplay.greaterThan(0) &&
                onInput?.(token.metadata?.base || '', balanceDisplay.toString())
            }}
          >
            Balance:&nbsp;
            {formatNumberSuitable(balance, token.metadata?.displayExponent)}
            {!noMaxButton && balanceDisplay.greaterThan(0) && (
              <Button variant="ghost" size="xs">
                Max
              </Button>
            )}
          </Text>
        </HStack>
      )}
    </Box>
  )
}
