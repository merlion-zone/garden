import {
  Box,
  Button,
  Center,
  HStack,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  DenomMetadata,
  useAllCollateralParams,
  useAllCollateralPools,
  useDenomsMetadata,
  useDenomsMetadataMap,
} from '@/hooks/query'
import Avvvatars from 'avvvatars-react'
import { Coin } from '@merlionzone/merlionjs'
import { PoolCollateral } from '@merlionzone/merlionjs/dist/proto/merlion/maker/v1/maker'
import { shortenDenom } from '@/utils'
import { IndicatorTextBox } from '@/components/BackingCollateralTable/IndicatorBar'
import config from '@/config'

export const CollateralPoolsTable = () => {
  const { data: allCollateralParams } = useAllCollateralParams()
  const { data: allCollateralPools } = useAllCollateralPools()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()

  const collateralPoolsMap = new Map<string, PoolCollateral>()
  allCollateralPools?.forEach((pool) => {
    if (pool.collateral) {
      collateralPoolsMap.set(pool.collateral.denom, pool)
    }
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
                      { name: 'Collateral' },
                      { name: 'LION' },
                    ]}
                  />
                </HStack>
              </Th>
              <Th borderColor="border">
                <HStack>
                  <Text>Max</Text>
                  <IndicatorTextBox
                    items={[{ name: 'USM' }, { name: 'Collateral' }]}
                  />
                </HStack>
              </Th>
              <Th borderColor="border">
                <HStack>
                  <Text>Fee</Text>
                  <IndicatorTextBox
                    items={[{ name: 'Mint' }, { name: 'Interest' }]}
                  />
                </HStack>
              </Th>
              <Th borderColor="border">
                <HStack>
                  <Text>LTV</Text>
                  <IndicatorTextBox
                    items={[
                      { name: 'Basic' },
                      { name: 'Max' },
                      { name: 'Catalytic' },
                    ]}
                  />
                </HStack>
              </Th>
              <Th borderColor="border">
                <HStack>
                  <Text>Liquidation</Text>
                  <IndicatorTextBox
                    items={[{ name: 'Fee' }, { name: 'Threshold' }]}
                  />
                </HStack>
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {allCollateralParams?.map((params) => {
              const collateralPool = collateralPoolsMap.get(
                params.collateralDenom
              )
              const collateralMetadata = denomsMetadataMap.get(
                params.collateralDenom
              )

              let merMint: Coin | undefined
              if (collateralPool?.merDebt && collateralPool.merByLion) {
                merMint = Coin.fromProto(collateralPool.merDebt).add(
                  collateralPool.merByLion.amount
                )
              }

              return (
                <Tr
                  key={params.collateralDenom}
                  cursor="pointer"
                  _hover={{ bg: hoverRowBg }}
                >
                  <Td borderColor="border">
                    <HStack>
                      <Avvvatars value={params.collateralDenom} style="shape" />
                      <Box>
                        <Text>{collateralMetadata?.symbol}</Text>
                        <Text color="gray.500" fontSize="sm">
                          {shortenDenom(params.collateralDenom)}
                        </Text>
                      </Box>
                    </HStack>
                  </Td>
                  <Td borderColor="border">
                    <IndicatorTextBox
                      items={[
                        {
                          name: 'USM',
                          content: merMint?.amount.toString(),
                          decimals: config.merDenomDecimals,
                        },
                        {
                          name: 'Collateral',
                          content: collateralPool?.collateral?.amount,
                          decimals: collateralMetadata?.displayExponent,
                        },
                        {
                          name: 'LION',
                          content: collateralPool?.lionBurned?.amount,
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
                          name: 'Collateral',
                          content: params.maxCollateral,
                          decimals: collateralMetadata?.displayExponent,
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
                          name: 'Interest',
                          content: params.interestFee,
                        },
                      ]}
                    />
                  </Td>
                  <Td borderColor="border">
                    <IndicatorTextBox
                      percentage
                      items={[
                        {
                          name: 'Basic',
                          content: params.basicLoanToValue,
                        },
                        {
                          name: 'Max',
                          content: params.loanToValue,
                        },
                        {
                          name: 'Catalytic',
                          content: params.catalyticLionRatio,
                        },
                      ]}
                    />
                  </Td>
                  <Td borderColor="border">
                    <IndicatorTextBox
                      percentage
                      items={[
                        {
                          name: 'Fee',
                          content: params.liquidationFee,
                        },
                        {
                          name: 'Threshold',
                          content: params.liquidationThreshold,
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

      {!allCollateralParams?.length ? (
        <Center height="full" mt="12">
          <Stack>
            <Text color="subtle" fontSize="xl">
              No collateral pool exists in the network.
            </Text>
            <Center pt="4">
              <Button variant="outline">Propose to Register Collateral</Button>
            </Center>
          </Stack>
        </Center>
      ) : undefined}
    </>
  )
}
