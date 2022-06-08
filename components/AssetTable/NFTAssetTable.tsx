import {
  Center,
  Text,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  Button,
  Stack,
  Box,
} from '@chakra-ui/react'

export const NFTAssetTable = () => {
  return (
    <>
      <TableContainer>
        <Table variant="simple" size="lg">
          <Thead>
            <Tr>
              <Th borderColor="border">Name</Th>
              <Th borderColor="border" isNumeric>
                Send
              </Th>
            </Tr>
          </Thead>
          <Tbody></Tbody>
        </Table>
      </TableContainer>
      <Center height="full" mt="12">
        <Stack>
          <Text color="subtle" fontSize="xl">
            You do not own any NFT.
          </Text>
          <Center pt="4">
            <Button variant="outline">Add NFT</Button>
          </Center>
        </Stack>
      </Center>
    </>
  )
}
