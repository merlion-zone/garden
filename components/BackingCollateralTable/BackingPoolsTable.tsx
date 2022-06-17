import {
  Stack,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Box,
  useColorModeValue,
  Center,
  Button,
} from '@chakra-ui/react'
import {
  DenomMetadata,
  useAllBackingParams,
  useAllBackingPools,
  useDenomsMetadata,
} from '@/hooks/query'
import Avvvatars from 'avvvatars-react'
import { PoolBacking } from '@merlionzone/merlionjs/dist/proto/merlion/maker/v1/maker'
import config from '@/config'
import { AmountDisplay, DecDisplay } from '@/components/NumberDisplay'
import { shortenDenom } from '@/utils'
import {
  IndicatorBar,
  IndicatorTextBox,
} from '@/components/BackingCollateralTable/IndicatorBar'

export const BackingPoolsTable = () => {
  const { data: allBackingParams } = useAllBackingParams()
  const { data: allBackingPools } = useAllBackingPools()
  const { data: denomsMetadata } = useDenomsMetadata()

  const backingPoolsMap = new Map<string, PoolBacking>()
  allBackingPools?.forEach((pool) => {
    if (pool.backing) {
      backingPoolsMap.set(pool.backing.denom, pool)
    }
  })

  const denomsMetadataMap = new Map<string, DenomMetadata>()
  denomsMetadata?.forEach((metadata) => {
    denomsMetadataMap.set(metadata.base, metadata)
  })

  const hoverRowBg = useColorModeValue('gray.50', 'gray.900')

  return (
    <>
      <TableContainer>
        <Table variant="simple" size="lg">
          <Thead>
            <Tr>
              <Th borderColor="border">Asset</Th>
              <Th borderColor="border">
                <HStack>
                  <Text>Current</Text>
                  <IndicatorTextBox
                    items={[
                      { name: 'USM' },
                      { name: 'Backing' },
                      { name: 'LION' },
                    ]}
                  />
                </HStack>
              </Th>
              <Th borderColor="border">
                <HStack>
                  <Text>Max</Text>
                  <IndicatorTextBox
                    items={[{ name: 'USM' }, { name: 'Backing' }]}
                  />
                </HStack>
              </Th>
              <Th borderColor="border">
                <HStack>
                  <Text>Fee</Text>
                  <IndicatorTextBox
                    items={[
                      { name: 'Mint' },
                      { name: 'Burn' },
                      { name: 'Buyback' },
                      { name: 'Reback' },
                    ]}
                  />
                </HStack>
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {allBackingParams?.map((params) => {
              const backingPool = backingPoolsMap.get(params.backingDenom)
              const backingMetadata = denomsMetadataMap.get(params.backingDenom)

              return (
                <Tr
                  key={params.backingDenom}
                  cursor="pointer"
                  _hover={{ bg: hoverRowBg }}
                >
                  <Td borderColor="border">
                    <HStack>
                      <Avvvatars value={params.backingDenom} style="shape" />
                      <Box>
                        <Text>{backingMetadata?.symbol}</Text>
                        <Text color="gray.500" fontSize="sm">
                          {shortenDenom(params.backingDenom)}
                        </Text>
                      </Box>
                    </HStack>
                  </Td>
                  <Td borderColor="border">
                    <IndicatorTextBox
                      items={[
                        {
                          name: 'USM',
                          content: backingPool?.merMinted?.amount,
                          decimals: config.merDenomDecimals,
                        },
                        {
                          name: 'Backing',
                          content: backingPool?.backing?.amount,
                          decimals: backingMetadata?.displayExponent,
                        },
                        {
                          name: 'LION',
                          content: backingPool?.lionBurned?.amount,
                          decimals: config.denomDecimals,
                        },
                      ]}
                    />
                  </Td>
                  <Td borderColor="border">
                    <IndicatorTextBox
                      items={[
                        {
                          name: 'USM',
                          content: params.maxMerMint,
                          decimals: config.merDenomDecimals,
                        },
                        {
                          name: 'Backing',
                          content: params.maxBacking,
                          decimals: backingMetadata?.displayExponent,
                        },
                      ]}
                    />
                  </Td>
                  <Td borderColor="border">
                    <IndicatorTextBox
                      percentage
                      items={[
                        {
                          name: 'Mint',
                          content: params.mintFee,
                        },
                        {
                          name: 'Burn',
                          content: params.burnFee,
                        },
                        {
                          name: 'Buyback',
                          content: params.buybackFee,
                        },
                        {
                          name: 'Reback',
                          content: params.rebackFee,
                        },
                      ]}
                    />
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>

      {!allBackingParams?.length ? (
        <Center height="full" mt="12">
          <Stack>
            <Text color="subtle" fontSize="xl">
              No backing pool exists in the network.
            </Text>
            <Center pt="4">
              <Button variant="outline">Propose to Register Backing</Button>
            </Center>
          </Stack>
        </Center>
      ) : undefined}
    </>
  )
}
