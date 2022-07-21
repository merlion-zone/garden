import {
  Box,
  Container,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { FiSearch } from 'react-icons/fi'

import { WithdrawAllModal } from '@/components/TransactionModals'
import { useAccountAddress } from '@/hooks'
import { useQueryDelegatorValidators } from '@/hooks/query'

import { Stats } from './Stats'
import { ValidatorTable } from './Table'

export const Staking = () => {
  const address = useAccountAddress()
  const [keyword, setKeyword] = useState('')
  const { data } = useQueryDelegatorValidators(address?.mer())
  const validatorAddresses = useMemo(
    () => data?.validators.map(({ operatorAddress }) => operatorAddress) ?? [],
    [data]
  )
  const hasValidators = useMemo(
    () => data && data.validators.length > 0,
    [data]
  )

  return (
    <>
      <Container
        as="section"
        maxW="5xl"
        pt={{ base: '6', md: '10' }}
        pb={{ base: '4', md: '8' }}
      >
        <Stack
          spacing="4"
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
        >
          <Stack spacing="1">
            <Heading
              size={useBreakpointValue({ base: 'xs', md: 'sm' })}
              fontWeight="medium"
            >
              My staking
            </Heading>
            <Text color="muted">{/*  */}</Text>
          </Stack>
          <WithdrawAllModal
            variant="primary"
            rounded="full"
            disabled={!hasValidators}
            validatorAddresses={validatorAddresses}
          />
        </Stack>
      </Container>
      <Container maxW="5xl" pb={{ base: '4', md: '8' }}>
        <Stats />
      </Container>
      <Container maxW="5xl" pb={{ base: '4', md: '8' }}>
        <Box
          bg="bg-surface"
          boxShadow={{ base: 'none', md: useColorModeValue('sm', 'sm-dark') }}
          borderRadius={useBreakpointValue({ base: 'none', md: 'lg' })}
        >
          <Stack spacing="5">
            <Box px={{ base: '4', md: '6' }} pt="5">
              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
              >
                <Text fontSize="lg" fontWeight="medium">
                  My validators
                </Text>
                <InputGroup maxW="xs">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="muted" boxSize="5" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search"
                    onChange={(v) => setKeyword(v.target.value)}
                  />
                </InputGroup>
              </Stack>
            </Box>
            <Box overflowX="auto">
              <ValidatorTable keyword={keyword} />
            </Box>
          </Stack>
        </Box>
      </Container>
    </>
  )
}
