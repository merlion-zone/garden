import {
  Box,
  BoxProps,
  Container,
  SimpleGrid,
  Stack,
  HStack,
  Text,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react'
import { Hint } from '@/components/Hint'
import {
  useAllBackingParams,
  useAllBackingPools,
  useAllCollateralParams,
  useAllCollateralPools,
  useBackingRatio,
  useMakerParams,
  useTotalBacking,
  useTotalCollateral,
} from '@/hooks/query'
import { AmountDisplay, DecDisplay } from '@/components/NumberDisplay'
import config from '@/config'
import { Dec } from '@merlionzone/merlionjs'
import {
  BackingPoolsTable,
  CollateralPoolsTable,
} from '@/components/BackingCollateralTable'
import { NFTAssetTable, TokenAssetTable } from '@/components/AssetTable'
import { useState } from 'react'

const Card = (props: BoxProps) => (
  <Box
    minH="2xs"
    p="4"
    bg="bg-surface"
    boxShadow={useColorModeValue('sm', 'sm-dark')}
    borderRadius="lg"
    {...props}
  />
)

export default function StablecoinView() {
  const { data: makerParams } = useMakerParams()
  const { data: totalBacking } = useTotalBacking()
  const { data: totalCollateral } = useTotalCollateral()
  const { data: allBackingPools } = useAllBackingPools()
  const { data: allCollateralPools } = useAllCollateralPools()
  const { data: backingRatio } = useBackingRatio()

  const [poolsTabIndex, setPoolsTabIndex] = useState(0)

  return (
    <Container maxW="9xl" py="8" height="full">
      <Stack spacing={{ base: '8', lg: '6' }}>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: '8', lg: '6' }}>
          <Card></Card>

          <Card>
            <HStack align="baseline">
              <Text>Backing</Text>
              <Hint
                hint="FBA (fractional-backing-algorithmic) with parts of backing assets and parts of the algorithmic supply"
                ariaLabel="Backing Tooltip"
                placement="bottom"
              ></Hint>
            </HStack>
            <Box color="gray.500">
              <Box
                borderRadius="lg"
                border="1px"
                borderColor={useColorModeValue('gray.300', 'gray.700')}
                p="2"
                my="2"
              >
                <HStack align="baseline" justify="space-between">
                  <Text>Pools:</Text>
                  <Text>{(allBackingPools ?? []).length}</Text>
                </HStack>
                <HStack align="baseline" justify="space-between">
                  <Text>Total USM Minted:</Text>
                  <Text>
                    <AmountDisplay
                      value={totalBacking ? totalBacking.merMinted?.amount : 0}
                      decimals={config.merDenomDecimals}
                    ></AmountDisplay>
                  </Text>
                </HStack>
                <HStack align="baseline" justify="space-between">
                  <Text>Total LION Burned:</Text>
                  <Text>
                    <AmountDisplay
                      value={totalBacking ? totalBacking.lionBurned?.amount : 0}
                      decimals={config.denomDecimals}
                    ></AmountDisplay>
                  </Text>
                </HStack>
              </Box>

              <Box
                borderRadius="lg"
                border="1px"
                borderColor={useColorModeValue('gray.300', 'gray.700')}
                p="2"
                my="2"
              >
                <HStack align="baseline">
                  <Text>Backing Ratio:</Text>
                  <Hint
                    hint="Backing Ratio"
                    ariaLabel="Backing Ratio Tooltip"
                    placement="bottom"
                  ></Hint>
                </HStack>
                <Stack ms="6" spacing="0" fontSize="sm">
                  <HStack align="baseline" justify="space-between">
                    <HStack align="baseline">
                      <Text>Ratio:</Text>
                      <Hint
                        hint="Backing Ratio"
                        ariaLabel="Backing Ratio Tooltip"
                        placement="bottom"
                      ></Hint>
                    </HStack>
                    <Text>
                      <DecDisplay
                        value={backingRatio?.backingRatio}
                        percentage
                      ></DecDisplay>
                    </Text>
                  </HStack>
                  <HStack align="baseline" justify="space-between">
                    <HStack align="baseline">
                      <Text>Updated at:</Text>
                      <Hint
                        hint="Backing Ratio"
                        ariaLabel="Backing Ratio Updated Time Tooltip"
                        placement="bottom"
                      ></Hint>
                    </HStack>
                    <Text>{backingRatio?.lastUpdateBlock.toString()}</Text>
                  </HStack>
                  <HStack align="baseline" justify="space-between">
                    <HStack align="baseline">
                      <Text>Adjusting Step:</Text>
                      <Hint
                        hint="Backing Ratio"
                        ariaLabel="Backing Ratio Adjusting Step Tooltip"
                        placement="bottom"
                      ></Hint>
                    </HStack>
                    <Text>
                      <DecDisplay
                        value={makerParams?.backingRatioStep}
                        percentage
                      ></DecDisplay>
                    </Text>
                  </HStack>
                  <HStack align="baseline" justify="space-between">
                    <HStack align="baseline">
                      <Text>Price Band:</Text>
                      <Hint
                        hint="Backing Ratio"
                        ariaLabel="Backing Ratio Price Band Tooltip"
                        placement="bottom"
                      ></Hint>
                    </HStack>
                    <Text>
                      <DecDisplay
                        value={makerParams?.backingRatioPriceBand}
                        prefix="&plusmn;"
                        percentage
                      ></DecDisplay>
                    </Text>
                  </HStack>
                  <HStack align="baseline" justify="space-between">
                    <HStack align="baseline">
                      <Text>Cooldown Period:</Text>
                      <Hint
                        hint="Backing Ratio"
                        ariaLabel="Backing Ratio Cooldown Period Tooltip"
                        placement="bottom"
                      ></Hint>
                    </HStack>
                    <Text>
                      {makerParams?.backingRatioCooldownPeriod.toString()}
                    </Text>
                  </HStack>
                </Stack>
              </Box>

              <Box
                borderRadius="lg"
                border="1px"
                borderColor={useColorModeValue('gray.300', 'gray.700')}
                p="2"
                my="2"
              >
                <HStack align="baseline" justify="space-between">
                  <HStack align="baseline">
                    <Text>Mint/Burn Price Limit:</Text>
                    <Hint
                      hint="Backing Ratio"
                      ariaLabel="Backing Ratio Mint/Burn Price Limit Tooltip"
                      placement="bottom"
                    ></Hint>
                  </HStack>
                  <Text>
                    <DecDisplay
                      value={
                        makerParams &&
                        new Dec(1).sub(Dec.fromProto(makerParams.mintPriceBias))
                      }
                      percentage
                    ></DecDisplay>
                    ~
                    <DecDisplay
                      value={
                        makerParams &&
                        new Dec(1).add(Dec.fromProto(makerParams.burnPriceBias))
                      }
                      percentage
                    ></DecDisplay>
                  </Text>
                </HStack>

                <HStack align="baseline" justify="space-between">
                  <HStack align="baseline">
                    <Text>Reback Bonus:</Text>
                    <Hint
                      hint="Backing Ratio"
                      ariaLabel="Backing Ratio Reback Bonus Tooltip"
                      placement="bottom"
                    ></Hint>
                  </HStack>
                  <Text>
                    <DecDisplay
                      value={makerParams?.rebackBonus}
                      percentage
                    ></DecDisplay>
                  </Text>
                </HStack>
              </Box>
            </Box>
          </Card>

          <Card>
            <HStack align="baseline">
              <Text>Collateral</Text>
              <Hint
                hint="OCC (over-collateralized-catalytic) over collateralized for interest-bearing lending, and loan-to-value maximized by catalytic Lion"
                ariaLabel="Collateral Tooltip"
                placement="bottom"
              ></Hint>
            </HStack>
            <Box color="gray.500">
              <Box
                borderRadius="lg"
                border="1px"
                borderColor={useColorModeValue('gray.300', 'gray.700')}
                p="2"
                my="2"
              >
                <HStack align="baseline" justify="space-between">
                  <Text>Pools:</Text>
                  <Text>{(allCollateralPools ?? []).length}</Text>
                </HStack>
                <HStack align="baseline" justify="space-between">
                  <Text>Total USM Minted:</Text>
                  <Text>
                    <AmountDisplay
                      value={
                        totalCollateral ? totalCollateral.merDebt?.amount : 0
                      }
                      decimals={config.merDenomDecimals}
                    ></AmountDisplay>
                  </Text>
                </HStack>
                <HStack align="baseline" justify="space-between">
                  <Text>Total LION Burned:</Text>
                  <Text>
                    <AmountDisplay
                      value={
                        totalCollateral ? totalCollateral.lionBurned?.amount : 0
                      }
                      decimals={config.denomDecimals}
                    ></AmountDisplay>
                  </Text>
                </HStack>
              </Box>

              <Box
                borderRadius="lg"
                border="1px"
                borderColor={useColorModeValue('gray.300', 'gray.700')}
                p="2"
                my="2"
              >
                <HStack align="baseline" justify="space-between">
                  <HStack align="baseline">
                    <Text>Liquidation Commission Fee:</Text>
                    <Hint
                      hint="Backing Ratio"
                      ariaLabel="Backing Ratio Reback Bonus Tooltip"
                      placement="bottom"
                    ></Hint>
                  </HStack>
                  <Text>
                    <DecDisplay
                      value={makerParams?.liquidationCommissionFee}
                      percentage
                    ></DecDisplay>
                  </Text>
                </HStack>
              </Box>
            </Box>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={1} minHeight="full" pb={{ base: '0', lg: '8' }}>
          <Card>
            <HStack gap="4">
              <Text fontSize="3xl">Markets</Text>
              <Tabs
                variant="with-line"
                onChange={(index) => setPoolsTabIndex(index)}
              >
                <TabList>
                  <Tab pb="3" px="4">
                    Backing
                  </Tab>
                  <Tab pb="3" px="4">
                    Collateral
                  </Tab>
                </TabList>
              </Tabs>
            </HStack>

            <Tabs variant="with-line" index={poolsTabIndex}>
              <TabPanels>
                <TabPanel px="0">
                  <BackingPoolsTable></BackingPoolsTable>
                </TabPanel>
                <TabPanel px="0">
                  <CollateralPoolsTable></CollateralPoolsTable>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
