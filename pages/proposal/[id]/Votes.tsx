import {
  Box,
  Container,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import type { Proposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import numeral from 'numeral'

export interface ProposalVotesProps {
  proposal?: Proposal
}

export function ProposalVotes({ proposal }: ProposalVotesProps) {
  const yes = Number(proposal?.finalTallyResult!.yes ?? 0)
  const no = Number(proposal?.finalTallyResult!.no ?? 0)
  const noWithVote = Number(proposal?.finalTallyResult!.noWithVeto ?? 0)
  const abstain = Number(proposal?.finalTallyResult!.abstain ?? 0)
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
            <Text>{numeral(yes && yes / sum).format('0.00%')}</Text>
          </HStack>
          <Text>{proposal?.finalTallyResult!.yes} LION</Text>
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
            <Text>{numeral(no && no / sum).format('0.00%')}</Text>
          </HStack>
          <Text>{proposal?.finalTallyResult!.no} LION</Text>
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
              {numeral(noWithVote && noWithVote / sum).format('0.00%')}
            </Text>
          </HStack>
          <Text>{proposal?.finalTallyResult!.noWithVeto} LION</Text>
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
            <Text>{numeral(abstain && abstain / sum).format('0.00%')}</Text>
          </HStack>
          <Text>{proposal?.finalTallyResult!.abstain} LION</Text>
        </Stack>
      </SimpleGrid>
    </Container>
  )
}
