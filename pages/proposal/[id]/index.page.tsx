import {
  Button,
  Container,
  Heading,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useQueryProposal } from '@/hooks/query'
import { ProposalContent } from './Content'
import { ProposalVotes } from './Votes'
import { ProposalProgress } from './Progress'
import { Deposit } from './Deposit'
import { Vote } from './Vote'

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
            Porposal detail
          </Heading>
          {data?.proposal!.status === 1 && <Deposit />}
          {data?.proposal!.status === 2 && <Vote />}
        </Stack>
      </Container>
      <ProposalContent proposal={data?.proposal} />
      <ProposalVotes proposal={data?.proposal} />
      <ProposalProgress proposal={data?.proposal} />
    </>
  )
}
