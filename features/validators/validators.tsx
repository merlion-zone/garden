import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Container,
  Heading,
  Stack,
  Tab,
  TabList,
  Tabs,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { typeUrls } from '@merlionzone/merlionjs/dist'
import { useMemo, useState } from 'react'

import { WithdrawAllModal } from '@/components/TransactionModals'
import { TransactionToast } from '@/components/TransactionToast'
import { useAccountAddress, useConnectWallet } from '@/hooks'
import { BondStatusString, useQueryDelegatorValidators } from '@/hooks/query'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'

import { ValidatorTable } from './table'

export function Validators() {
  const [status, setStatus] = useState<BondStatusString>('BOND_STATUS_BONDED')

  const toast = useToast()
  const { connected } = useConnectWallet()
  const { sendTx, isSendReady } = useSendCosmTx()
  const address = useAccountAddress()
  const { data } = useQueryDelegatorValidators(address?.mer())
  const validatorAddresses = useMemo(
    () => data?.validators.map(({ operatorAddress }) => operatorAddress) ?? [],
    [data]
  )
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

    if (!hasValidators) return

    const msgs = data!.validators.map(({ operatorAddress }) => ({
      typeUrl: typeUrls.MsgWithdrawDelegatorReward,
      value: {
        delegatorAddress: address!.mer(),
        validatorAddress: operatorAddress,
      },
    }))

    const receiptPromise = sendTx(msgs)

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
          <WithdrawAllModal
            validatorAddresses={validatorAddresses}
            variant="primary"
            rounded="full"
          />
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
