import { Container, Stack } from '@chakra-ui/react'
import type { Proposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import { formatDistanceToNow } from 'date-fns'
import { getTime } from '../utils'
import { Step } from './Step'

const ZERO_TIME = -62135596800000

export interface ProposalProgressProps {
  proposal?: Proposal
}

export function ProposalProgress({ proposal }: ProposalProgressProps) {
  if (!proposal) return null // TODO: add loading status

  const now = Date.now()
  const submitTime = getTime(proposal.submitTime!)
  const depositEndTime = getTime(proposal.depositEndTime!)
  const votingStartTime = getTime(proposal.votingStartTime!)
  const votingEndTime = getTime(proposal.votingEndTime!)

  return (
    <Container
      as="section"
      maxW="5xl"
      pt={{ base: '3', md: '5' }}
      pb={{ base: '2', md: '4' }}
    >
      <Stack
        spacing="0"
        direction={{ base: 'column', md: 'row' }}
        rounded="lg"
        bg="bg-surface"
        py="10"
        px={{ base: '10', md: '0' }}
      >
        <Step
          cursor="pointer"
          title="Created"
          description={formatDistanceToNow(submitTime, { addSuffix: true })}
          isCompleted={submitTime <= now}
          isFirstStep={true}
          isLastStep={false}
        />
        <Step
          cursor="pointer"
          title="Deposit Period Ends"
          description={formatDistanceToNow(
            votingStartTime === ZERO_TIME
              ? depositEndTime
              : votingStartTime > now
              ? depositEndTime
              : votingStartTime,
            { addSuffix: true }
          )}
          isCompleted={votingStartTime <= now || depositEndTime <= now}
          isFirstStep={false}
          isLastStep={false}
        />
        <Step
          cursor="pointer"
          title="Voting Period Starts"
          description={
            votingStartTime !== ZERO_TIME
              ? formatDistanceToNow(votingStartTime, {
                  addSuffix: true,
                })
              : ''
          }
          isCompleted={votingStartTime > ZERO_TIME && votingStartTime <= now}
          isFirstStep={false}
          isLastStep={false}
        />
        <Step
          cursor="pointer"
          title="Voting Period Ends"
          description={
            votingEndTime !== ZERO_TIME
              ? formatDistanceToNow(votingEndTime, { addSuffix: true })
              : ''
          }
          isCompleted={votingStartTime > ZERO_TIME && votingEndTime <= now}
          isFirstStep={false}
          isLastStep={true}
        />
      </Stack>
    </Container>
  )
}
