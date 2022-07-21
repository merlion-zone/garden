import {
  Button,
  Flex,
  HStack,
  Icon,
  Link,
  List,
  ListItem,
  Stack,
  StackDivider,
  Tag,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi'

import { useQueryValidatorDelegations } from '@/hooks/query'
import { formatCoin, validatorToDelegatorAddress } from '@/utils'

import { Card } from './Card'

export interface DelegationsProps {
  validatorAddress?: string
}

const limit = 5

export function Delegations({ validatorAddress }: DelegationsProps) {
  const [offset, setOffset] = useState(0)
  const { data } = useQueryValidatorDelegations(validatorAddress, {
    limit,
    offset,
    countTotal: true,
  })
  const walletAddress = useMemo(() => {
    try {
      return (
        validatorAddress &&
        validatorToDelegatorAddress(validatorAddress as string)
      )
    } catch (error) {}
  }, [validatorAddress])

  const hasPrev = useMemo(() => offset > 0, [offset])

  const hasNext = useMemo(() => {
    const total = data?.pagination?.total.toNumber() ?? 0
    return total > limit * (offset / limit + 1)
  }, [data, offset])

  const onNext = () => {
    setOffset((offset) => offset + limit)
  }
  const onPrev = () => {
    setOffset((offset) => offset - limit)
  }

  return (
    <Card>
      <Stack spacing="5" divider={<StackDivider />}>
        <Stack spacing="1">
          <HStack spacing="1">
            <Text fontSize="lg" fontWeight="medium">
              Delegations
            </Text>
            <Tooltip hasArrow label="Just show top 10" fontSize="md">
              <Text display="inline-flex" alignItems="center">
                <Icon as={HiOutlineQuestionMarkCircle} fontSize="lg" />
              </Text>
            </Tooltip>
          </HStack>
          <Text fontSize="sm" color="muted"></Text>
        </Stack>
        <Stack spacing="4">
          <List spacing={2}>
            {data?.delegationResponses.map(({ delegation, balance }) => (
              <ListItem key={delegation!.delegatorAddress}>
                <Flex justifyContent="space-between">
                  <HStack>
                    <Link as={HStack} isExternal>
                      <Text
                        w={{ base: '32', sm: '40', md: 'unset' }}
                        noOfLines={1}
                      >
                        {delegation!.delegatorAddress}
                      </Text>
                    </Link>
                    {delegation!.delegatorAddress === walletAddress && (
                      <Tag size="sm">Self</Tag>
                    )}
                  </HStack>
                  <Text>{formatCoin(balance!).amount}</Text>
                </Flex>
              </ListItem>
            ))}
          </List>
          <HStack justifyContent="end">
            <Text>
              Showing {offset + 1} to{' '}
              {Math.min(
                offset + limit,
                data?.pagination?.total.toNumber() ?? 0
              )}{' '}
              of {data?.pagination?.total.toNumber()} delegations
            </Text>
            <Button size="xs" disabled={!hasPrev} onClick={onPrev}>
              Prev
            </Button>
            <Button size="xs" disabled={!hasNext} onClick={onNext}>
              Next
            </Button>
          </HStack>
        </Stack>
      </Stack>
    </Card>
  )
}
