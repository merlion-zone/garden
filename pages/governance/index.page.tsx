import {
  Button,
  Container,
  Heading,
  HStack,
  List,
  ListItem,
  Stack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  Tabs,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { ProposalStatus } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import { useMemo, useState } from 'react'
import NextLink from 'next/link'
import { useQueryGovParams, useQueryProposals } from '@/hooks/query'
import { ProposalItem } from './ProposalItem'
import { AmountDisplay } from '@/components/NumberDisplay'
import config from '@/config'
import { dayjs } from '@/utils'
import { getTime } from '../proposal/utils'

const limit = 30

export default function Governance() {
  const { data: depositParamsData } = useQueryGovParams('deposit')
  const { data: votingParamsData } = useQueryGovParams('voting')
  const [status, setStatus] = useState<ProposalStatus>(0)
  const [pageIndex, setPageIndex] = useState(0)
  const { data } = useQueryProposals(status, '', '', {
    reverse: true,
    offset: limit * pageIndex,
    limit,
    countTotal: true,
  })

  const hasPrev = useMemo(() => limit * pageIndex > 0, [pageIndex])

  const hasNext = useMemo(() => {
    const total = data?.pagination?.total.toNumber() ?? 0
    return total > limit * (pageIndex + 1)
  }, [data, pageIndex])

  const handlePrevPage = () => {
    if (!hasPrev) return
    setPageIndex((prev) => prev - 1)
  }

  const handleNextPage = () => {
    if (!hasNext) return
    setPageIndex((prev) => prev + 1)
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
              Governance
            </Heading>
            <Text color="muted">{/*  */}</Text>
          </Stack>
          <NextLink href="/proposal/new" passHref>
            <Button as="a" variant="primary" rounded="full">
              New proposal
            </Button>
          </NextLink>
        </Stack>
      </Container>
      <Container maxW="5xl">
        <StatGroup bg="bg-surface" rounded="lg">
          <Stat p="6">
            <StatLabel>Minimum deposit</StatLabel>
            <StatNumber>
              <AmountDisplay
                value={
                  depositParamsData?.depositParams?.minDeposit[0].amount ?? 0
                }
                decimals={config.denomDecimals}
              />
            </StatNumber>
          </Stat>
          <Stat p="6">
            <StatLabel>Maximum deposit period</StatLabel>
            <StatNumber>
              {dayjs
                .duration(
                  getTime(depositParamsData?.depositParams?.maxDepositPeriod)
                )
                .asDays()
                .toFixed(0)}{' '}
              days
            </StatNumber>
          </Stat>
          <Stat p="6">
            <StatLabel>Voting period</StatLabel>
            <StatNumber>
              {dayjs
                .duration(getTime(votingParamsData?.votingParams?.votingPeriod))
                .asDays()
                .toFixed(0)}{' '}
              days
            </StatNumber>
          </Stat>
        </StatGroup>
      </Container>
      <Container maxW="5xl" py={{ base: '4', md: '8' }}>
        <Tabs variant="with-line" onChange={(v) => setStatus(v)}>
          <TabList>
            <Tab>All</Tab>
            <Tab>Deposit</Tab>
            <Tab>Voting</Tab>
            <Tab>Passed</Tab>
            <Tab>Rejected</Tab>
          </TabList>
        </Tabs>
      </Container>
      <Container maxW="5xl" pb={{ base: '4', md: '8' }}>
        <List spacing="4">
          {(data?.proposals.length ?? 0) <= 0 && (
            <ListItem
              py="4"
              px="4"
              rounded="lg"
              bg="bg-surface"
              justifyContent="space-between"
              alignItems="center"
            >
              No proposals.
            </ListItem>
          )}
          {data?.proposals.map((p, i) => (
            <ListItem key={p.proposalId.toNumber()}>
              <ProposalItem proposal={p} />
            </ListItem>
          ))}
        </List>
        <HStack mt="8" justifyContent="end" spacing="4">
          <Text>
            Showing {limit * pageIndex + 1} to{' '}
            {Math.min(
              limit * pageIndex + limit,
              data?.pagination?.total.toNumber() ?? 0
            )}{' '}
            of {data?.pagination?.total.toNumber()} proposals
          </Text>
          <HStack justifyContent="end">
            <Button size="sm" disabled={!hasPrev} onClick={handlePrevPage}>
              Prev
            </Button>
            <Button size="sm" disabled={!hasNext} onClick={handleNextPage}>
              Next
            </Button>
          </HStack>
        </HStack>
      </Container>
    </>
  )
}
