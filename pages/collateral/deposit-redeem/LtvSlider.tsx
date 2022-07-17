import {
  Box,
  Button,
  HStack,
  Slider,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { Dec, proto } from '@merlionzone/merlionjs'
import { useCallback, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'

import { AmountMetadata } from '@/components/AmountInput'
import config from '@/config'
import { calculateActualLtv } from '@/pages/collateral/estimate'
import { formatNumberSuitable } from '@/utils'

interface LtvSliderProps {
  isDeposit: boolean
  isDisabled?: boolean
  collateralParams?: proto.maker.CollateralRiskParams
  collateralToken: AmountMetadata
  accountCollateral?: proto.maker.AccountCollateral
  collateralPrice?: Dec
  lionPrice?: Dec
  lionBalance?: Dec
  collateralAmt: string // input
  lionAmt: string // input

  onInput: (name: string, value: string) => void
}

export const LtvSlider = ({
  isDeposit,
  isDisabled,
  collateralParams,
  collateralToken,
  accountCollateral,
  collateralPrice,
  lionPrice,
  lionBalance,
  collateralAmt,
  lionAmt,
  onInput,
}: LtvSliderProps) => {
  const maxLtv = Dec.fromProto(collateralParams?.loanToValue || '')
  const basicLtv = Dec.fromProto(collateralParams?.basicLoanToValue || '')
  const fullCatalyticRatio = Dec.fromProto(
    collateralParams?.catalyticLionRatio || ''
  )
  const lionCollateralized = new Dec(
    accountCollateral?.lionCollateralized?.amount
  ).divPow(config.denomDecimals)

  let collateral = new Dec(accountCollateral?.collateral?.amount).divPow(
    collateralToken.metadata?.displayExponent || 0
  )
  collateral = isDeposit
    ? collateral.add(collateralAmt)
    : collateral.sub(collateralAmt)

  const min = basicLtv.mul(100).toNumber()
  const max = maxLtv.mul(100).toNumber()
  const step = 0.5

  const [sliderValue, setSliderValue] = useState(0)
  const [sliderAnchorValue, setSliderAnchorValue] = useState(0)

  const getLtv = useCallback(
    (lionAmt?: string) => {
      const { ltv } = calculateActualLtv({
        isDeposit,
        collateralParams,
        collateralToken,
        accountCollateral,
        collateralPrice,
        lionPrice,
        collateralAmt,
        lionAmt,
      })
      return ltv
    },
    [
      accountCollateral,
      collateralAmt,
      collateralParams,
      collateralPrice,
      collateralToken,
      isDeposit,
      lionPrice,
    ]
  )

  const currentValue = useMemo(() => {
    return getLtv().mul(100).toDecimalPlaces(2).toNumber()
  }, [getLtv])

  useDebounce(
    () => {
      setSliderValue(currentValue)
      setSliderAnchorValue(currentValue)
    },
    100,
    [currentValue, collateralAmt, isDeposit]
  )

  const onSliderValue = useCallback(
    (value: number) => {
      let catalyticRatio = fullCatalyticRatio
        .mul(new Dec(value).div(100).sub(basicLtv))
        .div(maxLtv.sub(basicLtv))
      if (catalyticRatio.greaterThan(fullCatalyticRatio)) {
        catalyticRatio = fullCatalyticRatio
      }

      const lionCollateralizedNew = catalyticRatio
        .mul(collateral.mul(collateralPrice || 0))
        .div(lionPrice || 1)

      if (isDeposit ? value < currentValue : value > currentValue) {
        setSliderValue(currentValue)
        onInput(config.denom, '')
        return
      }

      if (value < min) {
        value = min
      } else if (value > max) {
        value = max
      }
      setSliderValue(value)

      let lionAmt = lionCollateralizedNew.sub(lionCollateralized)
      if (isDeposit ? lionAmt.lessThan(0) : lionAmt.greaterThan(0)) {
        lionAmt = new Dec(0)
      }
      onInput(config.denom, lionAmt.abs().toString())
    },
    [
      basicLtv,
      collateral,
      collateralPrice,
      currentValue,
      fullCatalyticRatio,
      isDeposit,
      lionCollateralized,
      lionPrice,
      max,
      maxLtv,
      min,
      onInput,
    ]
  )

  const onMax = useCallback(() => {
    const value = getLtv(lionBalance?.toString())
      .mul(100)
      .toDecimalPlaces(2)
      .toNumber()
    onSliderValue(value)
  }, [getLtv, lionBalance, onSliderValue])

  const labelStyles = {
    mt: '2',
    ml: '-2.5',
    fontSize: 'xs',
  }

  const trackColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box pt={8} pb={4} px={4}>
      <Slider
        aria-label="ltv-slider"
        focusThumbOnChange={false}
        min={min - 0.5}
        max={max + 0.5}
        step={step}
        value={sliderValue}
        onChange={(val) => onSliderValue(val)}
        isDisabled={isDisabled}
      >
        <SliderMark value={min} {...labelStyles}>
          {min}%
        </SliderMark>
        <SliderMark value={max} {...labelStyles}>
          {max}%
        </SliderMark>
        <SliderMark
          value={sliderAnchorValue}
          textAlign="center"
          fontSize="xs"
          bg={useColorModeValue('gray.500', 'gray.700')}
          color="white"
          mt="-7"
          ml="-5"
          minW="10"
          borderRadius="sm"
        >
          {sliderAnchorValue}%
        </SliderMark>
        <SliderMark
          value={sliderValue}
          textAlign="center"
          fontSize="xs"
          bg="brand.500"
          color="white"
          mt="-7"
          ml="-5"
          minW="10"
          borderRadius="sm"
        >
          {sliderValue}%
        </SliderMark>
        <SliderTrack></SliderTrack>
        <SliderMark value={sliderAnchorValue} mt="-7px" ml="-7px">
          <Box bg={trackColor} w="14px" h="14px" borderRadius="50%"></Box>
        </SliderMark>
        <SliderThumb />
      </Slider>

      <HStack justify="center" mt="-1.5">
        <Text fontSize="xs" opacity={isDisabled ? 0.6 : undefined}>
          LTV
        </Text>
      </HStack>

      <HStack
        justify="space-between"
        align="baseline"
        pe="1"
        mt="2"
        fontSize="sm"
        color="subtle"
      >
        <Text>
          {isDeposit ? 'Deposit' : 'Redeem'} LION:&nbsp;
          {formatNumberSuitable(lionAmt, undefined, 2, 4)}
        </Text>
        <Text>
          Balance: {formatNumberSuitable(lionBalance, undefined, 2, 4)} LION
          {isDeposit && lionBalance?.greaterThan(0) && (
            <Button variant="ghost" size="xs" onClick={onMax}>
              Max
            </Button>
          )}
        </Text>
      </HStack>
    </Box>
  )
}
