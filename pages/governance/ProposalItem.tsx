import { Divider, Flex, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import NextLink from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Proposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import { BsArrowRight } from 'react-icons/bs'
import { decodeContent, getTime } from '../proposal/utils'

export function ProposalItem({ proposal }: { proposal: Proposal }) {
  const content = decodeContent(proposal.content!)

  const submitTime = useMemo(() => {
    return formatDistanceToNow(getTime(proposal.submitTime!), {
      addSuffix: true,
    })
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
              # {proposal.proposalId.toNumber()}
            </Text>
            <Divider orientation="vertical" h="3" />
            <Text fontSize="xs">{content.type}</Text>
          </HStack>
          <Text fontSize="lg" fontWeight="medium">
            {content.title}
          </Text>
          <Text fontSize="xs" color="brand">
            {submitTime}
          </Text>
        </Stack>
        <Icon as={BsArrowRight} w="6" h="6" mr="4" />
      </Flex>
    </NextLink>
  )
}
