import {
  Box,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'

import { AmountDisplay } from '@/components/NumberDisplay'
import config from '@/config'
import { useAccountAddress } from '@/hooks'
import { useMerlionQuery } from '@/hooks/query'

import { useValidators } from './hooks'

export function Stats() {
  const address = useAccountAddress()
  const { totalBonded, data } = useValidators(address?.mer())

  const boxShadow = useColorModeValue('sm', 'sm-dark')
  const headingSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const { data: infoData } = useMerlionQuery('tendermint', 'abciInfo')

  const totalRewards = data
    .map(({ rewards }) => Number(rewards.amount))
    .reduce((prev, current) => {
      return prev + current
    }, 0)

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: '5', md: '6' }}>
      <Box
        px={{ base: '4', md: '6' }}
        py={{ base: '5', md: '6' }}
        bg="bg-surface"
        borderRadius="lg"
        boxShadow={boxShadow}
      >
        <Stack>
          <Text fontSize="sm" color="muted">
            Height
          </Text>
          <Heading size={headingSize}>{infoData?.lastBlockHeight}</Heading>
        </Stack>
      </Box>
      <Box
        px={{ base: '4', md: '6' }}
        py={{ base: '5', md: '6' }}
        bg="bg-surface"
        borderRadius="lg"
        boxShadow={boxShadow}
      >
        <Stack>
          <Text fontSize="sm" color="muted">
            Bonded Coins
          </Text>
          <HStack alignItems="baseline">
            <Heading size={headingSize}>
              <AmountDisplay value={totalBonded} />
            </Heading>
            <Text>{config.displayDenom}</Text>
          </HStack>
        </Stack>
      </Box>
      <Box
        px={{ base: '4', md: '6' }}
        py={{ base: '5', md: '6' }}
        bg="bg-surface"
        borderRadius="lg"
        boxShadow={boxShadow}
      >
        <Stack>
          <Text fontSize="sm" color="muted">
            Total Rewards
          </Text>
          <HStack alignItems="baseline">
            <Heading size={headingSize}>
              <AmountDisplay value={totalRewards} precision={2} />
            </Heading>
            <Text>{config.displayDenom}</Text>
          </HStack>
        </Stack>
      </Box>
    </SimpleGrid>
  )
}
