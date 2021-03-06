import {
  Box,
  BoxProps,
  Button,
  Center,
  Container,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  chakra,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import QRCodeSVG from 'qrcode.react'
import { useState } from 'react'

import { NFTAssetTable, TokenAssetTable } from '@/components/AssetTable'
import { CopyAddressIcon } from '@/components/CopyAddress'
import { HintButton } from '@/components/Hint'
import config from '@/config'
import { useAccountAddress } from '@/hooks'
import { useBalance, useDisplayPrice } from '@/hooks/query'
import { formatNumberSuitable } from '@/utils'

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
  const router = useRouter()

  const address = useAccountAddress()

  const { data: lionDisplayPrice } = useDisplayPrice(config.denom)
  const { data: merDisplayPrice } = useDisplayPrice(config.merDenom)

  const { balance: lionBalance } = useBalance(address?.mer(), config.denom)
  const { balance: merBalance } = useBalance(address?.mer(), config.merDenom)

  const [addressTabIndex, setAddressTabIndex] = useState(0)

  const [assetsTabIndex, setAssetsTabIndex] = useState(0)

  const qrCodeBg = useColorModeValue('white', 'black')
  const qrCodeFg = useColorModeValue('black', 'white')

  const AddressQRCode = ({
    addr,
    addrType,
  }: {
    addr: string
    addrType: string
  }) => (
    <HStack>
      <QRCodeSVG
        value={addr}
        size={96}
        bgColor={qrCodeBg}
        fgColor={qrCodeFg}
        level={'L'}
        includeMargin={false}
        renderAs="svg"
      />
      <Stack width="calc(100% - 104px)" ps="4">
        <Text fontSize="xs" color="subtle">
          Your {addrType} address
        </Text>
        <Text fontSize="sm">
          {addr} <CopyAddressIcon addr={addr} />
        </Text>
      </Stack>
    </HStack>
  )

  return (
    <Container maxW="9xl" py="8" height="full">
      <Stack spacing={{ base: '8', lg: '6' }}>
        <Stack>
          <Heading
            size={useBreakpointValue({ base: 'xs', lg: 'sm' })}
            fontWeight="medium"
          >
            Portfolio
          </Heading>
        </Stack>
        <Stack spacing={{ base: '5', lg: '6' }}>
          <SimpleGrid columns={{ base: 1, md: 4 }} gap="6">
            <Card>
              <Text>Balance</Text>
              <HStack align="baseline">
                <Text fontSize="3xl">
                  {formatNumberSuitable(lionBalance, config.denomDecimals)}
                </Text>
                <Text fontSize="4xl">LION</Text>
              </HStack>
              <HStack gap="4">
                <Text
                  fontSize="md"
                  color="gray.500"
                  bg="bg-canvas"
                  px="2"
                  py="1"
                  borderRadius="4"
                >
                  <chakra.span fontWeight="bold">
                    $
                    {formatNumberSuitable(
                      lionBalance &&
                        lionDisplayPrice &&
                        lionDisplayPrice.mul(lionBalance),
                      config.denomDecimals,
                      2
                    )}
                  </chakra.span>
                  &nbsp;
                  <chakra.span>USD</chakra.span>
                </Text>
                <Text fontSize="md" color="gray.500">
                  <chakra.span fontWeight="bold">
                    1 LION = ${formatNumberSuitable(lionDisplayPrice)}
                  </chakra.span>
                  &nbsp;
                  <chakra.span>USD</chakra.span>
                </Text>
              </HStack>
              <HStack align="baseline">
                <Text fontSize="3xl">
                  {formatNumberSuitable(merBalance, config.merDenomDecimals)}
                </Text>
                <Text fontSize="4xl">USM</Text>
                <HintButton
                  hint="USM is the stablecoin pegged to $USD"
                  ariaLabel="Stablecoin Tooltip"
                ></HintButton>
              </HStack>
              <HStack gap="4">
                <Text
                  fontSize="md"
                  color="gray.500"
                  bg="bg-canvas"
                  px="2"
                  py="1"
                  borderRadius="4"
                >
                  <chakra.span fontWeight="bold">
                    $
                    {formatNumberSuitable(
                      merBalance &&
                        merDisplayPrice &&
                        merDisplayPrice.mul(merBalance),
                      config.merDenomDecimals,
                      2
                    )}
                  </chakra.span>
                  &nbsp;
                  <chakra.span>USD</chakra.span>
                </Text>
                <Text fontSize="md" color="gray.500">
                  <chakra.span fontWeight="bold">
                    1 USM = ${formatNumberSuitable(merDisplayPrice)}
                  </chakra.span>
                  <chakra.span>&nbsp;USD</chakra.span>
                </Text>
              </HStack>
            </Card>
            <Card>
              <Text>veNFT</Text>
              <Text color="gray.500">You have no voting escrowed NFT yet.</Text>
              <Center height="full">
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push('/venft')
                  }}
                >
                  Deposit
                </Button>
              </Center>
            </Card>
            <Card>
              <Text>Staking</Text>
              <Text color="gray.500">
                You have not staked any $LION amount.
              </Text>
              <Center height="full">
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push(`/stake`)
                  }}
                >
                  Stake
                </Button>
              </Center>
            </Card>
            <Card>
              <Text>
                Address
                <HintButton
                  hint={
                    'EVM address and Cosmos address are both derived from the same wallet of yours. You can use either of them seamlessly in different scenarios.'
                  }
                ></HintButton>
              </Text>
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
                      <AddressQRCode
                        addr={address?.eth() || ''}
                        addrType="EVM"
                      ></AddressQRCode>
                    </TabPanel>
                    <TabPanel>
                      <AddressQRCode
                        addr={address?.mer() || ''}
                        addrType="Cosmos"
                      ></AddressQRCode>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Stack>
            </Card>
          </SimpleGrid>

          <SimpleGrid columns={1} minHeight="full" pb={{ base: '0', lg: '8' }}>
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
