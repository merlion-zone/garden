import { Fragment } from 'react'
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
  Center,
  Button,
  useDisclosure,
} from '@chakra-ui/react'
import {
  DenomMetadata,
  useBalance,
  useDenomsMetadataMap,
  useDisplayCoinPrice,
} from '@/hooks/query'
import config from '@/config'
import { CgArrowsExchange } from 'react-icons/cg'
import Avvvatars from 'avvvatars-react'
import { formatNumberSuitable } from '@/utils'
import { useAccountAddress } from '@/hooks'
import { useCachedDenoms } from '@/hooks/useCachedDenoms'
import { AddTokenModal } from '@/components/AssetTable/AddTokenModal'

const TokenAssetRow = ({ denomMetadata }: { denomMetadata: DenomMetadata }) => {
  const address = useAccountAddress()
  const { displayPrice } = useDisplayCoinPrice(denomMetadata.base)
  const { balance } = useBalance(address?.mer(), denomMetadata.base)

  return (
    <>
      <Td borderColor="border">
        <HStack>
          <Avvvatars value={denomMetadata.base} style="shape" />
          <Text>{denomMetadata.symbol}</Text>
        </HStack>
      </Td>
      <Td borderColor="border" isNumeric>
        <Text>
          {formatNumberSuitable(balance, denomMetadata.displayExponent)}
        </Text>
        <Text fontSize="xs" color="subtle">
          $
          {formatNumberSuitable(
            balance && displayPrice && displayPrice.mul(balance),
            denomMetadata.displayExponent,
            2
          )}
          &nbsp;USD
        </Text>
      </Td>
      <Td borderColor="border" isNumeric>
        <IconButton
          variant="ghost"
          icon={<CgArrowsExchange fontSize="2rem" />}
          aria-label="Send"
        />
      </Td>
    </>
  )
}

export const TokenAssetTable = () => {
  const {
    isOpen: isAddTokenModalOpen,
    onOpen: onAddTokenModalOpen,
    onClose: onAddTokenModalClose,
  } = useDisclosure()
  const {
    isOpen: isSendCoinModalOpen,
    onOpen: onSendCoinModalOpen,
    onClose: onSendCoinModalClose,
  } = useDisclosure()

  const { cachedDenoms } = useCachedDenoms()
  const { data: denomsMetadata } = useDenomsMetadataMap()

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
            {cachedDenoms.map((denom) => {
              const denomMetadata = denomsMetadata?.get(denom)
              return denomMetadata ? (
                <Tr key={denom}>
                  <TokenAssetRow denomMetadata={denomMetadata} />
                </Tr>
              ) : (
                <Fragment key={denom} />
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
      <Center height="full" mt="12">
        <Button variant="outline" onClick={onAddTokenModalOpen}>
          Add Token
        </Button>
      </Center>

      <AddTokenModal
        isOpen={isAddTokenModalOpen}
        onClose={onAddTokenModalClose}
      />
    </>
  )
}
