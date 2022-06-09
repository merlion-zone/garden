import { useState } from 'react'
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
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import { useBalance, useLionPrice, useMerPrice } from '@/hooks/query'
import { useAccountAddress } from '@/hooks'
import config from '@/config'
import { BigNumber } from 'ethers'
import { AmountDisplay } from '@/components/AmountDisplay'
import { NFTAssetTable, TokenAssetTable } from '@/components/AssetTable'
import { Hint } from '@/components/Hint'
import QRCodeSVG from 'qrcode.react'
import { shortenAddress } from '@/utils'

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

  const qrCodeBg = useColorModeValue('white', 'black')
  const qrCodeFg = useColorModeValue('black', 'white')

  const [addressTabIndex, setAddressTabIndex] = useState(0)

  const [assetsTabIndex, setAssetsTabIndex] = useState(0)

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
          <SimpleGrid columns={{ base: 1, md: 4 }} gap="6">
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
                <Hint
                  hint="USM is the stablecoin pegged to $USD"
                  ariaLabel="Stablecoin Tooltip"
                ></Hint>
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
            <Card>
              <Text>Address</Text>
              <Stack mt="6">
                <Tabs
                  size="sm"
                  variant="enclosed"
                  onChange={(index) => setAddressTabIndex(index)}
                >
                  <TabList>
                    <Tab>EVM</Tab>
                    <Tab>Cosmos</Tab>
                  </TabList>
                </Tabs>
                <Tabs index={addressTabIndex}>
                  <TabPanels>
                    <TabPanel>
                      <HStack>
                        <QRCodeSVG
                          value={address?.eth() || ''}
                          size={96}
                          bgColor={qrCodeBg}
                          fgColor={qrCodeFg}
                          level={'L'}
                          includeMargin={false}
                        />
                        <Stack width="calc(100% - 104px)" ps="4">
                          <Text fontSize="xs" color="subtle">
                            Your EVM address
                          </Text>
                          <Text fontSize="sm">{address?.eth()}</Text>
                        </Stack>
                      </HStack>
                    </TabPanel>
                    <TabPanel>
                      <HStack>
                        <QRCodeSVG
                          value={address?.mer() || ''}
                          size={96}
                          bgColor={qrCodeBg}
                          fgColor={qrCodeFg}
                          level={'L'}
                          includeMargin={false}
                        />
                        <Stack width="calc(100% - 104px)" ps="4">
                          <Text fontSize="xs" color="subtle">
                            Your Cosmos address
                          </Text>
                          <Text fontSize="sm">{address?.mer()}</Text>
                        </Stack>
                      </HStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Stack>
            </Card>
          </SimpleGrid>

          <SimpleGrid columns={1} height="full">
            <Card minH="2xs">
              <HStack gap="4">
                <Text fontSize="3xl">Assets</Text>
                <Tabs
                  variant="with-line"
                  onChange={(index) => setAssetsTabIndex(index)}
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

              <Tabs variant="with-line" index={assetsTabIndex}>
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
