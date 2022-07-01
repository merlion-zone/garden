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
  useAllCollateralParams,
  useAllCollateralPools,
  useDenomsMetadataMap,
  useDisplayPrices,
} from '@/hooks/query'
import Avvvatars from 'avvvatars-react'
import { Coin, Dec } from '@merlionzone/merlionjs'
import { proto } from '@merlionzone/merlionjs'
import { formatNumberSuitable, shortenDenom } from '@/utils'
import { IndicatorTextBox } from './IndicatorBar'
import config from '@/config'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { WithHint } from '@/components/Hint'

export const CollateralPoolsTable = () => {
  const router = useRouter()
  const { data: allCollateralParams } = useAllCollateralParams()
  const { data: allCollateralPools } = useAllCollateralPools()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()
  const { data: prices } = useDisplayPrices(
    allCollateralPools?.map((pool) => [pool.collateral?.denom])
  )

  const collateralPoolsMap = useMemo(() => {
    const map = new Map<string, proto.maker.PoolCollateral & { price?: Dec }>()
    allCollateralPools?.forEach((pool, i) => {
      if (pool.collateral) {
        map.set(pool.collateral.denom, {
          ...pool,
          price: prices?.[i],
        })
      }
    })
    return map
  }, [allCollateralPools, prices])

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
                  <WithHint
                    hint={
                      <IndicatorTextBox
                        items={[
                          { name: 'USM' },
                          { name: 'Collateral' },
                          { name: 'LION' },
                        ]}
                      />
                    }
                  >
                    <Text>Current</Text>
                  </WithHint>
                </HStack>
              </Th>
              <Th borderColor="border">
                <HStack>
                  <WithHint
                    hint={
                      <IndicatorTextBox
                        items={[{ name: 'USM' }, { name: 'Collateral' }]}
                      />
                    }
                  >
                    <Text>Max</Text>
                  </WithHint>
                </HStack>
              </Th>
              <Th borderColor="border">
                <HStack>
                  <WithHint
                    hint={
                      <IndicatorTextBox
                        items={[{ name: 'Mint' }, { name: 'Interest' }]}
                      />
                    }
                  >
                    <Text>Fee</Text>
                  </WithHint>
                </HStack>
              </Th>
              <Th borderColor="border">
                <HStack>
                  <WithHint
                    hint={
                      <IndicatorTextBox
                        items={[
                          { name: 'Basic' },
                          { name: 'Max' },
                          { name: 'Catalytic' },
                        ]}
                      />
                    }
                  >
                    <Text>LTV</Text>
                  </WithHint>
                </HStack>
              </Th>
              <Th borderColor="border">
                <HStack>
                  <WithHint
                    hint={
                      <IndicatorTextBox
                        items={[{ name: 'Fee' }, { name: 'Threshold' }]}
                      />
                    }
                  >
                    <Text>Liquidation</Text>
                  </WithHint>
                </HStack>
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {allCollateralParams?.map((params) => {
              const collateralPool = collateralPoolsMap.get(
                params.collateralDenom
              )
              const collateralMetadata = denomsMetadataMap?.get(
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
                    <Text ps="10" pt="1" color="gray.500" fontSize="xs">
                      Price: ${formatNumberSuitable(collateralPool?.price)}
                    </Text>
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
                          decorator: collateralMetadata?.symbol,
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
                          decorator: collateralMetadata?.symbol,
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
              <Button
                variant="outline"
                onClick={() => router.push('/governance')}
              >
                Propose to Register Collateral
              </Button>
            </Center>
          </Stack>
        </Center>
      ) : undefined}
    </>
  )
}
