import { useConnectWallet } from '@/hooks'
import {
  Box,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import { useValidators } from './hooks'

export function Stats() {
  const boxShadow = useColorModeValue('sm', 'sm-dark')
  const headingSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const { account } = useConnectWallet()
  const { totalBonded } = useValidators(account)

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
          <Heading size={headingSize}>10000</Heading>
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
            Bonded coins
          </Text>
          <Heading size={headingSize}>{totalBonded}</Heading>
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
            Locked coins
          </Text>
          <Heading size={headingSize}>1000</Heading>
        </Stack>
      </Box>
    </SimpleGrid>
  )
}
