import { useState } from 'react'
import {
  Box,
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
  useAllBackingPools,
  useAllCollateralPools,
  useBackingRatio,
  useMakerParams,
  useTotalBacking,
  useTotalCollateral,
} from '@/hooks/query'
import { Dec } from '@merlionzone/merlionjs'
import config from '@/config'
import { AmountDisplay, DecDisplay } from '@/components/NumberDisplay'
import { BackingPoolsTable } from './BackingPoolsTable'
import { CollateralPoolsTable } from './CollateralPoolsTable'
import { BackingPoolsBarChart, CollateralPoolsBarChart } from './PoolsBarChart'
import { Card } from '@/components/Card'
import { BackingCollateralStatistics } from '@/pages/stablecoin-view/BackingCollateralStatistics'
import { BackingCollateralParams } from '@/pages/stablecoin-view/BackingCollateralParams'

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
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: '8', lg: '6' }}>
          <Card>
            <Text>Backing pools</Text>
            <HStack w="full" h="xs" mt="8">
              <BackingPoolsBarChart />
            </HStack>
          </Card>

          <Card>
            <Text>Collateral pools</Text>
            <HStack w="full" h="xs" mt="8">
              <CollateralPoolsBarChart />
            </HStack>
          </Card>
        </SimpleGrid>

        <SimpleGrid
          columns={{ base: 1, sm: 2, xl: 4 }}
          gap={{ base: '8', lg: '6' }}
        >
          <BackingCollateralStatistics />
          <BackingCollateralParams />
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
