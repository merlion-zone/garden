import { DenomMetadata, useBalance } from '@/hooks/query'
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import Avvvatars from 'avvvatars-react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useAccountAddress } from '@/hooks'
import { AmountDisplay } from '@/components/NumberDisplay'
import { Dec } from '@merlionzone/merlionjs'

export interface AmountMetadata {
  metadata?: DenomMetadata
  price?: Dec | null
  proportion?: string
  proportionHint?: string
}

interface AmountInputProps {
  token: AmountMetadata
  value: string
  onSelectToken?: false | (() => void)
  onInput?: (name: string, value: string) => void
  isDisabled?: boolean
  noAnnotation?: boolean
}

export const AmountInput = ({
  token,
  value,
  onSelectToken,
  onInput,
  isDisabled,
  noAnnotation,
}: AmountInputProps) => {
  const account = useAccountAddress()
  const { balance } = useBalance(account?.mer(), token.metadata?.base)
  const balanceDisplay = new Dec(balance).divPow(
    token.metadata?.displayExponent || 0
  )

  const amountValue = value && token.price && new Dec(value).mul(token.price)

  const borderColor = useColorModeValue('gray.300', 'gray.700')

  return (
    <Box
      w="full"
      h={!noAnnotation ? '28' : '16'}
      bg={useColorModeValue('gray.50', 'gray.800')}
      borderRadius="3xl"
      border="1px"
      borderColor={!noAnnotation ? 'transparent' : borderColor}
      _hover={{ borderColor }}
    >
      <HStack px="4" py={!noAnnotation ? '4' : '3'}>
        <Input
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
        <Box borderRadius="2xl" boxShadow={useColorModeValue('md', 'md-dark')}>
          <Button
            variant="ghost"
            colorScheme="gray"
            bg={useColorModeValue('gray.200', 'gray.800')}
            _hover={{ bg: useColorModeValue('gray.300', 'gray.700') }}
            _active={{ bg: useColorModeValue('gray.300', 'gray.700') }}
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
            isDisabled={isDisabled}
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
                <Tooltip
                  hasArrow
                  placement="right"
                  label={token.proportionHint}
                >
                  {token.proportion}
                </Tooltip>
              </Text>
            )}
            <Text>
              <AmountDisplay
                value={amountValue}
                prefix="$"
                placeholder={false}
              />
            </Text>
          </HStack>
          <Text
            fontSize="sm"
            color="subtle"
            cursor="pointer"
            onClick={() => {
              balanceDisplay.isPositive() &&
                onInput?.(token.metadata?.base || '', balanceDisplay.toString())
            }}
          >
            Balance:&nbsp;
            <AmountDisplay
              value={balance}
              decimals={token.metadata?.displayExponent}
            />
            {balanceDisplay.isPositive() && (
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
