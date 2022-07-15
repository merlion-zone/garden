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
import { Dec, Int, proto } from '@merlionzone/merlionjs'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDebounce, useDeepCompareEffect } from 'react-use'

import { AmountInput } from '@/components/AmountInput'
import { DecDisplay } from '@/components/NumberDisplay'
import config from '@/config'
import { useAccountAddress } from '@/hooks'
import {
  errors,
  useAccountCollateral,
  useAllCollateralParams,
  useAllCollateralPools,
  useBalance,
  useChainStatus,
  useDenomsMetadataMap,
  useDisplayPrice,
  useMakerParams,
  useTotalCollateral,
} from '@/hooks/query'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useSwapMintSettings } from '@/hooks/useSetting'
import { useToast } from '@/hooks/useToast'
import { SelectTokenModal } from '@/pages/backing/swap-mint/SelectTokenModal'
import { Settings } from '@/pages/backing/swap-mint/Settings'
import { InputKind } from '@/pages/backing/swap-mint/estimateSwapMint'
import { LtvSlider } from '@/pages/collateral/LtvSlider'
import { borrowOrRepay } from '@/pages/collateral/borrowOrRepay'
import { depositOrRedeem } from '@/pages/collateral/depositOrRedeem'
import { calculateActualLtv, calculateDebt } from '@/pages/collateral/estimate'
import { formatNumberSuitable } from '@/utils'

export default function Collateral() {
  const account = useAccountAddress()

  const { data: chainStatus } = useChainStatus()
  const { data: totalCollateral, mutate: mutateTotalCollateral } =
    useTotalCollateral()
  const { data: allCollateralParams } = useAllCollateralParams()
  const { data: allCollateralPools, mutate: mutateAllCollateralPools } =
    useAllCollateralPools()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()

  const [collateralDenom, setCollateralDenom] = useState<string | undefined>(
    undefined
  )
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

  const { data: accountCollateral, mutate: mutateAccountCollateral } =
    useAccountCollateral(account?.mer(), collateralDenom)

  const { data: collateralPrice } = useDisplayPrice(collateralDenom)
  const { data: lionPrice } = useDisplayPrice(config.denom)
  const { data: merPrice } = useDisplayPrice(config.merDenom)

  const { balance: collateralBalance, mutate: mutateCollateralBalance } =
    useBalance(account?.mer(), collateralDenom)
  const { balance: lionBalance, mutate: mutateLionBalance } = useBalance(
    account?.mer(),
    config.denom
  )
  const { balance: usmBalance, mutate: mutateUsmBalance } = useBalance(
    account?.mer(),
    config.merDenom
  )

  const collateralToken = useMemo(() => {
    return {
      metadata: denomsMetadataMap?.get(collateralDenom!),
      price: collateralPrice,
    }
  }, [denomsMetadataMap, collateralDenom, collateralPrice])

  const usmToken = useMemo(
    () => ({
      metadata: denomsMetadataMap?.get(config.merDenom),
      price: merPrice,
    }),
    [denomsMetadataMap, merPrice]
  )

  const [isDepositBorrow, setIsDepositBorrow] = useState(true)

  useRef()
  const { maxLoan } = useMemo(
    () =>
      calculateActualLtv({
        isDeposit: isDepositBorrow,
        collateralParams,
        collateralToken,
        accountCollateral,
        collateralPrice,
        lionPrice,
      }),
    [
      accountCollateral,
      collateralParams,
      collateralPrice,
      collateralToken,
      isDepositBorrow,
      lionPrice,
    ]
  )
  const { debt, interestPerMinute } = useMemo(
    () =>
      calculateDebt({
        collateralParams,
        accountCollateral,
        latestBlockHeight: chainStatus?.syncInfo.latestBlockHeight,
      }),
    [accountCollateral, chainStatus, collateralParams]
  )

  const [poolDisabled, setPoolDisabled] = useState(false)
  const [depositDisabled, setDepositDisabled] = useState(false)
  const [borrowDisabled, setBorrowDisabled] = useState(false)
  const [sendDepositEnabled, setSendDepositEnabled] = useState(false)
  const [sendBorrowEnabled, setSendBorrowEnabled] = useState(false)
  const [sendDepositTitle, setSendDepositTitle] = useState<string>('')
  const [sendBorrowTitle, setSendBorrowTitle] = useState<string>('')
  const setInitialDepositTitle = useCallback(() => {
    setSendDepositTitle(isDepositBorrow ? 'Deposit' : 'Redeem')
  }, [isDepositBorrow])
  const setInitialBorrowTitle = useCallback(() => {
    setSendBorrowTitle(isDepositBorrow ? 'Borrow' : 'Repay')
  }, [isDepositBorrow])

  const [collateralAmt, setCollateralAmt] = useState('')
  const [lionAmt, setLionAmt] = useState('')
  const [usmAmt, setUsmAmt] = useState('')
  const [feeAmt, setFeeAmt] = useState('')

  const [inputKind, setInputKind] = useState<InputKind>(InputKind.None)
  const [estimated, setEstimated] = useState(false)

  const { sendTx, isSendReady } = useSendCosmTx()
  const { expertMode, slippageTolerance } = useSwapMintSettings()
  const toast = useToast()

  // initial states
  useEffect(() => {
    setPoolDisabled(false)
    setDepositDisabled(false)
    setBorrowDisabled(false)
    setSendDepositEnabled(false)
    setSendBorrowEnabled(false)
    setInitialDepositTitle()
    setInitialBorrowTitle()

    setCollateralAmt('')
    setLionAmt('')
    setUsmAmt('')
    setFeeAmt('')

    setEstimated(false)
  }, [isDepositBorrow, setInitialDepositTitle, setInitialBorrowTitle])

  // check availability
  useDeepCompareEffect(() => {
    const params = allCollateralParams?.find(
      (params) => params.collateralDenom === collateralDenom
    )
    // check collateral pool availability
    if (params && !params.enabled) {
      setPoolDisabled(true)
      setSendDepositEnabled(false)
      setSendBorrowEnabled(false)
      setSendDepositTitle(errors.collateralDisabled)
      setSendBorrowTitle(errors.collateralDisabled)
      return
    }

    if (isDepositBorrow) {
      // check borrow
      if (debt.greaterThanOrEqualTo(maxLoan)) {
        setBorrowDisabled(true)
        setSendBorrowEnabled(false)
        setSendBorrowTitle(errors.noUsmLoanable)
      } else {
        setBorrowDisabled(false)
        setInitialBorrowTitle()
      }
    } else {
      // check redeem
      if (!maxLoan.greaterThan(0) || debt.greaterThanOrEqualTo(maxLoan)) {
        setDepositDisabled(true)
        setSendDepositEnabled(false)
        setSendDepositTitle(errors.noCollateralRedeemable)
      } else {
        setDepositDisabled(false)
        setInitialDepositTitle()
      }
      // check repay
      if (!debt.greaterThan(0)) {
        setBorrowDisabled(true)
        setSendBorrowEnabled(false)
        setSendBorrowTitle(errors.noUsmDebt)
      } else {
        setBorrowDisabled(false)
        setInitialBorrowTitle()
      }
    }
  }, [
    allCollateralParams,
    collateralDenom,
    debt,
    isDepositBorrow,
    maxLoan,
    setInitialBorrowTitle,
    setInitialDepositTitle,
  ])

  const onInput = useCallback(
    (name: string, value: string) => {
      switch (name) {
        case collateralToken.metadata?.base:
          setInputKind(InputKind.Collateral)
          setCollateralAmt(value)
          setLionAmt('') // it's ok
          break
        case config.denom:
          setInputKind(InputKind.Lion)
          setLionAmt(value)
          break
        case config.merDenom:
          setInputKind(InputKind.Usm)
          setUsmAmt(value)
          break
      }
    },
    [collateralToken]
  )

  // estimate deposit/redeem
  useDebounce(
    () => {
      if (
        poolDisabled ||
        !collateralToken.metadata ||
        !collateralPool?.collateral ||
        !collateralParams
      ) {
        return
      }
      if (inputKind === InputKind.None) {
        return
      }
      setInputKind(InputKind.None)

      const collateralAmount = new Dec(collateralAmt)
        .mulPow(collateralToken.metadata.displayExponent)
        .toInt()
      const lionAmount = new Dec(lionAmt).mulPow(config.denomDecimals).toInt()
      if (!collateralAmount.greaterThan(0) && !lionAmount.greaterThan(0)) {
        setSendDepositEnabled(false)
        setInitialDepositTitle()
        return
      }

      if (isDepositBorrow) {
        // estimate deposit
        if (
          collateralAmount
            .add(collateralPool.collateral.amount)
            .greaterThan(collateralParams.maxCollateral)
        ) {
          setSendDepositEnabled(false)
          setSendDepositTitle(errors.collateralInsufficientQuota)
          return
        }
        if (collateralAmount.greaterThan(collateralBalance || 0)) {
          setSendDepositEnabled(false)
          setSendDepositTitle(errors.collateralInsufficientBalance)
          return
        }
        if (lionAmount.greaterThan(lionBalance || 0)) {
          setSendDepositEnabled(false)
          setSendDepositTitle(errors.lionInsufficientBalance)
          return
        }
      } else {
        // estimate redeem
        const { ltv, error } = calculateActualLtv({
          isDeposit: isDepositBorrow,
          collateralParams,
          collateralToken,
          accountCollateral,
          collateralPrice,
          lionPrice,
          collateralAmt,
          lionAmt,
        })
        if (
          error ||
          new Dec(collateralPool.collateral.amount)
            .sub(collateralAmount)
            .mul(ltv)
            .lessThan(debt)
        ) {
          setSendDepositEnabled(false)
          setSendDepositTitle(errors.exceedsCollateralRedeemable)
          return
        }
      }

      setSendDepositEnabled(true)
      setInitialDepositTitle()
    },
    1000,
    [
      collateralAmt,
      lionAmt,
      collateralParams,
      collateralPool,
      collateralToken,
      poolDisabled,
      setInitialDepositTitle,
      inputKind,
      isDepositBorrow,
      collateralBalance,
      lionBalance,
      accountCollateral,
      collateralPrice,
      lionPrice,
      debt,
    ]
  )

  // estimate borrow/repay
  useDebounce(
    () => {
      if (
        poolDisabled ||
        !chainStatus ||
        !accountCollateral ||
        !collateralParams
      ) {
        return
      }
      if (inputKind === InputKind.None) {
        return
      }
      setInputKind(InputKind.None)

      const usmAmount = new Dec(usmAmt).mulPow(config.merDenomDecimals).toInt()
      if (isDepositBorrow) {
        // estimate borrow
        const feeRatio = Dec.fromProto(collateralParams.mintFee)
        const feeAmount = usmAmount.mul(feeRatio)
        if (
          collateralParams.maxMerMint &&
          usmAmount
            .add(feeAmount)
            .add(collateralPool?.merDebt?.amount || 0)
            .greaterThan(collateralParams.maxMerMint)
        ) {
          setSendBorrowEnabled(false)
          setSendBorrowTitle(errors.usmInsufficientQuota)
        } else {
          setSendBorrowEnabled(true)
          setInitialBorrowTitle()
          if (
            usmAmount
              .add(feeAmount)
              .add(debt)
              .add(interestPerMinute)
              .greaterThan(maxLoan)
          ) {
            const usmAvailable = maxLoan
              .sub(debt)
              .sub(interestPerMinute)
              .div(feeRatio.add(1))
              .divPow(config.merDenomDecimals)
            if (usmAvailable.greaterThan(0)) {
              setUsmAmt(usmAvailable.toString())
            } else {
              setUsmAmt('')
            }
          }
        }
      } else {
        // estimate repay
        if (usmAmount.greaterThan(usmBalance || 0)) {
          setSendBorrowEnabled(false)
          setSendBorrowTitle(errors.usmInsufficientBalance)
        } else {
          setSendBorrowEnabled(true)
          setInitialBorrowTitle()
          if (usmAmount.greaterThan(debt.add(interestPerMinute))) {
            let repayMax = new Dec(debt.add(interestPerMinute))
            if (repayMax.greaterThan(usmBalance || 0)) {
              repayMax = new Dec(usmBalance)
            }
            setUsmAmt(repayMax.divPow(config.merDenomDecimals).toString())
          }
        }
      }
    },
    1000,
    [
      accountCollateral,
      chainStatus,
      collateralParams,
      collateralPool,
      debt,
      interestPerMinute,
      inputKind,
      isDepositBorrow,
      maxLoan,
      poolDisabled,
      setInitialBorrowTitle,
      usmAmt,
      usmBalance,
    ]
  )

  const onReceipt = useCallback(() => {
    setCollateralAmt('')
    setLionAmt('')
    setUsmAmt('')

    mutateTotalCollateral()
    mutateAllCollateralPools()
    mutateAccountCollateral()
    mutateCollateralBalance()
    mutateLionBalance()
    mutateUsmBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // on deposit/redeem tx submit
  const onDepositRedeemSubmit = useCallback(() => {
    if (!account) {
      return
    }
    depositOrRedeem({
      isDeposit: isDepositBorrow,
      account: account.mer(),
      collateralToken,
      collateralAmt,
      lionAmt,
      sendTx,
      toast,
      onReceipt,
    })
  }, [
    account,
    collateralAmt,
    collateralToken,
    isDepositBorrow,
    lionAmt,
    onReceipt,
    sendTx,
    toast,
  ])

  // on borrow/repay tx submit
  const onBorrowRepaySubmit = useCallback(() => {
    if (!account || !collateralDenom) {
      return
    }
    borrowOrRepay({
      isBorrow: isDepositBorrow,
      account: account.mer(),
      collateralDenom,
      usmAmt,
      sendTx,
      toast,
      onReceipt,
    })
  }, [
    account,
    collateralDenom,
    isDepositBorrow,
    onReceipt,
    sendTx,
    toast,
    usmAmt,
  ])

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
                        accountCollateral?.collateral?.amount || 0,
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
                        accountCollateral?.lionCollateralized?.amount || 0,
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
                        accountCollateral?.merDebt?.amount || 0,
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
                  onInput={onInput}
                  isDisabled={poolDisabled || depositDisabled}
                ></AmountInput>

                <LtvSlider
                  isDeposit={isDepositBorrow}
                  isDisabled={poolDisabled || depositDisabled}
                  collateralParams={collateralParams}
                  collateralToken={collateralToken}
                  accountCollateral={accountCollateral}
                  collateralPrice={collateralPrice}
                  lionPrice={lionPrice}
                  lionBalance={new Dec(lionBalance).divPow(
                    config.denomDecimals
                  )}
                  collateralAmt={collateralAmt}
                  lionAmt={lionAmt}
                  onInput={onInput}
                />

                <Button
                  w="full"
                  size="xl"
                  mt="4"
                  borderRadius="2xl"
                  fontSize="xl"
                  isDisabled={!sendDepositEnabled || !isSendReady}
                  isLoading={!isSendReady}
                  loadingText="Waiting for transaction completed"
                  onClick={() => {
                    expertMode ? onDepositRedeemSubmit() : onConfirmModalOpen()
                  }}
                >
                  {sendDepositTitle}
                </Button>
              </Box>

              <Divider />

              <Box>
                <AmountInput
                  token={usmToken}
                  value={usmAmt}
                  hoverBorder
                  onInput={onInput}
                  isDisabled={poolDisabled || borrowDisabled}
                  noMaxButton={isDepositBorrow}
                ></AmountInput>

                <Button
                  w="full"
                  size="xl"
                  mt="6"
                  borderRadius="2xl"
                  fontSize="xl"
                  isDisabled={!sendBorrowEnabled || !isSendReady}
                  isLoading={!isSendReady}
                  loadingText="Waiting for transaction completed"
                  onClick={() => {
                    expertMode ? onBorrowRepaySubmit() : onConfirmModalOpen()
                  }}
                >
                  {sendBorrowTitle}
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
