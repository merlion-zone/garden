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
import { Dec, proto } from '@merlionzone/merlionjs'
import Avvvatars from 'avvvatars-react'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { WithHint } from '@/components/Hint'
import config from '@/config'
import {
  useAllBackingParams,
  useAllBackingPools,
  useDenomsMetadataMap,
  useDisplayPrices,
} from '@/hooks/query'
import { formatNumberSuitable, shortenDenom } from '@/utils'

import { IndicatorTextBox } from './IndicatorBar'

export const BackingPoolsTable = () => {
  const router = useRouter()
  const { data: allBackingParams } = useAllBackingParams()
  const { data: allBackingPools } = useAllBackingPools()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()
  const { data: prices } = useDisplayPrices(
    allBackingPools?.map((pool) => [pool.backing?.denom])
  )

  const backingPoolsMap = useMemo(() => {
    const map = new Map<string, proto.maker.PoolBacking & { price?: Dec }>()
    allBackingPools?.forEach((pool, i) => {
      if (pool.backing) {
        map.set(pool.backing.denom, {
          ...pool,
          price: prices?.[i],
        })
      }
    })
    return map
  }, [allBackingPools, prices])

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
                          { name: 'Backing' },
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
                        items={[{ name: 'USM' }, { name: 'Backing' }]}
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
                        items={[
                          { name: 'Mint' },
                          { name: 'Burn' },
                          { name: 'Buyback' },
                          { name: 'Reback' },
                        ]}
                      />
                    }
                  >
                    <Text>Fee</Text>
                  </WithHint>
                </HStack>
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {allBackingParams?.map((params) => {
              const backingPool = backingPoolsMap.get(params.backingDenom)
              const backingMetadata = denomsMetadataMap?.get(
                params.backingDenom
              )

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
                    <Text ps="10" pt="1" color="gray.500" fontSize="xs">
                      Price: ${formatNumberSuitable(backingPool?.price)}
                    </Text>
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
                          decorator: backingMetadata?.symbol,
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
                          decorator: backingMetadata?.symbol,
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
              <Button
                variant="outline"
                onClick={() => router.push('/governance')}
              >
                Propose to Register Backing
              </Button>
            </Center>
          </Stack>
        </Center>
      ) : undefined}
    </>
  )
}
