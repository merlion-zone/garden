import {
  Box,
  BoxProps,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Tab,
  Table,
  TableCaption,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import { useBalance, useLionPrice, useMerPrice } from '@/hooks/query'
import { useAccountAddress } from '@/hooks'
import config from '@/config'
import { AmountDisplay } from '@/components/AmountDisplay'
import { BigNumber } from 'ethers'
import { NFTAssetTable, TokenAssetTable } from '@/components/AssetTable'
import { useState } from 'react'

const Card = (props: BoxProps) => (
  <Box
    minH="3xs"
    p="4"
    bg="bg-surface"
    boxShadow={useColorModeValue('sm', 'sm-dark')}
    borderRadius="lg"
    {...props}
  />
)

export default function Portfolio() {
  const address = useAccountAddress()

  const lionPrice = useLionPrice()
  const merPrice = useMerPrice()

  const { balance: lionBalance } = useBalance(
    address?.mer() || '',
    config.denom
  )
  const { balance: merBalance } = useBalance(
    address?.mer() || '',
    config.merDenom
  )

  const [tabIndex, setTabIndex] = useState(0)

  return (
    <Container maxW="9xl" py="8" height="full">
      <Stack spacing={{ base: '8', lg: '6' }} height="full">
        <Stack>
          <Heading
            size={useBreakpointValue({ base: 'xs', lg: 'sm' })}
            fontWeight="medium"
          >
            Portfolio
          </Heading>
        </Stack>
        <Stack spacing={{ base: '5', lg: '6' }} height="full">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
            <Card>
              <Text>Balance</Text>
              <HStack align="baseline">
                <Text fontSize="3xl">
                  <AmountDisplay
                    value={lionBalance}
                    decimals={config.denomDecimals}
                  ></AmountDisplay>
                </Text>
                <Text fontSize="4xl">LION</Text>
              </HStack>
              <HStack gap="4">
                <HStack
                  fontSize="md"
                  color="gray.500"
                  bg="bg-canvas"
                  px="2"
                  py="1"
                  borderRadius="4"
                >
                  <Text fontWeight="bold">
                    <AmountDisplay
                      value={
                        lionBalance &&
                        BigNumber.from(lionBalance).mul(lionPrice).toString()
                      }
                      decimals={config.denomDecimals}
                      prefix="$"
                    ></AmountDisplay>
                  </Text>
                  <Text>USD</Text>
                </HStack>
                <HStack fontSize="md" color="gray.500">
                  <Text fontWeight="bold">
                    1 LION = &nbsp;
                    <AmountDisplay value={lionPrice} prefix="$"></AmountDisplay>
                  </Text>
                  <Text>USD</Text>
                </HStack>
              </HStack>
              <HStack align="baseline">
                <Text fontSize="3xl">
                  <AmountDisplay
                    value={merBalance}
                    decimals={config.merDenomDecimals}
                  ></AmountDisplay>
                </Text>
                <Text fontSize="4xl">USM</Text>
              </HStack>
              <HStack gap="4">
                <HStack
                  fontSize="md"
                  color="gray.500"
                  bg="bg-canvas"
                  px="2"
                  py="1"
                  borderRadius="4"
                >
                  <Text fontWeight="bold">
                    <AmountDisplay
                      value={
                        merBalance &&
                        BigNumber.from(merBalance).mul(merPrice).toString()
                      }
                      decimals={config.merDenomDecimals}
                      prefix="$"
                    ></AmountDisplay>
                  </Text>
                  <Text>USD</Text>
                </HStack>
                <HStack fontSize="md" color="gray.500">
                  <Text fontWeight="bold">
                    1 USM = &nbsp;
                    <AmountDisplay value={merPrice} prefix="$"></AmountDisplay>
                  </Text>
                  <Text>USD</Text>
                </HStack>
              </HStack>
            </Card>
            <Card>
              <Text>veNFT</Text>
              <Text color="gray.500">You have no voting escrowed NFT yet.</Text>
              <Center height="full">
                <Button variant="outline">Deposit</Button>
              </Center>
            </Card>
            <Card>
              <Text>Staking</Text>
              <Text color="gray.500">
                You have not staked any $LION amount.
              </Text>
              <Center height="full">
                <Button variant="outline">Stake</Button>
              </Center>
            </Card>
          </SimpleGrid>

          <SimpleGrid columns={1} height="full">
            <Card minH="2xs">
              <HStack gap="4">
                <Text fontSize="3xl">Assets</Text>
                <Tabs
                  variant="with-line"
                  onChange={(index) => setTabIndex(index)}
                >
                  <TabList>
                    <Tab pb="3" px="4">
                      Token
                    </Tab>
                    <Tab pb="3" px="4">
                      NFT
                    </Tab>
                  </TabList>
                </Tabs>
              </HStack>

              <Tabs variant="with-line" index={tabIndex}>
                <TabPanels>
                  <TabPanel px="0">
                    <TokenAssetTable></TokenAssetTable>
                  </TabPanel>
                  <TabPanel px="0">
                    <NFTAssetTable></NFTAssetTable>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Card>
          </SimpleGrid>
        </Stack>
      </Stack>
    </Container>
  )
}
