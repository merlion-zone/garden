import { useMemo } from 'react'
import {
  Box,
  Container,
  Divider,
  HStack,
  Stack,
  Tag,
  Text,
} from '@chakra-ui/react'
import type { Proposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import { decodeContent, getTime } from '../utils'
import { formatDistanceToNow } from 'date-fns'

export interface ProposalContentProps {
  proposal?: Proposal
}

export function ProposalContent({ proposal }: ProposalContentProps) {
  const content = useMemo(
    () => proposal && decodeContent(proposal.content!),
    [proposal]
  )

  return (
    <Container
      as="section"
      maxW="5xl"
      pt={{ base: '3', md: '5' }}
      pb={{ base: '2', md: '4' }}
    >
      <Box rounded="lg" bg="bg-surface" p="8">
        <HStack justifyContent="space-between" alignItems="start" mb="2">
          <Stack spacing="0">
            <HStack>
              <Text fontSize="xs" color="brand">
                # {proposal?.proposalId.toNumber()}
              </Text>
              <Divider orientation="vertical" h="3" />
              <Text fontSize="xs">{content?.type}</Text>
            </HStack>
            <Text fontSize="xl" fontWeight="medium">
              {content?.title}
            </Text>
            <Text fontSize="xs" color="brand" mb="4">
              {proposal &&
                formatDistanceToNow(getTime(proposal.submitTime!), {
                  addSuffix: true,
                })}
            </Text>
          </Stack>
          <Tag rounded="full" variant="solid" colorScheme="brand">
            Deposit
          </Tag>
        </HStack>
        <Text fontSize="sm">{content?.description}</Text>
      </Box>
    </Container>
  )
}
