import { useMemo, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Container,
  Heading,
  Stack,
  Tab,
  TabList,
  Tabs,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import {
  BondStatusString,
  useAccountAddress,
  useConnectWallet,
  useMerlionClient,
} from '@/hooks'
import { ValidatorTable } from './table'
import { useQueryDelegatorValidators, useQueryValidators } from '@/hooks/query'
import { useToast } from '@/hooks/useToast'
import { typeUrls } from '@merlionzone/merlionjs/dist'
import { TransactionToast } from '@/components/TransactionToast'

export function Validators() {
  const [status, setStatus] = useState<BondStatusString>('BOND_STATUS_BONDED')

  const toast = useToast()
  const merlionClient = useMerlionClient()
  const { connected, walletType } = useConnectWallet()
  const address = useAccountAddress()
  const { data } = useQueryDelegatorValidators(address?.mer())
  const isMetaMask = useMemo(() => walletType === 'metamask', [walletType])
  const hasValidators = useMemo(
    () => data && data.validators.length > 0,
    [data]
  )

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
              Staking & Rewards
            </Heading>
            <Text color="muted">Stake Lion and earn rewards</Text>
          </Stack>
          <Button
            variant="primary"
            rounded="full"
            display={isMetaMask ? 'none' : 'unset'}
            isDisabled={isMetaMask || !hasValidators}
            onClick={onWithdraw}
          >
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
      <Container as="section" maxW="5xl" pb={{ base: '4', md: '8' }}>
        <ValidatorTable status={status} />
      </Container>
    </>
  )
}
