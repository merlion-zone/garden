import {
  Icon,
  Text,
  Box,
  Button,
  Container,
  HStack,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  SimpleGrid,
  Stack,
  useColorModeValue,
  useDisclosure,
  Divider,
  useBreakpointValue,
} from '@chakra-ui/react'
import { ArrowDownIcon, SettingsIcon } from '@chakra-ui/icons'
import { Settings } from '@/pages/backing/swap-mint/Settings'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccountAddress } from '@/hooks'
import {
  errors,
  useAllBackingParams,
  useAllBackingPools,
  useBackingRatio,
  useBalance,
  useDenomsMetadataMap,
  useDisplayPrice,
  useMakerParams,
  useTotalBacking,
} from '@/hooks/query'
import {
  Coin,
  Dec,
  MsgBuyBackingEncodeObject,
  MsgSellBackingEncodeObject,
  typeUrls,
} from '@merlionzone/merlionjs'
import config from '@/config'
import { AmountInput } from '@/components/AmountInput'
import { OperatorIcon } from '@/pages/backing/swap-mint/OperatorIcon'
import { InputKind } from '@/pages/backing/swap-mint/estimateSwapMint'
import { SelectTokenModal } from '@/pages/backing/swap-mint/SelectTokenModal'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useSwapMintSettings } from '@/hooks/useSetting'
import { useToast } from '@/hooks/useToast'
import { useDebounce } from 'react-use'
import { proto } from '@merlionzone/merlionjs'
import { EncodeObject } from '@cosmjs/proto-signing'
import { TransactionToast } from '@/components/TransactionToast'
import { Explain } from './Explain'
import { ConfirmModal } from './ConfirmModal'
import { formatNumberSuitable } from '@/utils'
import { FaGift } from 'react-icons/fa'
import { estimateBuybackReback } from '@/pages/backing/buyback-reback/estimateBuybackReback'
import { Navbar } from '@/pages/backing/Navbar'
import { useRouter } from 'next/router'

export default function BuybackReback() {
  const router = useRouter()
  const account = useAccountAddress()

  const { data: makerParams } = useMakerParams()
  const { data: totalBacking, mutate: mutateTotalBacking } = useTotalBacking()
  const { data: allBackingParams } = useAllBackingParams()
  const { data: allBackingPools, mutate: mutateAllBackingPools } =
    useAllBackingPools()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()
  const { data: backingRatio } = useBackingRatio()

  const [backingDenom, setBackingDenom] = useState('')
  const [backingParams, setBackingParams] = useState<
    proto.maker.BackingRiskParams | undefined
  >(undefined)
  const [backingPool, setBackingPool] = useState<
    proto.maker.PoolBacking | undefined
  >(undefined)
  useEffect(() => {
    if (allBackingParams?.length) {
      setBackingDenom(allBackingParams[0].backingDenom)
    }
  }, [allBackingParams])
  useEffect(() => {
    const params = allBackingParams?.find(
      (params) => params.backingDenom === backingDenom
    )
    const pool = allBackingPools?.find(
      (params) => params.backing?.denom === backingDenom
    )
    setBackingParams(params)
    setBackingPool(pool)
  }, [backingDenom, allBackingParams, allBackingPools])

  const { data: backingPrice } = useDisplayPrice(backingDenom)
  const { data: lionPrice } = useDisplayPrice(config.denom)

  const { balance: backingBalance, mutate: mutateBackingBalance } = useBalance(
    account?.mer(),
    backingDenom
  )
  const { balance: lionBalance, mutate: mutateLionBalance } = useBalance(
    account?.mer(),
    config.denom
  )

  const [isBuyback, setIsBuyback] = useState(true)

  const [disabled, setDisabled] = useState(false)
  const [sendEnabled, setSendEnabled] = useState(false)
  const [sendTitle, setSendTitle] = useState<string | null>('Enter an amount')

  const [backingAmt, setBackingAmt] = useState('')
  const [lionAmt, setLionAmt] = useState('')
  const [feeAmt, setFeeAmt] = useState('')

  const [inputKind, setInputKind] = useState<InputKind>(InputKind.None)
  const [estimated, setEstimated] = useState(false)

  const { sendTx, isSendReady } = useSendCosmTx()
  const { expertMode, slippageTolerance } = useSwapMintSettings()
  const toast = useToast()

  const backingToken = useMemo(() => {
    return {
      metadata: denomsMetadataMap?.get(backingDenom),
      price: backingPrice,
    }
  }, [denomsMetadataMap, backingDenom, backingPrice])

  const lionToken = useMemo(
    () => ({
      metadata: denomsMetadataMap?.get(config.denom),
      price: lionPrice,
    }),
    [denomsMetadataMap, lionPrice]
  )

  const excessBackingValue = useMemo(() => {
    const totalBackingValue = new Dec(totalBacking?.backingValue)
    const requiredBackingValue = new Dec(totalBacking?.merMinted?.amount).mul(
      backingRatio?.backingRatio || 0
    )
    // in $USD and truncated to integer
    return new Dec(
      totalBackingValue
        .sub(requiredBackingValue)
        .divPow(6) // uUSD -> USD
        .truncated()
    ) // truncated
  }, [backingRatio, totalBacking])

  const [excessValueAvailable, excessAvailable] = useMemo(() => {
    const excessValueAvailable = isBuyback
      ? excessBackingValue.greaterThan(0)
        ? excessBackingValue
        : new Dec(0)
      : excessBackingValue.lessThan(0)
      ? new Dec(excessBackingValue.neg())
      : new Dec(0)
    const excessAvailable = excessValueAvailable.div(backingPrice || 1)
    return [excessValueAvailable, excessAvailable]
  }, [backingPrice, excessBackingValue, isBuyback])

  // initial states
  useEffect(() => {
    setEstimated(false)
    setDisabled(false)
    setSendTitle('Enter an amount')

    setTimeout(() => {
      setBackingAmt('')
      setLionAmt('')
      setSendEnabled(false)
    }, 500)
  }, [isBuyback])

  // check buyback/reback availability
  useEffect(() => {
    const params = allBackingParams?.find(
      (params) => params.backingDenom === backingDenom
    )
    if (params && !params.enabled) {
      setDisabled(true)
      setSendEnabled(false)
      setSendTitle(errors.backingDisabled)
      return
    }
    if (isBuyback && !excessBackingValue.greaterThan(0)) {
      setDisabled(true)
      setSendEnabled(false)
      setSendTitle(errors.noExcessBackingValue)
    } else if (!isBuyback && !excessBackingValue.lessThan(0)) {
      setDisabled(true)
      setSendEnabled(false)
      setSendTitle(errors.noLackingBackingValue)
    }
  }, [allBackingParams, backingDenom, excessBackingValue, isBuyback])

  const onInput = useCallback(
    (name: string, value: string) => {
      switch (name) {
        case backingToken.metadata?.base:
          setInputKind(InputKind.Backing)
          setBackingAmt(value)
          break
        case config.denom:
          setInputKind(InputKind.Lion)
          setLionAmt(value)
          break
      }
    },
    [backingToken]
  )

  // estimate
  useDebounce(
    () => {
      if (disabled) {
        return
      }
      if (
        !(
          makerParams &&
          backingParams &&
          backingToken.metadata &&
          lionToken.metadata &&
          backingPrice &&
          lionPrice
        )
      ) {
        return
      }
      if (inputKind === InputKind.None) {
        return
      }

      const { resolvedBackingAmt, resolvedLionAmt, resolvedFeeAmt, estimated } =
        estimateBuybackReback({
          isBuyback,
          inputKind,
          makerParams,
          backingParams,
          excessBackingValue,
          backingPrice,
          lionPrice,
          backingAmt,
          lionAmt,
        })

      setBackingAmt(resolvedBackingAmt.toString())
      setLionAmt(resolvedLionAmt.toString())
      setFeeAmt(resolvedFeeAmt.toString())

      if (estimated) {
        setEstimated(true)
        setSendTitle(isBuyback ? 'Swap Buyback' : 'Swap Reback')
        setSendEnabled(true)
      } else {
        setEstimated(false)
        setSendTitle('Enter an amount')
        setSendEnabled(false)
        return
      }

      if (isBuyback) {
        if (
          new Dec(resolvedLionAmt || 0).greaterThan(
            new Dec(lionBalance || 0).divPow(
              lionToken.metadata!.displayExponent
            )
          )
        ) {
          setSendEnabled(false)
          setSendTitle(errors.lionInsufficientBalance)
        }
      } else {
        if (
          new Dec(resolvedBackingAmt || 0).greaterThan(
            new Dec(backingBalance || 0).divPow(
              backingToken.metadata!.displayExponent
            )
          )
        ) {
          setSendEnabled(false)
          setSendTitle(errors.backingInsufficientBalance)
        }
      }

      setInputKind(InputKind.None)
    },
    1000,
    [
      backingAmt,
      backingBalance,
      backingParams,
      backingPrice,
      backingToken,
      disabled,
      excessBackingValue,
      inputKind,
      isBuyback,
      lionAmt,
      lionBalance,
      lionPrice,
      lionToken,
      makerParams,
    ]
  )

  // on tx submit
  const onSubmit = useCallback(() => {
    if (!account || !backingToken.metadata) {
      return
    }

    const tolerance = new Dec(1).sub(slippageTolerance)

    let msg: EncodeObject
    let title = ''
    if (isBuyback) {
      const msgBuyBacking: MsgBuyBackingEncodeObject = {
        typeUrl: typeUrls.MsgBuyBacking,
        value: {
          sender: account.mer(),
          to: '',
          lionIn: new Coin(
            config.denom,
            new Dec(lionAmt).mulPow(config.denomDecimals).toInt()
          ).toProto(),
          backingOutMin: new Coin(
            backingToken.metadata.base,
            new Dec(backingAmt)
              .mul(tolerance)
              .mulPow(backingToken.metadata.displayExponent)
              .toInt()
          ).toProto(),
        },
      }
      msg = msgBuyBacking
      title = `Swap ${lionAmt} ${config.displayDenom} for ${backingAmt} ${backingToken.metadata.display}`
    } else {
      const msgSellBacking: MsgSellBackingEncodeObject = {
        typeUrl: typeUrls.MsgSellBacking,
        value: {
          sender: account.mer(),
          to: '',
          backingIn: new Coin(
            backingToken.metadata.base,
            new Dec(backingAmt)
              .mulPow(backingToken.metadata.displayExponent)
              .toInt()
          ).toProto(),
          lionOutMin: new Coin(
            config.denom,
            new Dec(lionAmt).mul(tolerance).mulPow(config.denomDecimals).toInt()
          ).toProto(),
        },
      }
      msg = msgSellBacking
      title = `Swap  ${backingAmt} ${backingToken.metadata.display} for ${lionAmt} ${config.displayDenom}`
    }

    console.debug(`${JSON.stringify(msg)}`)
    const receiptPromise = sendTx(msg)

    receiptPromise
      ?.then(() => {
        setBackingAmt('')
        setLionAmt('')
        setFeeAmt('')

        mutateTotalBacking()
        mutateAllBackingPools()
        mutateBackingBalance()
        mutateLionBalance()
      })
      .catch(() => {})

    toast({
      render: ({ onClose }) => {
        return (
          <TransactionToast
            title={title}
            receiptPromise={receiptPromise}
            onClose={onClose}
          />
        )
      },
    })
  }, [
    account,
    backingAmt,
    backingToken,
    isBuyback,
    lionAmt,
    mutateAllBackingPools,
    mutateBackingBalance,
    mutateLionBalance,
    mutateTotalBacking,
    slippageTolerance,
    sendTx,
    toast,
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
      <Navbar
        value={'buyback-reback'}
        onChange={(value) => {
          if (value === 'mint-burn') {
            router.push('/backing/swap-mint')
            return
          }
        }}
      />

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
            onClick={() => setIsBuyback(!isBuyback)}
          >
            {isBuyback ? 'Buyback' : 'Reback'}
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
                <Text fontSize="lg">Backing Market</Text>
                <Stack fontSize="sm" ps="4">
                  <HStack justify="space-between">
                    <Text>Backing Ratio:</Text>
                    <Text>
                      {backingRatio?.backingRatio.mul(100).toString()}%
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Excess Value:</Text>
                    <Text>${excessValueAvailable.toString()}</Text>
                  </HStack>
                </Stack>
              </Stack>
              <Stack>
                <Text fontSize="lg">
                  {backingToken.metadata?.symbol} Backing Pool
                </Text>
                <Stack fontSize="sm" ps="4">
                  <HStack justify="space-between">
                    <Text>Current Backing:</Text>
                    <Text>
                      {formatNumberSuitable(
                        backingPool?.backing?.amount,
                        backingToken.metadata?.displayExponent
                      )}
                      &nbsp;
                      {backingToken.metadata?.symbol}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>{isBuyback ? 'Buyback' : 'Reback'} Available:</Text>
                    <Text>
                      {formatNumberSuitable(excessAvailable)}
                      &nbsp;
                      {backingToken.metadata?.symbol}
                    </Text>
                  </HStack>
                  {isBuyback ? (
                    <HStack justify="space-between">
                      <Text>Buyback Fee:</Text>
                      <Text>
                        {Dec.fromProto(backingParams?.buybackFee || '0')
                          .mul(100)
                          .toString()}
                        %
                      </Text>
                    </HStack>
                  ) : (
                    <>
                      <HStack justify="space-between">
                        <Text>Reback Fee:</Text>
                        <Text>
                          {Dec.fromProto(backingParams?.rebackFee || '0')
                            .mul(100)
                            .toString()}
                          %
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>
                          Reback Bonus:&nbsp;
                          <sup>
                            <Icon
                              as={FaGift}
                              color="orange.300"
                              fontSize="md"
                              transform="rotate(15deg)"
                            />
                          </sup>
                        </Text>
                        <Text>
                          {Dec.fromProto(makerParams?.rebackBonus || '0')
                            .mul(100)
                            .toString()}
                          %
                        </Text>
                      </HStack>
                    </>
                  )}
                </Stack>
              </Stack>
            </Stack>

            <Box>
              <AmountInput
                token={isBuyback ? lionToken : backingToken}
                value={isBuyback ? lionAmt : backingAmt}
                onSelectToken={!isBuyback && onSelectTokenModalOpen}
                hoverBorder
                onInput={onInput}
                isDisabled={disabled}
              ></AmountInput>
              <OperatorIcon
                icon={<ArrowDownIcon />}
                onClick={() => setIsBuyback(!isBuyback)}
              />
              <AmountInput
                token={isBuyback ? backingToken : lionToken}
                value={isBuyback ? backingAmt : lionAmt}
                onSelectToken={isBuyback && onSelectTokenModalOpen}
                hoverBorder
                onInput={onInput}
                isDisabled={disabled}
                noMaxButton
              ></AmountInput>

              {backingToken.metadata && estimated && (
                <Explain
                  isBuyback={isBuyback}
                  backingMetadata={backingToken.metadata}
                  backingAmt={backingAmt}
                  lionAmt={lionAmt}
                  feeAmt={feeAmt}
                />
              )}

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
                  expertMode ? onSubmit() : onConfirmModalOpen()
                }}
              >
                {sendTitle}
              </Button>
            </Box>
          </SimpleGrid>
        </Stack>
      </Box>

      <SelectTokenModal
        isOpen={isSelectTokenModalOpen}
        onClose={onSelectTokenModalClose}
        onSelect={(denom) => {
          setBackingDenom(denom)
          setInputKind(InputKind.Backing)
        }}
      />

      <ConfirmModal
        isBuyback={isBuyback}
        backingToken={backingToken}
        lionToken={lionToken}
        backingAmt={backingAmt}
        lionAmt={lionAmt}
        feeAmt={feeAmt}
        isOpen={isConfirmModalOpen}
        onClose={onConfirmModalClose}
        onSubmit={onSubmit}
      />
    </Container>
  )
}
