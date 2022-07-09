import {
  HStack,
  Icon,
  Link,
  List,
  ListIcon,
  ListItem,
  Stack,
  StackDivider,
  Text,
  useToast,
} from '@chakra-ui/react'
import { toBase64 } from '@cosmjs/encoding'
import { Address as Addr } from '@merlionzone/merlionjs'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { FiKey, FiLink, FiUser } from 'react-icons/fi'
import { HiOutlineDuplicate, HiOutlineExternalLink } from 'react-icons/hi'

import { useCopyToClipboard } from '@/hooks'

import { useValidator } from '../hooks'
import { Card } from './Card'

export function Address() {
  const toast = useToast()
  const { query } = useRouter()
  const { data } = useValidator(query.address as string)
  const copy = useCopyToClipboard()[1]

  const walletAddress = useMemo(() => {
    try {
      return data ? new Addr(data.operatorAddress).mer() : ''
    } catch (error) {
      return ''
    }
  }, [data])

  const copyText = async (value?: string) => {
    if (!value) return

    const success = await copy(value)

    toast({
      title: success ? 'Copied!' : 'Copy failed!',
      status: success ? 'success' : 'error',
    })
  }

  return (
    <Card>
      <Stack spacing="5" divider={<StackDivider />}>
        <Stack spacing="1">
          <Text fontSize="lg" fontWeight="medium">
            Address
          </Text>
          <Text fontSize="sm" color="muted"></Text>
        </Stack>
        <List spacing="2">
          <ListItem>
            <HStack spacing="1">
              <ListIcon as={FiUser} textColor="brand" fontSize="3xl" />
              <Stack display="inline-flex" spacing="0.5">
                <Text fontSize="sm" fontWeight="medium">
                  Wallet address
                </Text>
                <Link as={HStack} spacing="1" isExternal fontSize="xs">
                  <Text w={{ base: '56', sm: 'unset' }} noOfLines={1}>
                    {walletAddress}
                  </Text>
                  <Icon as={HiOutlineExternalLink} />
                </Link>
              </Stack>
            </HStack>
          </ListItem>
          <ListItem>
            <HStack spacing="1">
              <ListIcon as={FiLink} textColor="brand" fontSize="3xl" />
              <Stack display="inline-flex" spacing="0.5">
                <Text fontSize="sm" fontWeight="medium">
                  Operator address
                </Text>
                <HStack
                  as="button"
                  spacing="1"
                  fontSize="xs"
                  onClick={() => copyText(data?.operatorAddress)}
                >
                  <Text w={{ base: '56', sm: 'unset' }} noOfLines={1}>
                    {data?.operatorAddress}
                  </Text>
                  <Icon as={HiOutlineDuplicate} />
                </HStack>
              </Stack>
            </HStack>
          </ListItem>
          <ListItem>
            <HStack spacing="1">
              <ListIcon as={FiKey} textColor="brand" fontSize="3xl" />
              <Stack display="inline-flex" spacing="0.5">
                <HStack>
                  <Text fontSize="sm" fontWeight="medium">
                    Consensus Public Key
                  </Text>
                  {/* <Text fontSize="xs">{data?.consensusPubkey!.typeUrl}</Text> */}
                </HStack>
                <HStack
                  as="button"
                  spacing="1"
                  fontSize="xs"
                  onClick={() =>
                    copyText(JSON.stringify(data?.consensusPubkey))
                  }
                >
                  <Text w={{ base: '56', sm: 'unset' }} noOfLines={1}>
                    {toBase64(data?.consensusPubkey!.value ?? new Uint8Array())}
                  </Text>
                  <Icon as={HiOutlineDuplicate} />
                </HStack>
              </Stack>
            </HStack>
          </ListItem>
        </List>
      </Stack>
    </Card>
  )
}
