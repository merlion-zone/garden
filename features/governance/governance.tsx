import {
  Button,
  Container,
  Divider,
  Flex,
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
import {
  Proposal,
  ProposalStatus,
  TextProposal,
} from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import { useMemo, useState } from 'react'
import NextLink from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useQueryProposals } from '@/hooks/query'

function ProposalItem({ proposal }: { proposal: Proposal }) {
  const { type, content } = useMemo(() => {
    switch (proposal.content!.typeUrl) {
      case '/cosmos.gov.v1beta1.TextProposal':
        return {
          type: 'Text Proposal',
          content: TextProposal.decode(proposal.content!.value),
        }
      default:
        return { type: 'Unknown', content: { title: '', description: '' } } // TODO
    }
  }, [proposal])

  const submitTime = useMemo(() => {
    return formatDistanceToNow(
      Number(proposal.submitTime!.seconds) * 1000 +
        Number(proposal.submitTime!.nanos),
      { addSuffix: true }
    )
  }, [proposal.submitTime])

  return (
    <NextLink href={`/proposal/${proposal.proposalId.toNumber()}`}>
      <Flex
        as="a"
        w="full"
        py="4"
        px="4"
        rounded="lg"
        bg="bg-surface"
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
      >
        <Stack>
          <HStack>
            <Text fontSize="xs" color="brand">
              {proposal.proposalId.toNumber()}
            </Text>
            <Divider orientation="vertical" h="3" />
            <Text fontSize="xs">{type}</Text>
          </HStack>
          <Text fontSize="lg" fontWeight="medium">
            {content.title}
          </Text>
          <Text fontSize="xs" color="brand">
            {submitTime}
          </Text>
        </Stack>
        <Button variant="ghost">Vote</Button>
      </Flex>
    </NextLink>
  )
}

export function Governance() {
  const [status, setStatus] = useState<ProposalStatus>(0)
  const { data } = useQueryProposals(status, '', '')
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
            <StatNumber>500</StatNumber>
          </Stat>
          <Stat p="6">
            <StatLabel>Maximum deposit period</StatLabel>
            <StatNumber>7 days</StatNumber>
          </Stat>
          <Stat p="6">
            <StatLabel>Voting period</StatLabel>
            <StatNumber>7 days</StatNumber>
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
      </Container>
    </>
  )
}
