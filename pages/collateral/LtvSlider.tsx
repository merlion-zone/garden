import {
  Box,
  Button,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
} from '@chakra-ui/react'
import { Dec, proto } from '@merlionzone/merlionjs'
import { useCallback, useEffect, useState } from 'react'

import { DecDisplay } from '@/components/NumberDisplay'
import config from '@/config'

interface LtvSliderProps {
  collateralParams?: proto.maker.CollateralRiskParams
  accountCollateral?: proto.maker.AccountCollateral
  collateralPrice?: Dec
  lionPrice?: Dec
  collateralBalance?: Dec
  lionBalance?: Dec
  collateral: Dec
  value: string

  onChange(value: string): void
}

export const LtvSlider = ({
  collateralParams,
  accountCollateral,
  collateralPrice,
  lionPrice,
  collateralBalance,
  lionBalance,
  collateral,
  value,
  onChange,
}: LtvSliderProps) => {
  const maxLtv = Dec.fromProto(collateralParams?.loanToValue || '')
  const basicLtv = Dec.fromProto(collateralParams?.basicLoanToValue || '')
  const fullCatalyticRatio = Dec.fromProto(
    collateralParams?.catalyticLionRatio || ''
  )
  const lionCollateralized = new Dec(
    accountCollateral?.lionCollateralized?.amount
  ).divPow(config.denomDecimals)

  const min = basicLtv.mul(100).toNumber()
  const max = maxLtv.mul(100).toNumber()
  const step = 0.5

  const [sliderValue, setSliderValue] = useState(0)
  useEffect(() => {
    const catalyticRatio = lionCollateralized
      .add(value)
      .mul(lionPrice || 0)
      .divPow(collateral.mul(collateralPrice || 0) || 0)

    let ltv = basicLtv
    if (fullCatalyticRatio.greaterThan(0)) {
      ltv = maxLtv
        .sub(basicLtv)
        .mul(catalyticRatio)
        .div(fullCatalyticRatio)
        .add(basicLtv)
    }

    setSliderValue(ltv.mul(100).toDecimalPlaces(1).toNumber())
  }, [
    basicLtv,
    collateral,
    collateralPrice,
    fullCatalyticRatio,
    lionCollateralized,
    lionPrice,
    maxLtv,
    value,
  ])

  const onSliderValue = useCallback(
    (value: number) => {
      const catalyticRatio = fullCatalyticRatio
        .mul(new Dec(value).div(100).sub(basicLtv))
        .div(maxLtv.sub(basicLtv))

      console.log('coll:', collateral.toString())
      const lionCollateralizedNew = catalyticRatio
        .mul(collateral.mul(collateralPrice || 0))
        .div(lionPrice || 1)
      const lionDeposit = lionCollateralizedNew.sub(lionCollateralized)
      onChange(lionDeposit.toString())
    },
    [
      basicLtv,
      collateral,
      collateralPrice,
      fullCatalyticRatio,
      lionCollateralized,
      lionPrice,
      maxLtv,
      onChange,
    ]
  )

  const labelStyles = {
    mt: '2',
    ml: '-2.5',
    fontSize: 'xs',
  }

  return (
    <Box pt={8} pb={4} px={4}>
      <Slider
        aria-label="ltv-slider"
        focusThumbOnChange={false}
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onChange={(val) => onSliderValue(val)}
      >
        <SliderMark value={min} {...labelStyles}>
          {min}%
        </SliderMark>
        <SliderMark value={max} {...labelStyles}>
          {max}%
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
        <SliderTrack>
          <SliderFilledTrack bg="brand.300" />
        </SliderTrack>
        <SliderThumb />
      </Slider>

      <HStack justify="center" mt="-1.5">
        <Text fontSize="xs">Collateral Ratio</Text>
      </HStack>

      <HStack justify="end" pe="1" mt="2">
        <Text fontSize="sm" color="subtle">
          Deposit LION:&nbsp;
          <DecDisplay value={value} />
          {lionBalance?.greaterThan(0) && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                lionBalance?.greaterThan(0)
              }}
            >
              Max
            </Button>
          )}
        </Text>
      </HStack>
    </Box>
  )
}
