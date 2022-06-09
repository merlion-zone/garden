import type { FC } from 'react'
import { useRouter } from 'next/router'
import { Box, Container, Flex, Stack } from '@chakra-ui/react'
import {
  Info,
  Commission,
  Delegators,
  Address,
  Delegation,
  Rewards,
} from './components'

export const Validator: FC = () => {
  const { query } = useRouter()

  return (
    <Box as="section" py={{ base: '4', lg: '16' }}>
      <Container maxW="6xl">
        <Flex direction={{ base: 'column', xl: 'row' }} alignItems="start">
          <Stack flex="3" spacing="8" alignItems="center">
            <Info address={query.address as string} />
            <Commission />
            <Delegators />
            <Address />
          </Stack>
          <Stack
            flex="2"
            w="full"
            ml={{ base: '0', xl: '8' }}
            mt={{ base: '8', xl: '0' }}
            spacing="8"
          >
            <Delegation />
            <Rewards />
          </Stack>
        </Flex>
      </Container>
    </Box>
  )
}
