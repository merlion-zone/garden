import { SettingsIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Container,
  Divider,
  HStack,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { Dec, proto } from '@merlionzone/merlionjs'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { AmountInput } from '@/components/AmountInput'
import { DecDisplay } from '@/components/NumberDisplay'
import config from '@/config'
import { useAccountAddress } from '@/hooks'
import {
  useAccountCollateral,
  useAllBackingParams,
  useAllBackingPools,
  useAllCollateralParams,
  useAllCollateralPools,
  useBalance,
  useDenomsMetadataMap,
  useDisplayPrice,
  useMakerParams,
  useTotalBacking,
  useTotalCollateral,
} from '@/hooks/query'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useSwapMintSettings } from '@/hooks/useSetting'
import { useToast } from '@/hooks/useToast'
import { SelectTokenModal } from '@/pages/backing/swap-mint/SelectTokenModal'
import { Settings } from '@/pages/backing/swap-mint/Settings'
import { InputKind } from '@/pages/backing/swap-mint/estimateSwapMint'
import { LtvSlider } from '@/pages/collateral/LtvSlider'
import { formatNumberSuitable } from '@/utils'

export default function Collateral() {
  const account = useAccountAddress()

  const { data: makerParams } = useMakerParams()
  const { data: totalCollateral, mutate: mutateTotalCollateral } =
    useTotalCollateral()
  const { data: allCollateralParams } = useAllCollateralParams()
  const { data: allCollateralPools, mutate: mutateAllCollateralPools } =
    useAllCollateralPools()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()

  const [collateralDenom, setCollateralDenom] = useState('')
  const [collateralParams, setCollateralParams] = useState<
    proto.maker.CollateralRiskParams | undefined
  >(undefined)
  const [collateralPool, setCollateralPool] = useState<
    proto.maker.PoolCollateral | undefined
  >(undefined)
  useEffect(() => {
    if (allCollateralParams?.length) {
      setCollateralDenom(allCollateralParams[0].collateralDenom)
    }
  }, [allCollateralParams])
  useEffect(() => {
    const params = allCollateralParams?.find(
      (params) => params.collateralDenom === collateralDenom
    )
    const pool = allCollateralPools?.find(
      (params) => params.collateral?.denom === collateralDenom
    )
    setCollateralParams(params)
    setCollateralPool(pool)
  }, [collateralDenom, allCollateralParams, allCollateralPools])

  const { data: accountCollateral } = useAccountCollateral(
    account?.mer(),
    collateralDenom
  )

  const { data: collateralPrice } = useDisplayPrice(collateralDenom)
  const { data: lionPrice } = useDisplayPrice(config.denom)
  const { data: merPrice } = useDisplayPrice(config.merDenom)

  const { balance: collateralBalance, mutate: mutateCollateralBalance } =
    useBalance(account?.mer(), collateralDenom)
  const { balance: lionBalance, mutate: mutateLionBalance } = useBalance(
    account?.mer(),
    config.denom
  )

  const [isDepositBorrow, setIsDepositBorrow] = useState(true)

  const collateralToken = useMemo(() => {
    return {
      metadata: denomsMetadataMap?.get(collateralDenom),
      price: collateralPrice,
    }
  }, [denomsMetadataMap, collateralDenom, collateralPrice])

  const lionToken = useMemo(
    () => ({
      metadata: denomsMetadataMap?.get(config.denom),
      price: lionPrice,
    }),
    [denomsMetadataMap, lionPrice]
  )

  const usmToken = useMemo(
    () => ({
      metadata: denomsMetadataMap?.get(config.merDenom),
      price: merPrice,
    }),
    [denomsMetadataMap, merPrice]
  )

  const [disabled, setDisabled] = useState(false)
  const [sendEnabled, setSendEnabled] = useState(false)
  const [sendTitle, setSendTitle] = useState<string | null>('Enter an amount')

  const { sendTx, isSendReady } = useSendCosmTx()
  const { expertMode, slippageTolerance } = useSwapMintSettings()
  const toast = useToast()

  const [collateralAmt, setCollateralAmt] = useState('')
  const [lionAmt, setLionAmt] = useState('')
  const [usmAmt, setUsmAmt] = useState('')

  const [inputKind, setInputKind] = useState<InputKind>(InputKind.None)
  const [estimated, setEstimated] = useState(false)

  const onDepositInput = useCallback(() => {}, [])

  const onBorrowInput = useCallback(() => {}, [])

  // on deposit/redeem tx submit
  const onDepositSubmit = useCallback(() => {}, [])

  // on borrow/repay tx submit
  const onBorrowSubmit = useCallback(() => {}, [])

  const {
    isOpen: isSelectTokenModalOpen,
    onOpen: onSelectTokenModalOpen,
    onClose: onSelectTokenModalClose,
  } = useDisclosure()
  const {
    isOpen: isConfirmModalOpen,
    onOpen: onConfirmModalOpen,
    onClose: onConfirmModalClose,
  } = useDisclosure()

  const centerTitle = useBreakpointValue({ base: false, md: true })

  return (
    <Container centerContent>
      <Box
        w={{ base: 'full', md: '4xl' }}
        m="16"
        p="4"
        bg={useColorModeValue('white', 'gray.900')}
        boxShadow={useColorModeValue('lg', 'lg-dark')}
        borderRadius="3xl"
      >
        <HStack justify="space-between" pt="2" pb="4">
          {centerTitle && <Box></Box>}
          <Button
            variant="ghost"
            fontSize="lg"
            fontWeight="bold"
            onClick={() => setIsDepositBorrow(!isDepositBorrow)}
          >
            {isDepositBorrow ? 'Deposit & Borrow' : 'Redeem & Repay'}
          </Button>
          {!centerTitle && <Box></Box>}
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <IconButton
                variant="ghost"
                aria-label="Setting"
                icon={<SettingsIcon />}
              ></IconButton>
            </PopoverTrigger>
            <Portal>
              <PopoverContent>
                <PopoverBody>
                  <Settings />
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </Popover>
        </HStack>

        <Divider />

        <Stack spacing={{ base: '5', lg: '6' }} my="8">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="20">
            <Stack spacing="16" mx="4">
              <Stack>
                <Text fontSize="lg">
                  Your {collateralToken.metadata?.symbol} Position
                </Text>
                <Stack fontSize="sm" ps="4">
                  <HStack justify="space-between">
                    <Text>Collateral Deposit:</Text>
                    <Text>
                      {formatNumberSuitable(
                        accountCollateral?.collateral?.amount,
                        collateralToken.metadata?.displayExponent
                      )}
                      &nbsp;
                      {collateralToken.metadata?.symbol}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Catalytic LION:</Text>
                    <Text>
                      {formatNumberSuitable(
                        accountCollateral?.lionCollateralized?.amount,
                        config.denomDecimals
                      )}
                      &nbsp;
                      {config.displayDenom}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>USM Debt:</Text>
                    <Text>
                      {formatNumberSuitable(
                        accountCollateral?.merDebt?.amount,
                        config.merDenomDecimals
                      )}
                      &nbsp;
                      {config.merDisplayDenom}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Health Factor:</Text>
                    <Text>0</Text>
                  </HStack>
                </Stack>
              </Stack>

              <Stack>
                <Text fontSize="lg">
                  {collateralToken.metadata?.symbol} Collateral Pool
                </Text>
                <Stack fontSize="sm" ps="4">
                  <HStack justify="space-between">
                    <Text>Basic Collateral Ratio:</Text>
                    <Text>
                      <DecDisplay
                        value={collateralParams?.basicLoanToValue}
                        percentage
                      />
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Premium Collateral Ratio:</Text>
                    <Text>
                      <DecDisplay
                        value={collateralParams?.loanToValue}
                        percentage
                      />
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Catalytic LION Ratio:</Text>
                    <Text>
                      <DecDisplay
                        value={collateralParams?.catalyticLionRatio}
                        percentage
                      />
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Borrow Fee:</Text>
                    <Text>
                      <DecDisplay
                        value={collateralParams?.mintFee}
                        percentage
                      />
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Interest APY:</Text>
                    <Text>
                      <DecDisplay
                        value={collateralParams?.interestFee}
                        percentage
                      />
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Liquidation Fee:</Text>
                    <Text>
                      <DecDisplay
                        value={collateralParams?.liquidationFee}
                        percentage
                      />
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Liquidation Threshold:</Text>
                    <Text>
                      <DecDisplay
                        value={collateralParams?.liquidationThreshold}
                        percentage
                      />
                    </Text>
                  </HStack>
                </Stack>
              </Stack>
            </Stack>

            <Stack spacing="8">
              <Box>
                <AmountInput
                  token={collateralToken}
                  value={collateralAmt}
                  onSelectToken={onSelectTokenModalOpen}
                  hoverBorder
                  onInput={onDepositInput}
                  isDisabled={disabled}
                ></AmountInput>

                <LtvSlider
                  collateralParams={collateralParams}
                  accountCollateral={accountCollateral}
                  collateralPrice={collateralPrice}
                  lionPrice={lionPrice}
                  collateralBalance={new Dec(collateralBalance).divPow(collateralToken.metadata?.displayExponent || 0)}
                  lionBalance={new Dec(lionBalance).divPow(config.denomDecimals)}
                  collateral={new Dec(accountCollateral?.collateral?.amount).divPow(collateralToken.metadata?.displayExponent || 0)}
                  value={lionAmt}
                  onChange={setLionAmt}
                />

                <Button
                  w="full"
                  size="xl"
                  mt="4"
                  borderRadius="2xl"
                  fontSize="xl"
                  isDisabled={!sendEnabled || !isSendReady}
                  isLoading={!isSendReady}
                  loadingText="Waiting for transaction completed"
                  onClick={() => {
                    expertMode ? onDepositSubmit() : onConfirmModalOpen()
                  }}
                >
                  {sendTitle}
                </Button>
              </Box>

              <Divider />

              <Box>
                <AmountInput
                  token={usmToken}
                  value={usmAmt}
                  hoverBorder
                  onInput={onBorrowInput}
                  isDisabled={disabled}
                ></AmountInput>

                <Button
                  w="full"
                  size="xl"
                  mt="6"
                  borderRadius="2xl"
                  fontSize="xl"
                  isDisabled={!sendEnabled || !isSendReady}
                  isLoading={!isSendReady}
                  loadingText="Waiting for transaction completed"
                  onClick={() => {
                    expertMode ? onBorrowSubmit() : onConfirmModalOpen()
                  }}
                >
                  {sendTitle}
                </Button>
              </Box>
            </Stack>
          </SimpleGrid>
        </Stack>
      </Box>

      <SelectTokenModal
        isOpen={isSelectTokenModalOpen}
        onClose={onSelectTokenModalClose}
        onSelect={(denom) => {
          setCollateralDenom(denom)
          setInputKind(InputKind.Collateral)
        }}
      />
    </Container>
  )
}
