import {
  Alert,
  AlertIcon,
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
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { ArrowDownIcon, SettingsIcon, SmallAddIcon } from '@chakra-ui/icons'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  errors,
  moduleAlerts,
  useAllBackingParams,
  useBackingRatio,
  useBalance,
  useDenomsMetadataMap,
  useDisplayCoinPrice,
  useMakerParams,
  useMerTargetPrice,
} from '@/hooks/query'
import { useAccountAddress, useMerlionQueryClient } from '@/hooks'
import { Coin, Dec } from '@merlionzone/merlionjs'
import { Coin as CosmCoin } from 'cosmjs-types/cosmos/base/v1beta1/coin'
import config from '@/config'
import { useDebounce } from 'react-use'
import { AmountInput } from '@/components/AmountInput'
import { OperatorIcon } from './OperatorIcon'
import { SelectTokenModal } from './SelectTokenModal'
import { Settings } from '@/pages/backing/swap-mint/Settings'
import { Explain } from '@/pages/backing/swap-mint/Explain'
import { swapMint } from '@/pages/backing/swap-mint/swapMint'
import { useToast } from '@/hooks/useToast'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import {
  estimateSwapMint,
  InputKind,
} from '@/pages/backing/swap-mint/estimateSwapMint'
import { ConfirmModal } from '@/pages/backing/swap-mint/ConfirmModal'
import { useSwapMintSettings } from '@/hooks/useSetting'

export default function SwapMint() {
  const queryClient = useMerlionQueryClient()
  const account = useAccountAddress()

  const [isMint, setIsMint] = useState(true)

  const { data: makerParams } = useMakerParams()
  const { data: allBackingParams } = useAllBackingParams()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()

  const { data: backingRatio } = useBackingRatio()
  const backingRatioPercentage =
    backingRatio && Dec.fromProto(backingRatio.backingRatio).mul(100)

  const [backingDenom, setBackingDenom] = useState('')
  useEffect(() => {
    if (allBackingParams?.length) {
      setBackingDenom(allBackingParams[0].backingDenom)
    }
  }, [allBackingParams])

  const { displayPrice: backingPrice } = useDisplayCoinPrice(backingDenom)
  const { displayPrice: lionPrice } = useDisplayCoinPrice(config.denom)
  const { displayPrice: merPrice } = useDisplayCoinPrice(config.merDenom)
  const { price: merTargetPrice } = useMerTargetPrice()

  const backingToken = useMemo(() => {
    return {
      metadata: denomsMetadataMap?.get(backingDenom),
      price: backingPrice,
      proportion: backingRatioPercentage && `${backingRatioPercentage}%`,
      proportionHint: 'Current system backing ratio (BR)',
    }
  }, [denomsMetadataMap, backingDenom, backingPrice, backingRatioPercentage])

  const lionToken = useMemo(
    () => ({
      metadata: denomsMetadataMap?.get(config.denom),
      price: lionPrice,
      proportion:
        backingRatioPercentage &&
        `${new Dec(100).sub(backingRatioPercentage)}%`,
      proportionHint: '= 100% - BR',
    }),
    [denomsMetadataMap, lionPrice, backingRatioPercentage]
  )
  const usmToken = useMemo(
    () => ({
      metadata: denomsMetadataMap?.get(config.merDenom),
      price: merPrice,
    }),
    [denomsMetadataMap, merPrice]
  )

  const [sendEnabled, setSendEnabled] = useState(false)
  const [sendTitle, setSendTitle] = useState<string | null>('Enter an amount')
  const { isSendReady } = useSendCosmTx()

  const { balance: backingBalance } = useBalance(account?.mer(), backingDenom)
  const { balance: lionBalance } = useBalance(account?.mer(), config.denom)
  const { balance: usmBalance } = useBalance(account?.mer(), config.merDenom)

  const [disabled, setDisabled] = useState(false)
  const [merPriceBound, setMerPriceBound] = useState('')

  useEffect(() => {
    if (!merPrice || !merTargetPrice || !makerParams) {
      return
    }
    const params = allBackingParams?.find(
      (params) => params.backingDenom === backingDenom
    )
    if (params && !params.enabled) {
      setDisabled(true)
      setSendEnabled(false)
      setSendTitle(errors.backingDisabled)
      return
    }
    const merPriceLowerBound = merTargetPrice.mul(
      new Dec(1).sub(Dec.fromProto(makerParams.mintPriceBias))
    )
    const merPriceUpperBound = merTargetPrice.mul(
      new Dec(1).add(Dec.fromProto(makerParams.burnPriceBias))
    )
    if (isMint && merPrice.lessThan(merPriceLowerBound)) {
      setDisabled(true)
      setSendEnabled(false)
      setMerPriceBound(merPriceLowerBound.toSignificantDigits(4).toString())
      setSendTitle(errors.usmPriceTooLow)
    } else if (!isMint && merPrice.greaterThan(merPriceUpperBound)) {
      setDisabled(true)
      setSendEnabled(false)
      setMerPriceBound(merPriceUpperBound.toSignificantDigits(4).toString())
      setSendTitle(errors.usmPriceTooHigh)
    }
  }, [
    allBackingParams,
    backingDenom,
    isMint,
    makerParams,
    merPrice,
    merTargetPrice,
  ])

  const [backingAmt, setBackingAmt] = useState('')
  const [lionAmt, setLionAmt] = useState('')
  const [usmAmt, setUsmAmt] = useState('')
  const [feeAmt, setFeeAmt] = useState('')

  useEffect(() => {
    setTimeout(() => {
      setBackingAmt('')
      setLionAmt('')
      setUsmAmt('')
      setSendEnabled(false)
      setSendTitle('Enter an amount')
    }, 500)
  }, [isMint])

  const displayAmount = useCallback(
    (coin?: CosmCoin, oldAmt?: string | boolean) => {
      if (!coin) {
        return ''
      }
      const amt = new Dec(Coin.fromProto(coin).amount).divPow(
        denomsMetadataMap?.get(coin.denom)?.displayExponent || 0
      )
      if (typeof oldAmt === 'string' && amt.equals(oldAmt)) {
        return oldAmt
      }
      return amt.isZero() ? '' : amt.toString()
    },
    [denomsMetadataMap]
  )

  const [inputKind, setInputKind] = useState<InputKind>(InputKind.None)
  const [estimated, setEstimated] = useState(false)

  useEffect(() => {
    setEstimated(false)
  }, [isMint])

  const onInput = useCallback(
    (name: string, value: string) => {
      console.debug(value, name)
      switch (name) {
        case backingToken.metadata?.base:
          setInputKind(InputKind.Backing)
          setBackingAmt(value)
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
    [backingToken]
  )

  const [inEstimate, setInEstimate] = useState(false)

  useDebounce(
    () => {
      if (disabled || !queryClient) {
        return
      }
      if (!(backingToken.metadata && lionToken.metadata && usmToken.metadata)) {
        return
      }
      if (inputKind === InputKind.None) {
        return
      }
      setInEstimate(true)
      const start = Date.now()
      estimateSwapMint({
        isMint,
        inputKind: inputKind,
        backingMetadata: backingToken.metadata,
        lionMetadata: lionToken.metadata,
        usmMetadata: usmToken.metadata,
        backingAmt,
        lionAmt,
        usmAmt,
        displayAmount,
        queryClient,
      }).then((estimated) => {
        setBackingAmt(estimated.backingAmt)
        setLionAmt(estimated.lionAmt)
        setUsmAmt(estimated.usmAmt)
        setFeeAmt(estimated.feeAmt)
        setEstimated(estimated.estimated)

        if (estimated.estimated) {
          setSendTitle(isMint ? 'Swap Mint' : 'Swap Burn')
          setSendEnabled(true)

          if (isMint) {
            if (
              new Dec(estimated.backingAmt || 0).greaterThan(
                new Dec(backingBalance || 0).divPow(
                  backingToken.metadata!.displayExponent
                )
              )
            ) {
              setSendEnabled(false)
              setSendTitle(errors.backingInsufficientBalance)
            } else if (
              new Dec(estimated.lionAmt || 0).greaterThan(
                new Dec(lionBalance || 0).divPow(
                  lionToken.metadata!.displayExponent
                )
              )
            ) {
              setSendEnabled(false)
              setSendTitle(errors.lionInsufficientBalance)
            }
          } else if (
            new Dec(estimated.usmAmt || 0).greaterThan(
              new Dec(usmBalance || 0).divPow(
                usmToken.metadata!.displayExponent
              )
            )
          ) {
            setSendEnabled(false)
            setSendTitle(errors.usmInsufficientBalance)
          }
        } else {
          setSendEnabled(false)
          setSendTitle(estimated.errMsg || 'Enter an amount')
        }

        setInputKind(InputKind.None)
        setTimeout(
          () => setInEstimate(false),
          // delay 500ms to avoid flash
          Math.max(start - Date.now() + 200, 0)
        )
      })
    },
    1000,
    [
      inputKind,
      backingToken,
      lionToken,
      usmToken,
      backingAmt,
      lionAmt,
      usmAmt,
      isMint,
    ]
  )

  const { sendTx } = useSendCosmTx()
  const toast = useToast()

  const { expertMode, slippageTolerance } = useSwapMintSettings()

  const onSubmit = useCallback(() => {
    swapMint({
      isMint,
      account,
      backingMetadata: backingToken.metadata,
      backingAmt: backingAmt || 0,
      lionAmt: lionAmt || 0,
      usmAmt: usmAmt || 0,
      slippageTolerance,
      sendTx,
      toast,
    })
  }, [
    account,
    backingAmt,
    backingToken.metadata,
    isMint,
    lionAmt,
    sendTx,
    slippageTolerance,
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
        <HStack justify="space-between" pt="2" pb="4">
          <Button
            variant="ghost"
            fontSize="lg"
            fontWeight="bold"
            onClick={() => setIsMint(!isMint)}
          >
            {isMint ? 'Mint' : 'Burn'}
          </Button>
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

        <AmountInput
          token={isMint ? backingToken : usmToken}
          value={isMint ? backingAmt : usmAmt}
          onSelectToken={isMint && onSelectTokenModalOpen}
          onInput={onInput}
          isDisabled={disabled}
          hoverBorder
        ></AmountInput>
        <OperatorIcon
          icon={isMint ? <SmallAddIcon /> : <ArrowDownIcon />}
          onClick={!isMint && (() => setIsMint(true))}
        />
        <AmountInput
          token={isMint ? lionToken : backingToken}
          value={isMint ? lionAmt : backingAmt}
          onSelectToken={!isMint && onSelectTokenModalOpen}
          onInput={onInput}
          isDisabled={disabled}
          hoverBorder
        ></AmountInput>
        <OperatorIcon
          icon={isMint ? <ArrowDownIcon /> : <SmallAddIcon />}
          onClick={isMint && (() => setIsMint(false))}
        />
        <AmountInput
          token={isMint ? usmToken : lionToken}
          value={isMint ? usmAmt : lionAmt}
          onInput={onInput}
          isDisabled={disabled}
          hoverBorder
        ></AmountInput>

        {backingToken.metadata && estimated && (
          <Explain
            loading={inEstimate}
            isMint={isMint}
            backingMetadata={backingToken.metadata}
            backingAmt={backingAmt}
            lionAmt={lionAmt}
            usmAmt={usmAmt}
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

        {disabled && (
          <Alert status="warning" mt="8" mb="2" borderRadius="xl">
            <AlertIcon />
            {isMint
              ? moduleAlerts.usmPriceTooLow(`$${merPriceBound}`)
              : moduleAlerts.usmPriceTooHigh(`$${merPriceBound}`)}
          </Alert>
        )}
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
        isMint={isMint}
        backingToken={backingToken}
        lionToken={lionToken}
        usmToken={usmToken}
        backingAmt={backingAmt}
        lionAmt={lionAmt}
        usmAmt={usmAmt}
        feeAmt={feeAmt}
        isOpen={isConfirmModalOpen}
        onClose={onConfirmModalClose}
        onSubmit={onSubmit}
      />
    </Container>
  )
}
