import { Card } from '@/components/Card'
import { HStack, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import { HintButton } from '@/components/Hint'
import { AmountDisplay } from '@/components/NumberDisplay'
import config from '@/config'
import {
  useAllBackingPools,
  useAllCollateralPools,
  useBackingRatio,
  useMakerParams,
  useTotalBacking,
  useTotalCollateral,
} from '@/hooks/query'
import { formatNumberSuitable } from '@/utils'

export const BackingCollateralStatistics = () => {
  const { data: totalBacking } = useTotalBacking()
  const { data: totalCollateral } = useTotalCollateral()
  const { data: allBackingPools } = useAllBackingPools()
  const { data: allCollateralPools } = useAllCollateralPools()

  const gray = useColorModeValue('gray.600', 'gray.400')

  return (
    <>
      <Card>
        <HStack align="baseline">
          <Text>Backing</Text>
          <HintButton
            hint="FBA (fractional-backing-algorithmic) with parts of backing assets and parts of the algorithmic supply"
            ariaLabel="Backing Tooltip"
            placement="bottom"
          ></HintButton>
        </HStack>

        <Stack py="2" align="center">
          <HStack align="baseline">
            <Text fontSize="3xl">{(allBackingPools ?? []).length}</Text>
            <Text color={gray}>Pools</Text>
          </HStack>
          <HStack align="baseline">
            <Text fontSize="3xl">
              {formatNumberSuitable(
                totalBacking ? totalBacking.merMinted?.amount : 0,
                config.merDenomDecimals,
                2,
                4
              )}
            </Text>
            <Text color={gray}>USM Minted</Text>
          </HStack>
          <HStack align="baseline">
            <Text fontSize="3xl">
              <AmountDisplay
                value={totalBacking ? totalBacking.lionBurned?.amount : 0}
                decimals={config.denomDecimals}
              ></AmountDisplay>
            </Text>
            <Text color={gray}>LION Burned</Text>
          </HStack>
        </Stack>
      </Card>

      <Card>
        <HStack align="baseline">
          <Text>Collateral</Text>
          <HintButton
            hint="OCC (over-collateralized-catalytic) over collateralized for interest-bearing lending, and loan-to-value maximized by catalytic Lion"
            ariaLabel="Collateral Tooltip"
            placement="bottom"
          ></HintButton>
        </HStack>

        <Stack py="2" align="center">
          <HStack align="baseline">
            <Text fontSize="3xl">{allCollateralPools?.length || 0}</Text>
            <Text color={gray}>Pools</Text>
          </HStack>
          <HStack align="baseline">
            <Text fontSize="3xl">
              {formatNumberSuitable(
                totalCollateral ? totalCollateral.merDebt?.amount : 0,
                config.merDenomDecimals,
                2,
                4
              )}
            </Text>
            <Text color={gray}>USM Minted</Text>
          </HStack>
          <HStack align="baseline">
            <Text fontSize="3xl">
              <AmountDisplay
                value={totalCollateral ? totalCollateral.lionBurned?.amount : 0}
                decimals={config.denomDecimals}
              ></AmountDisplay>
            </Text>
            <Text color={gray}>LION Burned</Text>
          </HStack>
        </Stack>
      </Card>
    </>
  )
}
