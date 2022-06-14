import type { FC } from 'react'
import { useRouter } from 'next/router'
import { Box, Container, Grid, GridItem, Stack } from '@chakra-ui/react'
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
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(5, 1fr)' }}
          gap="8"
        >
          <GridItem colSpan={3}>
            <Stack spacing="8">
              <Info address={query.address as string} />
              <Commission />
              <Delegators />
              <Address />
            </Stack>
          </GridItem>
          <GridItem colSpan={2}>
            <Stack spacing="8">
              <Delegation />
              <Rewards />
            </Stack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}
