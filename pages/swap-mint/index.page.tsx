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
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  errors,
  getModuleErrorMsg,
  moduleAlerts,
  useAllBackingParams,
  useBackingRatio,
  useCoinPrice,
  useDenomsMetadataMap,
  useLionPrice,
  useMakerParams,
  useMerPrice,
  useMerTargetPrice,
} from '@/hooks/query'
import { useAccountAddress, useMerlionQueryClient } from '@/hooks'
import { Coin, Dec } from '@merlionzone/merlionjs'
import { Coin as CosmCoin } from 'cosmjs-types/cosmos/base/v1beta1/coin'
import config from '@/config'
import { useDebounce } from 'react-use'
import { AmountInput } from './AmountInput'
import { OperatorIcon } from './OperatorIcon'
import { SelectTokenModal } from './SelectTokenModal'
import { Settings } from '@/pages/swap-mint/Settings'
import { Explain } from '@/pages/swap-mint/Explain'
import { swapMint } from '@/pages/swap-mint/swapMint'
import { useToast } from '@/hooks/useToast'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import {
  DenomInput,
  estimateSwapMint,
} from '@/pages/swap-mint/estimateSwapMint'

export default function SwapMint() {
  const queryClient = useMerlionQueryClient()
  const account = useAccountAddress()

  const [isMint, setIsMint] = useState(true)

  const { data: makerParams } = useMakerParams()
  const { data: allBackingParams } = useAllBackingParams()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()

  const { data: backingRatio } = useBackingRatio()
  const backingRatioDec =
    backingRatio && Dec.fromProto(backingRatio.backingRatio).mul(100)

  const [backingDenom, setBackingDenom] = useState('')
  useEffect(() => {
    if (allBackingParams?.length) {
      setBackingDenom(allBackingParams[0].backingDenom)
    }
  }, [allBackingParams])

  const backingToken = useMemo(() => {
    return {
      metadata: denomsMetadataMap?.get(backingDenom),
      selectable: true,
      proportion: backingRatioDec && `${backingRatioDec}%`,
      proportionHint: 'Current system backing ratio (BR)',
    }
  }, [denomsMetadataMap, backingDenom, backingRatio])

  const lionToken = useMemo(
    () => ({
      metadata: denomsMetadataMap?.get(config.denom),
      proportion: backingRatioDec && `${new Dec(100).sub(backingRatioDec)}%`,
      proportionHint: '= 100% - BR',
    }),
    [denomsMetadataMap, backingRatio]
  )
  const usmToken = useMemo(
    () => ({
      metadata: denomsMetadataMap?.get(config.merDenom),
    }),
    [denomsMetadataMap]
  )

  const [sendTitle, setSendTitle] = useState<string | null>('Enter an amount')
  const [sendEnabled, setSendEnabled] = useState(false)

  const { price: backingPrice } = useCoinPrice(
    // TODO
    backingToken.metadata?.base as string
  )
  const { price: lionPrice } = useLionPrice()
  const { price: merPrice } = useMerPrice()
  const { price: merTargetPrice } = useMerTargetPrice()

  const [disabled, setDisabled] = useState(false)
  const [merPriceBound, setMerPriceBound] = useState('')

  useEffect(() => {
    if (!merPrice || !merTargetPrice || !makerParams) {
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
      setMerPriceBound(merPriceLowerBound.toSignificantDigits(4).toString())
      setSendEnabled(false)
    } else if (!isMint && merPrice.greaterThan(merPriceUpperBound)) {
      setDisabled(true)
      setMerPriceBound(merPriceUpperBound.toSignificantDigits(4).toString())
      setSendTitle(errors.usmPriceTooHigh)
    }
  }, [isMint, makerParams, merPrice, merTargetPrice])

  const [backingAmt, setBackingAmt] = useState('')
  const [lionAmt, setLionAmt] = useState('')
  const [usmAmt, setUsmAmt] = useState('')
  const [feeAmt, setFeeAmt] = useState('')

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

  const [denomInput, setDenomInput] = useState<DenomInput>(DenomInput.None)
  const [emptyInput, setEmptyInput] = useState(true)

  const onInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      console.debug(event.target.value, event.target.name)
      setEmptyInput(!event.target.value)
      switch (event.target.name) {
        case backingToken.metadata?.base:
          setDenomInput(DenomInput.Backing)
          setBackingAmt(event.target.value)
          break
        case config.denom:
          setDenomInput(DenomInput.Lion)
          setLionAmt(event.target.value)
          break
        case config.merDenom:
          setDenomInput(DenomInput.Usm)
          setUsmAmt(event.target.value)
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
      if (denomInput === DenomInput.None) {
        return
      }
      setInEstimate(true)
      const start = Date.now()
      estimateSwapMint({
        isMint,
        denomInput,
        backingMetadata: backingToken.metadata,
        lionMetadata: lionToken.metadata,
        usmMetadata: usmToken.metadata,
        backingAmt,
        lionAmt,
        usmAmt,
        displayAmount,
        queryClient,
      })
        .then((estimated) => {
          setBackingAmt(estimated.backingAmt)
          setLionAmt(estimated.lionAmt)
          setUsmAmt(estimated.usmAmt)
          setFeeAmt(estimated.feeAmt)

          if (estimated.estimated) {
            setSendTitle('Swap Mint')
            setSendEnabled(true)
          } else {
            setSendTitle('Enter an amount')
            setSendEnabled(false)
          }
        })
        .catch((e) => {
          console.warn(`swap-mint estimate: ${e}`)
          setSendTitle(getModuleErrorMsg('maker', e.toString()))
          setSendEnabled(false)
        })
        .finally(() => {
          setDenomInput(DenomInput.None)
          setTimeout(
            () => setInEstimate(false),
            Math.max(start - Date.now() + 500, 0)
          )
        })
    },
    1000,
    [
      denomInput,
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

  const onSubmit = () => {
    swapMint({
      isMint,
      account,
      backingMetadata: backingToken.metadata,
      backingAmt: backingAmt || 0,
      lionAmt: lionAmt || 0,
      usmAmt: usmAmt || 0,
      sendTx,
      toast,
    })
  }

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
                  <Settings></Settings>
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
        ></AmountInput>

        {backingToken.metadata && !emptyInput && (
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
          isDisabled={!sendEnabled}
          onClick={onSubmit}
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
          setDenomInput(DenomInput.Backing)
        }}
      />
    </Container>
  )
}
