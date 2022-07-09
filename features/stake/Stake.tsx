import { typeUrls } from '@merlionzone/merlionjs'
import { useQueryDelegatorValidators } from '@/hooks/query'
import {
  Box,
  Button,
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
import { useToast } from '@/hooks/useToast'
import { useAccountAddress, useConnectWallet, useMerlionClient } from '@/hooks'
import { TransactionToast } from '@/components/TransactionToast'
import { ValidatorTable } from './Table'
import { Stats } from './Stats'

export const Staking = () => {
  const toast = useToast()
  const merlionClient = useMerlionClient()
  const [keyword, setKeyword] = useState('')
  const { connected, walletType } = useConnectWallet()
  const address = useAccountAddress()
  const { data } = useQueryDelegatorValidators(address?.mer())
  const isMetaMask = useMemo(() => walletType === 'metamask', [walletType])
  const hasValidators = useMemo(
    () => data && data.validators.length > 0,
    [data]
  )

  const onWithdraw = () => {
    if (!connected) {
      toast({
        title: 'Please connect wallet first',
        status: 'warning',
      })
      return
    }

    if (isMetaMask || !hasValidators) return

    const msgs = data!.validators.map(({ operatorAddress }) => ({
      typeUrl: typeUrls.MsgWithdrawDelegatorReward,
      value: {
        delegatorAddress: address!.mer(),
        validatorAddress: operatorAddress,
      },
    }))

    const receiptPromise = merlionClient!.signAndBroadcast(address!.mer(), msgs)

    toast({
      render: ({ onClose }) => (
        <TransactionToast
          title="Withdraw all rewards"
          receiptPromise={receiptPromise}
          onClose={onClose}
        />
      ),
    })
  }

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
          <Button
            variant="primary"
            rounded="full"
            display={isMetaMask ? 'none' : 'unset'}
            disabled={isMetaMask || !hasValidators}
            onClick={onWithdraw}
          >
            Withdraw all rewards
          </Button>
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
