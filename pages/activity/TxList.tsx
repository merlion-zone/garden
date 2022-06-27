import { useState } from 'react'
import {
  Box,
  Button,
  ButtonGroup,
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
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import { parseCosmTxs, getMsgDescComponent, useTxs } from '@/hooks/query'
import { useAccountAddress } from '@/hooks'
import { dayjs } from '@/utils'

export const TxList = () => {
  const isMobile = useBreakpointValue({ base: true, md: false })
  const msgTypeColor = useColorModeValue('gray.600', 'gray.300')

  const [page, setPage] = useState(1)
  const limit = 10
  const offset = (page - 1) * limit

  const account = useAccountAddress()
  const { data: txsResponse } = useTxs(
    account && {
      message: {
        sender: account.mer(),
      },
    },
    page,
    limit
  )
  const total = txsResponse?.pagination?.total.toNumber() || 0
  const cosmTxs = txsResponse && parseCosmTxs(txsResponse)

  return (
    <>
      <TableContainer>
        <Table variant="simple" size="lg">
          <Thead>
            <Tr>
              <Th borderColor="border">Date</Th>
              <Th borderColor="border">Action</Th>
              <Th borderColor="border">Status</Th>
              <Th borderColor="border"></Th>
            </Tr>
          </Thead>
          <Tbody color={msgTypeColor} fontSize="sm">
            {cosmTxs?.map((cosmTx) => {
              return (
                <Tr key={cosmTx.txhash}>
                  <Td borderColor="border">
                    <Text>{cosmTx.timestamp}</Text>
                    <Text color="gray.500" fontSize="xs">
                      {dayjs(cosmTx.timestamp).fromNow()}
                    </Text>
                  </Td>
                  <Td borderColor="border">
                    <Stack>
                      {cosmTx.msgs?.map((msg, i) => {
                        const MsgDesc = getMsgDescComponent(msg)
                        return (
                          <Box key={i}>
                            <Text fontWeight="500">{msg.type}</Text>
                            <Text color="gray.500" fontSize="xs">
                              <MsgDesc msg={msg} />
                            </Text>
                          </Box>
                        )
                      })}
                    </Stack>
                  </Td>
                  <Td borderColor="border">
                    {!cosmTx.code ? 'Success' : 'Failure'}
                  </Td>
                  <Td borderColor="border"></Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>

      <Box px={{ base: '4', md: '6' }} pt="5" pb="5">
        <HStack spacing="3" justify="space-between">
          {!isMobile && (
            <Text color="muted" fontSize="sm">
              Showing {Math.min(offset + 1, total)} to&nbsp;
              {Math.min(offset + limit, total)} of {total} transactions
            </Text>
          )}
          <ButtonGroup
            spacing="3"
            justifyContent="space-between"
            width={{ base: 'full', md: 'auto' }}
            variant="outline"
          >
            <Button
              onClick={() => {
                setPage(page - 1)
              }}
              isDisabled={page === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                setPage(page + 1)
              }}
              isDisabled={!total || page === Math.ceil(total / limit)}
            >
              Next
            </Button>
          </ButtonGroup>
        </HStack>
      </Box>
    </>
  )
}
