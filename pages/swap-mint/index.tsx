import {
  Box,
  Button,
  Center,
  Container,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import Avvvatars from 'avvvatars-react'
import {
  ArrowDownIcon,
  ChevronDownIcon,
  SettingsIcon,
  SmallAddIcon,
} from '@chakra-ui/icons'
import React, { ReactElement, useMemo, useState } from 'react'
import {
  DenomMetadata,
  useAllBackingParams,
  useAllBackingPools,
  useBackingRatio,
  useBalances,
  useBalancesMap,
  useCoinPrice,
  useDenomsMetadataMap,
  useLionPrice,
  useMerPrice,
} from '@/hooks/query'
import { shortenDenom } from '@/utils'
import { useAccountAddress } from '@/hooks'
import { AmountDisplay, DecDisplay } from '@/components/NumberDisplay'
import { Dec } from '@merlionzone/merlionjs'
import config from '@/config'

interface TokenAmount {
  metadata?: DenomMetadata
  selectable?: boolean
  proportion?: string
  proportionHint?: string
}

interface AmountInputProps {
  token: TokenAmount
  onSelectToken?: false | (() => void)
}

const AmountInput = ({ token, onSelectToken }: AmountInputProps) => {
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

interface SelectTokenModalProps {
  isOpen: boolean

  onClose(): void

  onSelect(denom: string): void
}

const SelectTokenModal = ({
  isOpen,
  onClose,
  onSelect,
}: SelectTokenModalProps) => {
  const account = useAccountAddress()
  const { data: allBackingPools } = useAllBackingPools()
  const { data: allBackingParams } = useAllBackingParams()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()
  const { data: balances } = useBalancesMap(account?.mer() || '')

  const hoverRowBg = useColorModeValue('gray.50', 'gray.900')

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="bg-surface" maxW="lg">
        <ModalHeader>Select a backing token</ModalHeader>
        <ModalCloseButton />
        <ModalBody mb="4">
          <Box
            maxH="lg"
            borderRadius="lg"
            border="1px"
            borderColor={useColorModeValue('gray.300', 'gray.700')}
            overflowY="auto"
          >
            {allBackingParams?.map((params) => {
              return (
                <HStack
                  key={params.backingDenom}
                  cursor="pointer"
                  _hover={{ bg: hoverRowBg }}
                  py="2"
                  px="4"
                  justify="space-between"
                  onClick={() => {
                    onClose()
                    onSelect(params.backingDenom)
                  }}
                >
                  <HStack>
                    <Avvvatars value={params.backingDenom} style="shape" />
                    <Box>
                      <Text>
                        {denomsMetadataMap?.get(params.backingDenom)?.symbol}
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        {shortenDenom(params.backingDenom)}
                      </Text>
                    </Box>
                  </HStack>
                  <AmountDisplay
                    value={balances.get(params.backingDenom) || 0}
                    decimals={
                      denomsMetadataMap?.get(params.backingDenom)
                        ?.displayExponent
                    }
                  />
                </HStack>
              )
            })}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default function SwapMint() {
  const { data: allBackingParams } = useAllBackingParams()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()
  const { data: backingRatio } = useBackingRatio()

  const backingRatioDec =
    backingRatio && Dec.fromProto(backingRatio.backingRatio).mul(100)

  const [backingDenom, setBackingDenom] = useState('')

  const backingToken = useMemo(() => {
    const denom = backingDenom || allBackingParams?.[0].backingDenom || ''
    return {
      metadata: denomsMetadataMap?.get(denom),
      selectable: true,
      proportion: backingRatioDec && `${backingRatioDec}%`,
      proportionHint: 'Current system backing ratio (BR)',
    }
  }, [denomsMetadataMap, allBackingParams, backingDenom, backingRatioDec])

  const lionToken = useMemo(
    () => ({
      metadata: denomsMetadataMap?.get(config.denom),
      proportion:
        backingRatioDec && new Dec(100).sub(backingRatioDec).toString(),
      proportionHint: '= 100% - BR',
    }),
    [denomsMetadataMap, backingRatioDec]
  )
  const usmToken = useMemo(
    () => ({
      metadata: denomsMetadataMap?.get(config.merDenom),
    }),
    [denomsMetadataMap]
  )

  const { price: backingPrice } = useCoinPrice(
    // TODO
    backingToken.metadata?.base as string
  )
  const { price: lionPrice } = useLionPrice()
  const { price: merPrice } = useMerPrice()

  const [isMint, setIsMint] = useState(true)

  const {
    isOpen: isSelectTokenModalOpen,
    onOpen: onSelectTokenModalOpen,
    onClose: onSelectTokenModalClose,
  } = useDisclosure()

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

        <AmountInput
          token={isMint ? backingToken : usmToken}
          onSelectToken={isMint && onSelectTokenModalOpen}
        ></AmountInput>
        <OperatorIcon
          icon={isMint ? <SmallAddIcon /> : <ArrowDownIcon />}
          onClick={!isMint && (() => setIsMint(true))}
        />
        <AmountInput
          token={isMint ? lionToken : backingToken}
          onSelectToken={!isMint && onSelectTokenModalOpen}
        ></AmountInput>
        <OperatorIcon
          icon={isMint ? <ArrowDownIcon /> : <SmallAddIcon />}
          onClick={isMint && (() => setIsMint(false))}
        />
        <AmountInput token={isMint ? usmToken : lionToken}></AmountInput>

        <Button w="full" size="xl" mt="8" borderRadius="xl"></Button>
      </Box>

      <SelectTokenModal
        isOpen={isSelectTokenModalOpen}
        onClose={onSelectTokenModalClose}
        onSelect={(denom) => {
          setBackingDenom(denom)
        }}
      />
    </Container>
  )
}
