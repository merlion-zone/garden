import { Container, Heading, Stack, useBreakpointValue } from '@chakra-ui/react'
import { useRouter } from 'next/router'

import { DepositModal, VoteModal } from '@/components/TransactionModals'
import { useQueryProposal } from '@/hooks/query'

import { ProposalContent } from './Content'
import { ProposalProgress } from './Progress'
import { ProposalVotes } from './Votes'

export default function ProposalDetail() {
  const { query } = useRouter()
  const { data } = useQueryProposal(query.id as string)

  return (
    <>
      <Container
        maxW="5xl"
        as="section"
        pt={{ base: '4', md: '8' }}
        pb={{ base: '3', md: '5' }}
      >
        <Stack
          spacing="4"
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
        >
          <Heading
            size={useBreakpointValue({ base: 'xs', md: 'sm' })}
            fontWeight="medium"
          >
            Proposal detail
          </Heading>
          {data?.proposal!.status === 1 && (
            <DepositModal proposalId={query.id as string} />
          )}
          {data?.proposal!.status === 2 && (
            <VoteModal proposalId={query.id as string} />
          )}
        </Stack>
      </Container>
      <ProposalContent proposal={data?.proposal} />
      <ProposalVotes proposal={data?.proposal} />
      <ProposalProgress proposal={data?.proposal} />
    </>
  )
}
