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
import React, {
  ChangeEvent,
  ReactElement,
  useCallback,
  useMemo,
  useState,
} from 'react'
import {
  DenomMetadata,
  getModuleErrorMsg,
  useAllBackingParams,
  useAllBackingPools,
  useBackingRatio,
  useBalances,
  useBalancesMap,
  useCoinPrice,
  useDenomsMetadataMap,
  useLionPrice,
  useMerlionQuery,
  useMerPrice,
} from '@/hooks/query'
import { useAccountAddress, useMerlionQueryClient } from '@/hooks'
import { AmountDisplay, DecDisplay } from '@/components/NumberDisplay'
import { Coin, Dec } from '@merlionzone/merlionjs'
import config from '@/config'
import { useDebounce } from 'react-use'
import { TokenAmount, AmountInput } from './AmountInput'
import { OperatorIcon } from './OperatorIcon'
import { SelectTokenModal } from './SelectTokenModal'

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

  const [backingAmt, setBackingAmt] = useState('')
  const [lionAmt, setLionAmt] = useState('')
  const [usmAmt, setUsmAmt] = useState('')
  const [feeAmt, setFeeAmt] = useState('')

  const clearAllAmouts = useCallback(() => {
    setBackingAmt('')
    setLionAmt('')
    setUsmAmt('')
    setFeeAmt('')
  }, [])

  const [denomInput, setDenomInput] = useState<
    'backing' | 'lion' | 'usm' | null
  >(null)

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    console.debug(event.target.value, event.target.name)
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
  }

  const [isMint, setIsMint] = useState(true)

  const [estimateResult, setEstimateResult] = useState(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const emptyIfZero = (str: string) => {
    return str === '0' ? '' : str
  }

  const queryClient = useMerlionQueryClient()

  useDebounce(
    () => {
      ;(async () => {
        if (isMint) {
          switch (denomInput) {
            case 'backing':
              if (!backingAmt) {
                clearAllAmouts()
                return
              }
            // fallthrough
            case 'lion':
              if (denomInput === 'lion' && !lionAmt) {
                clearAllAmouts()
                return
              }

              if (
                !backingToken.metadata ||
                !backingToken.metadata.displayExponent ||
                !lionToken.metadata ||
                !lionToken.metadata.displayExponent
              ) {
                return
              }

              const backingInMax = new Coin(
                backingToken.metadata.base,
                new Dec(denomInput === 'backing' ? backingAmt : 0).mulPow(
                  backingToken.metadata.displayExponent
                )
              ).toProto()

              const lionInMax = new Coin(
                lionToken.metadata.base,
                new Dec(denomInput === 'lion' ? lionAmt : 0).mulPow(
                  lionToken.metadata.displayExponent
                )
              ).toProto()

              const resp = await queryClient?.maker.estimateMintBySwapOut({
                backingInMax,
                lionInMax,
              })

              console.debug(resp)
              setDenomInput(null)
              resp?.backingIn &&
                setBackingAmt(
                  emptyIfZero(
                    new Dec(resp.backingIn.amount)
                      .divPow(backingToken.metadata.displayExponent)
                      .toString()
                  )
                )
              resp?.lionIn &&
                setLionAmt(
                  emptyIfZero(
                    new Dec(resp.lionIn.amount)
                      .divPow(config.denomDecimals)
                      .toString()
                  )
                )
              resp?.mintOut &&
                setUsmAmt(
                  emptyIfZero(
                    new Dec(resp.mintOut.amount)
                      .divPow(config.merDenomDecimals)
                      .toString()
                  )
                )
              resp?.mintFee &&
                setFeeAmt(
                  emptyIfZero(
                    new Dec(resp.mintFee.amount)
                      .divPow(config.merDenomDecimals)
                      .toString()
                  )
                )
              break
            case 'usm':
              break
          }
        } else {
          // TODO
        }
      })()
        .then(() => {
          setErrMsg(null)
        })
        .catch((e) => {
          console.warn(`swap-mint estimate: ${e}`)
          setErrMsg(getModuleErrorMsg('maker', e.toString()))
        })
    },
    1000,
    [
      queryClient,
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
          value={isMint ? backingAmt : usmAmt}
          onSelectToken={isMint && onSelectTokenModalOpen}
          onInput={onInput}
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
        ></AmountInput>
        <OperatorIcon
          icon={isMint ? <ArrowDownIcon /> : <SmallAddIcon />}
          onClick={isMint && (() => setIsMint(false))}
        />
        <AmountInput
          token={isMint ? usmToken : lionToken}
          value={isMint ? usmAmt : lionAmt}
          onInput={onInput}
        ></AmountInput>

        <Button
          w="full"
          size="xl"
          mt="8"
          borderRadius="2xl"
          fontSize="xl"
          isDisabled={!!errMsg}
        >
          {errMsg || 'Enter an amount'}
        </Button>
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
