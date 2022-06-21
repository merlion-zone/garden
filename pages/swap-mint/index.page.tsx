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
  getModuleErrorMsg,
  moduleAlerts,
  errors,
  useAllBackingParams,
  useBackingRatio,
  useCoinPrice,
  useDenomsMetadataMap,
  useLionPrice,
  useMakerParams,
  useMerPrice,
  useMerTargetPrice,
} from '@/hooks/query'
import {
  useAccountAddress,
  useMerlionClient,
  useMerlionQueryClient,
} from '@/hooks'
import { Coin, Dec, typeUrls } from '@merlionzone/merlionjs'
import { Coin as CosmCoin } from 'cosmjs-types/cosmos/base/v1beta1/coin'
import config from '@/config'
import { useDebounce } from 'react-use'
import { AmountInput } from './AmountInput'
import { OperatorIcon } from './OperatorIcon'
import { SelectTokenModal } from './SelectTokenModal'
import { Settings } from '@/pages/swap-mint/Settings'
import { MsgMintBySwapEncodeObject } from '@merlionzone/merlionjs/dist/modules/maker/messages'
import { isValidAmount } from '@/utils'
import { Explain } from '@/pages/swap-mint/Explain'

export default function SwapMint() {
  const queryClient = useMerlionQueryClient()
  const client = useMerlionClient()
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

  const [errMsg, setErrMsg] = useState<string | null>(null)

  const { price: backingPrice } = useCoinPrice(
    // TODO
    backingToken.metadata?.base as string
  )
  const { price: lionPrice } = useLionPrice()
  const { price: merPrice } = useMerPrice()
  const { price: merTargetPrice } = useMerTargetPrice()

  const [swapDisabled, setSwapDisabled] = useState(false)
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
      setSwapDisabled(true)
      setMerPriceBound(merPriceLowerBound.toSignificantDigits(4).toString())
      setErrMsg(errors.usmPriceTooLow)
    } else if (!isMint && merPrice.greaterThan(merPriceUpperBound)) {
      setSwapDisabled(true)
      setMerPriceBound(merPriceUpperBound.toSignificantDigits(4).toString())
      setErrMsg(errors.usmPriceTooHigh)
    } else {
      setSwapDisabled(false)
      setErrMsg(null)
    }
  }, [isMint, makerParams, merPrice, merTargetPrice])

  const [backingAmt, setBackingAmt] = useState('')
  const [lionAmt, setLionAmt] = useState('')
  const [usmAmt, setUsmAmt] = useState('')
  const [feeAmt, setFeeAmt] = useState('')

  const clearAllAmouts = useCallback((skip: number) => {
    skip === 0 || setBackingAmt('')
    skip === 1 || setLionAmt('')
    skip === 2 || setUsmAmt('')
    skip === 3 || setFeeAmt('')
  }, [])

  const displayAmount = useCallback(
    (coin: CosmCoin, oldAmt?: string | boolean) => {
      const amt = new Dec(Coin.fromProto(coin).amount).divPow(
        denomsMetadataMap?.get(coin.denom)?.displayExponent || 1
      )
      if (typeof oldAmt === 'string' && amt.equals(oldAmt)) {
        return oldAmt
      }
      return amt.isZero() ? '' : amt.toString()
    },
    [denomsMetadataMap]
  )

  const [denomInput, setDenomInput] = useState<
    'backing' | 'lion' | 'usm' | null
  >(null)
  const [emptyInput, setEmptyInput] = useState(true)

  const onInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      console.debug(event.target.value, event.target.name)
      setEmptyInput(!event.target.value)
      switch (event.target.name) {
        case backingToken.metadata?.base:
          setDenomInput('backing')
          setBackingAmt(event.target.value)
          break
        case config.denom:
          setDenomInput('lion')
          setLionAmt(event.target.value)
          break
        case config.merDenom:
          setDenomInput('usm')
          setUsmAmt(event.target.value)
          break
      }
    },
    [backingToken]
  )

  const [estimateResult, setEstimateResult] = useState(null)

  const [inEstimate, setInEstimate] = useState(false)

  useDebounce(
    () => {
      if (swapDisabled) {
        return
      }
      const inputKind = {
        backing: denomInput === 'backing',
        lion: denomInput === 'lion',
        usm: denomInput === 'usm',
      }
      const estimate = async () => {
        if (
          !(
            backingToken.metadata &&
            backingToken.metadata.displayExponent &&
            lionToken.metadata &&
            lionToken.metadata.displayExponent &&
            usmToken.metadata &&
            usmToken.metadata.displayExponent
          )
        ) {
          return
        }

        if (isMint) {
          if (inputKind.backing || inputKind.lion) {
            if (inputKind.backing) {
              if (!isValidAmount(backingAmt)) {
                clearAllAmouts(0)
                return
              }
            } else if (inputKind.lion) {
              if (!isValidAmount(lionAmt)) {
                clearAllAmouts(1)
                return
              }
            }

            const backingInMax = new Coin(
              backingToken.metadata.base,
              new Dec(inputKind.backing ? backingAmt : 0).mulPow(
                backingToken.metadata.displayExponent
              )
            ).toProto()

            const lionInMax = new Coin(
              lionToken.metadata.base,
              new Dec(inputKind.lion ? lionAmt : 0).mulPow(
                lionToken.metadata.displayExponent
              )
            ).toProto()

            setInEstimate(true)
            const resp = await queryClient?.maker.estimateMintBySwapOut({
              backingInMax,
              lionInMax,
              fullBacking: false, // TODO
            })

            console.debug(resp)
            setDenomInput(null)
            resp?.backingIn &&
              setBackingAmt(
                displayAmount(resp.backingIn, inputKind.backing && backingAmt)
              )
            resp?.lionIn &&
              setLionAmt(displayAmount(resp.lionIn, inputKind.lion && lionAmt))
            resp?.mintOut && setUsmAmt(displayAmount(resp.mintOut))
            resp?.mintFee && setFeeAmt(displayAmount(resp.mintFee))
          } else if (inputKind.usm) {
            if (!isValidAmount(usmAmt)) {
              clearAllAmouts(2)
              return
            }

            const usmOut = new Coin(
              usmToken.metadata.base,
              new Dec(usmAmt).mulPow(usmToken.metadata.displayExponent)
            ).toProto()

            setInEstimate(true)
            const resp = await queryClient?.maker.estimateMintBySwapIn({
              mintOut: usmOut,
              backingDenom: backingToken.metadata.base,
              fullBacking: false, // TODO
            })

            console.debug(resp)
            setDenomInput(null)
            resp?.backingIn && setBackingAmt(displayAmount(resp.backingIn))
            resp?.lionIn && setLionAmt(displayAmount(resp.lionIn))
            resp?.mintFee && setFeeAmt(displayAmount(resp.mintFee))
          }
        } else {
          // TODO
        }
      }

      const start = Date.now()
      estimate()
        .then(() => {
          setErrMsg(null)
        })
        .catch((e) => {
          console.warn(`swap-mint estimate: ${e}`)
          setErrMsg(getModuleErrorMsg('maker', e.toString()))
        })
        .finally(() => {
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

  const onSubmit = async () => {
    if (!client || !account || !backingToken.metadata?.displayExponent) {
      return
    }
    console.log(usmAmt, backingAmt, lionAmt)
    const msgMintBySwap: MsgMintBySwapEncodeObject = {
      typeUrl: typeUrls.MsgMintBySwap,
      value: {
        sender: account.mer(),
        mintOutMin: new Coin(
          config.merDenom,
          new Dec(usmAmt || 0).mulPow(config.merDenomDecimals).toInt()
        ).toProto(),
        backingInMax: new Coin(
          backingDenom,
          new Dec(backingAmt || 0)
            .mulPow(backingToken.metadata.displayExponent)
            .toInt()
        ).toProto(),
        lionInMax: new Coin(
          config.denom,
          new Dec(lionAmt || 0).mulPow(config.denomDecimals).toInt()
        ).toProto(),
        fullBacking: false, // TODO
      },
    }
    console.log(`${JSON.stringify(msgMintBySwap)}`)
    let receipt = await client.signAndBroadcast(account.mer(), [msgMintBySwap])
    console.log(receipt)
    if (receipt.code) {
    }
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
          isDisabled={swapDisabled}
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
          isDisabled={swapDisabled}
        ></AmountInput>
        <OperatorIcon
          icon={isMint ? <ArrowDownIcon /> : <SmallAddIcon />}
          onClick={isMint && (() => setIsMint(false))}
        />
        <AmountInput
          token={isMint ? usmToken : lionToken}
          value={isMint ? usmAmt : lionAmt}
          onInput={onInput}
          isDisabled={swapDisabled}
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
          isDisabled={!!errMsg}
          onClick={onSubmit}
        >
          {errMsg || 'Enter an amount'}
        </Button>

        {swapDisabled && (
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
          setDenomInput('backing')
        }}
      />
    </Container>
  )
}
