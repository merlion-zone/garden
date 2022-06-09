import { formatCoin, validatorToDelegatorAddress } from '@/utils'
import {
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
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi'
import { useDelegations } from '../hooks'
import { Card } from './Card'

export function Delegators() {
  const { query } = useRouter()
  const { data } = useDelegations(query.address as string)
  const walletAddress = useMemo(
    () => query.address && validatorToDelegatorAddress(query.address as string),
    [query]
  )

  return (
    <Card>
      <Stack spacing="5" divider={<StackDivider />}>
        <Stack spacing="1">
          <HStack spacing="1">
            <Text fontSize="lg" fontWeight="medium">
              Delegators
            </Text>
            <Tooltip hasArrow label="Just show top 10" fontSize="md">
              <Text display="inline-flex" alignItems="center">
                <Icon as={HiOutlineQuestionMarkCircle} fontSize="lg" />
              </Text>
            </Tooltip>
          </HStack>
          <Text fontSize="sm" color="muted"></Text>
        </Stack>
        <List spacing={2}>
          {data?.map(({ delegation, balance }) => (
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
      </Stack>
    </Card>
  )
}
