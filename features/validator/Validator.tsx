import { Box, Container, Grid, GridItem, Stack } from '@chakra-ui/react'
import { Address as Addr } from '@merlionzone/merlionjs'
import { useRouter } from 'next/router'
import { FC, useEffect, useMemo } from 'react'

import {
  Address,
  Commission,
  Delegation,
  Delegations,
  Info,
  Rewards,
} from './components'

export const Validator: FC = () => {
  const { query, replace } = useRouter()
  const address: string | undefined = useMemo(
    () => query.address as any,
    [query]
  )

  useEffect(() => {
    if (!address) return
    try {
      new Addr(address)
    } catch (error) {
      replace('/404')
    }
  })

  return (
    <Box as="section" py={{ base: '4', lg: '16' }}>
      <Container maxW="6xl">
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(5, 1fr)' }}
          gap="8"
        >
          <GridItem colSpan={{ base: 1, lg: 3 }}>
            <Stack spacing="8">
              <Info validatorAddress={address} />
              <Commission validatorAddress={address} />
              <Delegations validatorAddress={address} />
              <Address />
            </Stack>
          </GridItem>
          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <Stack spacing="8">
              <Delegation validatorAddress={address} />
              <Rewards validatorAddress={address} />
            </Stack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}
