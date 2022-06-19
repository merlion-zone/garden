import { DenomMetadata } from '@/hooks/query'
import React, { ChangeEvent } from 'react'
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

export interface TokenAmount {
  metadata?: DenomMetadata
  selectable?: boolean
  proportion?: string
  proportionHint?: string
}

interface AmountInputProps {
  token: TokenAmount
  value: string
  onSelectToken?: false | (() => void)
  onInput?: (event: ChangeEvent<HTMLInputElement>) => void
}

export const AmountInput = ({
  token,
  value,
  onSelectToken,
  onInput,
}: AmountInputProps) => {
  return (
    <Box
      w="full"
      h="28"
      bg={useColorModeValue('gray.50', 'gray.800')}
      borderRadius="3xl"
      border="1px"
      borderColor="transparent"
      _hover={{ borderColor: useColorModeValue('gray.300', 'gray.700') }}
    >
      <HStack p="4">
        <Input
          variant="unstyled"
          fontSize="3xl"
          fontWeight="550"
          placeholder="0.0"
          type="number"
          name={token.metadata?.base}
          value={value}
          onChange={onInput}
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
                value={token.metadata?.symbol ?? ''}
                style="shape"
                size={24}
              />
            }
            rightIcon={
              <ChevronDownIcon color={!token.selectable ? 'transparent' : ''} />
            }
            onClick={onSelectToken || (() => {})}
          >
            {token.metadata?.symbol}
          </Button>
        </Box>
      </HStack>
      <HStack justify="space-between" px="6">
        <Text fontSize="sm" color="subtle">
          {token.proportion && (
            <Tooltip hasArrow placement="right" label={token.proportionHint}>
              {token.proportion}
            </Tooltip>
          )}
        </Text>
        <Text fontSize="sm" color="subtle">
          Balance: 0
        </Text>
      </HStack>
    </Box>
  )
}
