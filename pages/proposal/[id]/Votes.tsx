import {
  Box,
  Container,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Dec } from '@merlionzone/merlionjs'
import { Proposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { DecDisplay } from '@/components/NumberDisplay'
import config from '@/config'
import { useQueryProposalTallyResult } from '@/hooks/query'

export interface ProposalVotesProps {
  proposal?: Proposal
}

export function ProposalVotes({ proposal }: ProposalVotesProps) {
  const { query } = useRouter()
  const isVoting = proposal?.status === 2

  const { data } = useQueryProposalTallyResult(
    isVoting ? (query.id as string) : undefined
  )

  const { yes, no, noWithVote, abstain } = useMemo(() => {
    const tally = isVoting ? data?.tally : proposal?.finalTallyResult
    const yes = new Dec(tally?.yes ?? 0).divPow(config.denomDecimals).toNumber()
    const no = new Dec(tally?.no ?? 0).divPow(config.denomDecimals).toNumber()
    const noWithVote = new Dec(tally?.noWithVeto ?? 0)
      .divPow(config.denomDecimals)
      .toNumber()
    const abstain = new Dec(tally?.noWithVeto ?? 0)
      .divPow(config.denomDecimals)
      .toNumber()

    return {
      yes,
      no,
      noWithVote,
      abstain,
    }
  }, [data, isVoting, proposal])

  const sum = yes + no + noWithVote + abstain

  return (
    <Container
      as="section"
      maxW="5xl"
      pt={{ base: '3', md: '5' }}
      pb={{ base: '2', md: '4' }}
    >
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: '5', md: '6' }}>
        <Stack
          px={{ base: '2', md: '4' }}
          py={{ base: '3', md: '4' }}
          bg="bg-surface"
          borderRadius="lg"
        >
          <HStack justifyContent="space-between" spacing="0">
            <HStack>
              <Box w="4" h="4" rounded="full" bgColor="green" />
              <Text fontWeight="medium">Yes</Text>
            </HStack>
            <Text>
              <DecDisplay value={sum && yes / sum} precision={2} percentage />
            </Text>
          </HStack>
          <Text>
            <DecDisplay value={yes} suffix={` ${config.displayDenom}`} />
          </Text>
        </Stack>
        <Stack
          px={{ base: '2', md: '4' }}
          py={{ base: '3', md: '4' }}
          bg="bg-surface"
          borderRadius="lg"
        >
          <HStack justifyContent="space-between" spacing="0">
            <HStack>
              <Box w="4" h="4" rounded="full" bgColor="red" />
              <Text fontWeight="medium">No</Text>
            </HStack>
            <Text>
              <DecDisplay value={sum && no / sum} precision={2} percentage />
            </Text>
          </HStack>
          <Text>
            <DecDisplay value={no} suffix={` ${config.displayDenom}`} />
          </Text>
        </Stack>
        <Stack
          px={{ base: '2', md: '4' }}
          py={{ base: '3', md: '4' }}
          bg="bg-surface"
          borderRadius="lg"
        >
          <HStack justifyContent="space-between" spacing="0">
            <HStack>
              <Box w="4" h="4" rounded="full" bgColor="orange" />
              <Text fontWeight="medium">No with vote</Text>
            </HStack>
            <Text>
              <DecDisplay
                value={sum && noWithVote / sum}
                precision={2}
                percentage
              />
            </Text>
          </HStack>
          <Text>
            <DecDisplay value={noWithVote} suffix={` ${config.displayDenom}`} />
          </Text>
        </Stack>
        <Stack
          px={{ base: '2', md: '4' }}
          py={{ base: '3', md: '4' }}
          bg="bg-surface"
          borderRadius="lg"
        >
          <HStack justifyContent="space-between" spacing="0">
            <HStack>
              <Box w="4" h="4" rounded="full" bgColor="gray" />
              <Text fontWeight="medium">Abstain</Text>
            </HStack>
            <Text>
              <DecDisplay
                value={sum && abstain / sum}
                precision={2}
                percentage
              />
            </Text>
          </HStack>
          <Text>
            <DecDisplay value={abstain} suffix={` ${config.displayDenom}`} />
          </Text>
        </Stack>
      </SimpleGrid>
    </Container>
  )
}
