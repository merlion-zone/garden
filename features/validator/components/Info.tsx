import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
  Link,
  Spacer,
  Stack,
  Text,
  Wrap,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaDiscord, FaLink, FaTelegram, FaTwitter } from 'react-icons/fa'
import { HiOutlineExternalLink } from 'react-icons/hi'

import { useValidator } from '../hooks'
import { Card, UserAvatar } from './Card'

export interface InfoProps {
  validatorAddress?: string
}

export function Info({ validatorAddress }: InfoProps) {
  const { data } = useValidator(validatorAddress)
  const linkColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Card>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={{ base: '3', md: '10' }}
        align="flex-start"
      >
        <Box w="full">
          <Flex w="full" alignItems="center">
            <UserAvatar
              mr="4"
              name={data?.description!.moniker}
              src="" // TODO
              isVerified={!!data?.description?.identity}
            />

            <Heading
              size={{ base: 'xs', sm: 'md' }}
              fontWeight="extrabold"
              letterSpacing="tight"
              marginEnd="6"
            >
              {data?.description!.moniker}
            </Heading>
            <Spacer />
            {/* <Button
              size={{ base: 'xs', sm: 'sm' }}
              variant="outline"
              rightIcon={
                <Icon
                  as={HiOutlineExternalLink}
                  color="gray.400"
                  marginStart="-1"
                />
              }
            >
              Learn more
            </Button> */}
          </Flex>
          {/* TODO */}
          <Text mt="2"></Text>
          <Wrap shouldWrapChildren my="4" spacing="4">
            {data?.description!.website && (
              <Link as={HStack} href={data!.description!.website}>
                <Icon as={FaLink} color="gray.400" />
                <Text fontSize="sm" fontWeight="medium" color={linkColor}>
                  {data.description!.website}
                </Text>
              </Link>
            )}
            {/* TODO */}
            {/* <Link as={HStack} spacing="1">
              <Icon as={FaTwitter} color="gray.400" />
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={useColorModeValue('gray.600', 'gray.300')}
              >
              </Text>
            </Link>
            <Link as={HStack} spacing="1">
              <Icon as={FaDiscord} color="gray.400" />
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={useColorModeValue('gray.600', 'gray.300')}
              >
              </Text>
            </Link>
            <Link as={HStack} spacing="1">
              <Icon as={FaTelegram} color="gray.400" />
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={useColorModeValue('gray.600', 'gray.300')}
              >
              </Text>
            </Link> */}
          </Wrap>
          <Box fontSize="sm" noOfLines={2}>
            {/* TODO */}
          </Box>
        </Box>
      </Stack>
    </Card>
  )
}
