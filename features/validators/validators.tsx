import { useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Container,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Tab,
  TabList,
  Tabs,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiSearch } from 'react-icons/fi'
import { Layout } from '@/components'
import { BondStatusString } from './hooks'
import { ValidatorTable } from './table'

export function Validators() {
  const [status, setStatus] = useState<BondStatusString>('BOND_STATUS_BONDED')
  const [keyword, setKeyword] = useState('')

  const onChange = (i: number) => {
    if (i === 0) {
      if (status === 'BOND_STATUS_BONDED') return
      setStatus('BOND_STATUS_BONDED')
    }

    if (i === 1) {
      if (status === 'BOND_STATUS_UNBONDED') return
      setStatus('BOND_STATUS_UNBONDED')
    }
  }

  return (
    <Layout title="Merlion | Validators">
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
              Staking & Rewards
            </Heading>
            <Text color="muted">Stake Lion and earn rewards</Text>
          </Stack>
          <Button variant="primary" rounded="full">
            Withdraw all rewards
          </Button>
        </Stack>
      </Container>
      <Container as="section" maxW="5xl" pb={{ base: '4', md: '8' }}>
        <Alert status="success" variant="solid" rounded="lg">
          <AlertIcon />
          <AlertTitle>Tip:</AlertTitle>
          <AlertDescription>Stake Lion and earn rewards</AlertDescription>
        </Alert>
      </Container>
      <Container as="section" maxW="5xl" pb={{ base: '4', md: '6' }}>
        <Tabs variant="with-line" onChange={onChange} defaultValue="active">
          <TabList>
            <Tab value="active">Active</Tab>
            <Tab value="inactive">Inactive</Tab>
          </TabList>
        </Tabs>
      </Container>
      <Container as="section" maxW="5xl">
        <Box
          bg="bg-surface"
          boxShadow={useColorModeValue('sm', 'sm-dark')}
          borderRadius="lg"
        >
          <Stack spacing="5">
            <Box px={{ base: '4', md: '6' }} pt="5">
              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
              >
                <Text fontSize="lg" fontWeight="medium">
                  Validators
                </Text>
                <InputGroup maxW="xs">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="muted" boxSize="5" />
                  </InputLeftElement>
                  <Input
                    // bg="bg-muted"
                    placeholder="Search"
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </InputGroup>
              </Stack>
            </Box>
            <Box overflowX="auto">
              <ValidatorTable status={status} keyword={keyword} />
            </Box>
          </Stack>
        </Box>
      </Container>
    </Layout>
  )
}
