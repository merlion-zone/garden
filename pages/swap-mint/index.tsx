import {
  Box,
  Center,
  Container,
  HStack,
  Input,
  Button,
  Text,
  useColorModeValue,
  IconButton,
  Tooltip,
  Stack,
  Heading,
  useBreakpointValue,
} from '@chakra-ui/react'
import Avvvatars from 'avvvatars-react'
import {
  AddIcon,
  SmallAddIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  SettingsIcon,
} from '@chakra-ui/icons'
import { ReactElement, useState } from 'react'
import { Hint } from '@/components/Hint'

interface TokenAmount {
  symbol: string
  selectable?: boolean
  percentage?: string
  percentageHint?: string
}

export default function Portfolio() {
  const [backingToken, setBackingToken] = useState<TokenAmount>({
    symbol: 'ETH',
    selectable: true,
    percentage: '99%',
    percentageHint: 'Current system backing ratio (BR)',
  })
  const [lionToken, setLionToken] = useState<TokenAmount>({
    symbol: 'LION',
    percentage: '1%',
    percentageHint: '= 100% - BR',
  })
  const [usmToken, setUsmToken] = useState<TokenAmount>({ symbol: 'USM' })

  const [isMint, setIsMint] = useState(true)

  const AmountInput = ({ token, ...props }: { token: TokenAmount } & any) => (
    <Box
      w="full"
      h="28"
      bg={useColorModeValue('gray.50', 'gray.800')}
      borderRadius="3xl"
      border="1px"
      borderColor="transparent"
      _hover={{ borderColor: useColorModeValue('gray.300', 'gray.700') }}
      {...props}
    >
      <HStack p="4">
        <Input
          variant="unstyled"
          fontSize="3xl"
          fontWeight="550"
          placeholder="0.0"
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
              <Avvvatars value={token.symbol} style="shape" size={24} />
            }
            rightIcon={
              <ChevronDownIcon color={!token.selectable ? 'transparent' : ''} />
            }
          >
            {token.symbol}
          </Button>
        </Box>
      </HStack>
      <HStack justify="space-between" px="6">
        <Text fontSize="sm" color="subtle">
          {token.percentage && (
            <Tooltip hasArrow placement="right" label={token.percentageHint}>
              {token.percentage}
            </Tooltip>
          )}
        </Text>
        <Text fontSize="sm" color="subtle">
          Balance: 0
        </Text>
      </HStack>
    </Box>
  )

  const OperatorIcon = ({
    icon,
    onClick,
  }: {
    icon: ReactElement
    onClick?: false | (() => void)
  }) => (
    <Center
      w="44px"
      h="44px"
      my="-4"
      bg={useColorModeValue('gray.50', 'gray.800')}
      border="6px solid"
      borderRadius="xl"
      borderColor={useColorModeValue('white', 'gray.900')}
      cursor="pointer"
      sx={{
        position: 'relative',
        left: 'calc(50% - 1rem)',
      }}
      onClick={onClick || (() => {})}
    >
      {onClick ? (
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Mint Operator"
          icon={icon}
        />
      ) : (
        icon
      )}
    </Center>
  )

  return (
    <Container centerContent>
      <Box
        w={{ base: 'full', md: 'lg' }}
        mt="16"
        p="4"
        bg={useColorModeValue('white', 'gray.900')}
        boxShadow={useColorModeValue('lg', 'lg-dark')}
        borderRadius="3xl"
      >
        <HStack justify="space-between" p="2" pb="4">
          <Text fontSize="lg" fontWeight="500">
            {isMint ? 'Mint' : 'Burn'}
          </Text>
          <IconButton
            variant="ghost"
            aria-label="Setting"
            icon={<SettingsIcon />}
          ></IconButton>
        </HStack>

        <AmountInput token={isMint ? backingToken : usmToken}></AmountInput>
        <OperatorIcon
          icon={isMint ? <SmallAddIcon /> : <ArrowDownIcon />}
          onClick={!isMint && (() => setIsMint(true))}
        />
        <AmountInput token={isMint ? lionToken : backingToken}></AmountInput>
        <OperatorIcon
          icon={isMint ? <ArrowDownIcon /> : <SmallAddIcon />}
          onClick={isMint && (() => setIsMint(false))}
        />
        <AmountInput token={isMint ? usmToken : lionToken}></AmountInput>

        <Button w="full" size="xl" mt="8" borderRadius="xl"></Button>
      </Box>
    </Container>
  )
}
