import {
  Text,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  IconButton,
  HStack,
  Stack,
  Center,
  Button,
} from '@chakra-ui/react'
import { useBalance, useLionPrice, useMerPrice } from '@/hooks/query'
import config from '@/config'
import { useAccountAddress } from '@/hooks'
import { AmountDisplay } from '@/components/AmountDisplay'
import { CgArrowsExchange } from 'react-icons/cg'
import Avvvatars from 'avvvatars-react'
import { BigNumber } from 'ethers'

export const TokenAssetTable = () => {
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

  return (
    <>
      <TableContainer>
        <Table variant="simple" size="lg">
          <Thead>
            <Tr>
              <Th borderColor="border">Name</Th>
              <Th borderColor="border" isNumeric>
                Balance
              </Th>
              <Th borderColor="border" isNumeric>
                Send
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td borderColor="border">
                <HStack>
                  <Avvvatars value="LION" style="shape" />
                  <Text>LION</Text>
                </HStack>
              </Td>
              <Td borderColor="border" isNumeric>
                <Text>
                  <AmountDisplay
                    value={lionBalance}
                    decimals={config.denomDecimals}
                  ></AmountDisplay>
                </Text>
                <Text fontSize="xs" color="subtle">
                  <AmountDisplay
                    value={
                      lionBalance &&
                      BigNumber.from(lionBalance).mul(lionPrice).toString()
                    }
                    decimals={config.denomDecimals}
                    prefix="$"
                    suffix=" USD"
                  ></AmountDisplay>
                </Text>
              </Td>
              <Td borderColor="border" isNumeric>
                <IconButton
                  variant="ghost"
                  icon={<CgArrowsExchange fontSize="2rem" />}
                  aria-label="Send"
                />
              </Td>
            </Tr>
            <Tr>
              <Td borderColor="border">
                <HStack>
                  <Avvvatars value="USM" style="shape" />
                  <Text>USM</Text>
                </HStack>
              </Td>
              <Td borderColor="border" isNumeric>
                <Text>
                  <AmountDisplay
                    value={merBalance}
                    decimals={config.merDenomDecimals}
                  ></AmountDisplay>
                </Text>
                <Text fontSize="xs" color="subtle">
                  <AmountDisplay
                    value={
                      merBalance &&
                      BigNumber.from(merBalance).mul(merPrice).toString()
                    }
                    decimals={config.merDenomDecimals}
                    prefix="$"
                    suffix=" USD"
                  ></AmountDisplay>
                </Text>
              </Td>
              <Td borderColor="border" isNumeric>
                <IconButton
                  variant="ghost"
                  icon={<CgArrowsExchange fontSize="2rem" />}
                  aria-label="Send"
                />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
      <Center height="full" mt="12">
        <Button variant="outline">Add Token</Button>
      </Center>
    </>
  )
}
