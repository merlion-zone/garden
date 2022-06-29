import { useMemo } from 'react'
import {
  Box,
  Container,
  Divider,
  Flex,
  HStack,
  Link,
  Stack,
  Tag,
  Text,
} from '@chakra-ui/react'
import type { Proposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import { decodeContent, getTime, ProposalType } from '../utils'
import { formatDistanceToNow } from 'date-fns'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { formatCoin, shortenAddress } from '@/utils'
import type { CommunityPoolSpendProposal } from 'cosmjs-types/cosmos/distribution/v1beta1/distribution'

export interface ProposalContentProps {
  proposal?: Proposal
}

export function ProposalContent({ proposal }: ProposalContentProps) {
  const content = useMemo(
    () => proposal && decodeContent(proposal.content!),
    [proposal]
  )

  const amount = useMemo(
    () =>
      content?.type === ProposalType.SPEND
        ? formatCoin((content as CommunityPoolSpendProposal).amount[0])
        : null,
    [content]
  )

  const status = useMemo(() => {
    if (!proposal) return 'Loading'

    switch (proposal.status) {
      case 1:
        return 'Deposit'
      case 2:
        return 'Voting'
      case 3:
        return 'Passed'
      case 4:
        return 'Rejected'
      case 5:
        return 'Faliled'
    }
  }, [proposal])

  return (
    <>
      <Container
        as="section"
        maxW="5xl"
        pt={{ base: '3', md: '5' }}
        pb={{ base: '2', md: '4' }}
      >
        <Flex direction={{ base: 'column', md: 'row' }}>
          <Box flex="1" rounded="lg" bg="bg-surface" p="8">
            <HStack justifyContent="space-between" alignItems="start" mb="2">
              <Stack w={{ base: 'full', md: 'auto' }} spacing="0">
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
                {status}
              </Tag>
            </HStack>
            <Text fontSize="sm">{content?.description}</Text>
            <Text fontSize="sm">{content?.value}</Text>
          </Box>
          {content?.type === ProposalType.SPEND && (
            <Box
              ml={{ base: '0', md: '8' }}
              mt={{ base: '5', md: '0' }}
              rounded="lg"
              bg="bg-surface"
              p="8"
              w={{ base: 'full', md: 'xs' }}
            >
              <Stack spacing="3">
                <Stack spacing="1">
                  <Text fontSize="sm" fontWeight="medium">
                    Recipient
                  </Text>
                  {/* TODO */}
                  <Link href="#" fontSize="sm" color="brand">
                    <HStack spacing="1">
                      <Text>
                        {
                          shortenAddress(
                            (content as CommunityPoolSpendProposal).recipient
                          )[1]
                        }
                      </Text>
                      <HiOutlineExternalLink />
                    </HStack>
                  </Link>
                </Stack>
                <Stack spacing="1">
                  <Text fontSize="sm" fontWeight="medium">
                    Amount
                  </Text>
                  <Text fontSize="sm">
                    {amount?.amount}
                    &nbsp;
                    {amount?.denom.toUpperCase()}
                  </Text>
                </Stack>
              </Stack>
            </Box>
          )}
        </Flex>
      </Container>
    </>
  )
}
