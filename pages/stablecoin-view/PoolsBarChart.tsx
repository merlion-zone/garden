import { useColorMode, useToken } from '@chakra-ui/react'
import { Dec } from '@merlionzone/merlionjs'
import { ReactNode, useMemo } from 'react'
import { AxisOptions, Chart } from 'react-charts'

import config from '@/config'
import {
  useAllBackingPools,
  useAllCollateralPools,
  useDenomsMetadataMap,
  useDisplayPrice,
  useDisplayPrices,
} from '@/hooks/query'
import { formatNumber } from '@/utils'

import TooltipRenderer from './TooltipRenderer'

type Amount = {
  pool: string
  label?: string
  amount: number
}

type Series = {
  label: string
  data: Amount[]
}

interface PoolChartProps {
  data: Series[]
}

const PoolsBarChart = ({ data }: PoolChartProps) => {
  const primaryAxis = useMemo<AxisOptions<Amount>>(
    () => ({
      getValue: (datum) => datum.pool,
    }),
    []
  )

  const secondaryAxes = useMemo<AxisOptions<Amount>[]>(
    () => [
      {
        getValue: (datum) => datum.amount,
        stacked: true,
        hardMin: 0,
        formatters: {
          tooltip: (value: ReactNode) => <>${formatNumber(value as any)}</>,
        },
      },
    ],
    []
  )

  const { colorMode } = useColorMode()
  const [red, green, blue] = useToken('colors', [
    'brand.400',
    'brand.500',
    'brand.600',
  ])

  return (
    <Chart
      options={{
        data,
        primaryAxis,
        secondaryAxes,
        dark: colorMode === 'dark',
        defaultColors: [red, green, blue],
        tooltip: {
          render: TooltipRenderer,
        },
        secondaryCursor: {
          showLabel: false, // TODO
        },
      }}
    />
  )
}

export const BackingPoolsBarChart = () => {
  const { data: denomsMetadata } = useDenomsMetadataMap()
  const { data: backingPools } = useAllBackingPools()
  const { data: backingPrices } = useDisplayPrices(
    backingPools?.map((pool) => [pool.backing?.denom])
  )
  const { data: lionPrice } = useDisplayPrice(config.denom)
  const { data: usmPrice } = useDisplayPrice(config.merDenom)

  const series = useMemo(() => {
    const backingSeries: Series = {
      label: 'Backing',
      data: [],
    }
    const usmSeries: Series = {
      label: 'USM Minted',
      data: [],
    }
    const lionSeries: Series = {
      label: 'LION Burned',
      data: [],
    }
    backingPools?.forEach((pool, i) => {
      const metadata = denomsMetadata?.get(pool.backing!.denom)
      if (!metadata) {
        return
      }
      backingSeries.data.push({
        pool: metadata.symbol,
        label: metadata.symbol,
        amount: new Dec(pool.backing!.amount)
          .mul(backingPrices?.[i] || 1)
          .divPow(metadata.displayExponent)
          .toNumber(),
      })
      usmSeries.data.push({
        pool: metadata.symbol,
        amount: new Dec(pool.merMinted!.amount)
          .mul(usmPrice || 1)
          .divPow(config.merDenomDecimals)
          .toNumber(),
      })
      lionSeries.data.push({
        pool: metadata.symbol,
        amount: new Dec(pool.lionBurned!.amount)
          .mul(lionPrice || 1)
          .divPow(config.denomDecimals)
          .toNumber(),
      })
    })
    return [backingSeries, usmSeries, lionSeries]
  }, [backingPools, backingPrices, denomsMetadata, lionPrice, usmPrice])

  return backingPools?.length ? <PoolsBarChart data={series} /> : <></>
}

export const CollateralPoolsBarChart = () => {
  const { data: denomsMetadata } = useDenomsMetadataMap()
  const { data: collateralPools } = useAllCollateralPools()
  const { data: collateralPrices } = useDisplayPrices(
    collateralPools?.map((pool) => [pool.collateral?.denom])
  )
  const { data: lionPrice } = useDisplayPrice(config.denom)
  const { data: usmPrice } = useDisplayPrice(config.merDenom)

  const series = useMemo(() => {
    const collateralSeries: Series = {
      label: 'Backing',
      data: [],
    }
    const usmSeries: Series = {
      label: 'USM Minted',
      data: [],
    }
    const lionSeries: Series = {
      label: 'LION Burned',
      data: [],
    }
    collateralPools?.forEach((pool, i) => {
      const metadata = denomsMetadata?.get(pool.collateral!.denom)
      if (!metadata) {
        return
      }
      collateralSeries.data.push({
        pool: metadata.symbol,
        label: metadata.symbol,
        amount: new Dec(pool.collateral!.amount)
          .mul(collateralPrices?.[i] || 1)
          .divPow(metadata.displayExponent)
          .toNumber(),
      })
      usmSeries.data.push({
        pool: metadata.symbol,
        amount: new Dec(pool.merDebt!.amount)
          .add(pool.merByLion!.amount)
          .mul(usmPrice || 1)
          .divPow(config.merDenomDecimals)
          .toNumber(),
      })
      lionSeries.data.push({
        pool: metadata.symbol,
        amount: new Dec(pool.lionBurned!.amount)
          .mul(lionPrice || 1)
          .divPow(config.denomDecimals)
          .toNumber(),
      })
    })
    return [collateralSeries, usmSeries, lionSeries]
  }, [collateralPools, collateralPrices, denomsMetadata, lionPrice, usmPrice])

  return collateralPools?.length ? <PoolsBarChart data={series} /> : <></>
}
