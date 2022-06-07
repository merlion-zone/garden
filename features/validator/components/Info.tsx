import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Link,
  Stack,
  Text,
  useColorModeValue,
  Wrap,
} from '@chakra-ui/react'
import { FaDiscord, FaLink, FaTelegram, FaTwitter } from 'react-icons/fa'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { useValidator } from '../hooks'
import { Card, UserAvatar } from './Card'

export interface InfoProps {
  address?: string
}

export function Info({ address }: InfoProps) {
  const { data } = useValidator(address)

  return (
    <Card>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={{ base: '3', md: '10' }}
        align="flex-start"
      >
        {/* TODO */}
        <UserAvatar
          name={data?.description!.moniker}
          src=""
          isVerified={!data?.description?.identity}
        />

        <Box>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading
              size="md"
              fontWeight="extrabold"
              letterSpacing="tight"
              marginEnd="6"
            >
              {data?.description!.moniker}
            </Heading>
            <Button
              size="sm"
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
            </Button>
          </Flex>
          <Text mt="2">Slogan Slogan Slogan Slogan</Text>
          <Wrap shouldWrapChildren my="4" spacing="4">
            <Link as={HStack} href={data?.description!.website || undefined}>
              <Icon as={FaLink} color="gray.400" />
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={useColorModeValue('gray.600', 'gray.300')}
              >
                {data?.description!.website || 'No website'}
              </Text>
            </Link>
            <Link as={HStack} spacing="1">
              <Icon as={FaTwitter} color="gray.400" />
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={useColorModeValue('gray.600', 'gray.300')}
              >
                Merlion
              </Text>
            </Link>
            <Link as={HStack} spacing="1">
              <Icon as={FaDiscord} color="gray.400" />
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={useColorModeValue('gray.600', 'gray.300')}
              >
                Merlion
              </Text>
            </Link>
            <Link as={HStack} spacing="1">
              <Icon as={FaTelegram} color="gray.400" />
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={useColorModeValue('gray.600', 'gray.300')}
              >
                Merlion
              </Text>
            </Link>
          </Wrap>
          <Box fontSize="sm" noOfLines={2}>
            Description description description description description
            description description description description description
            description.
          </Box>
        </Box>
      </Stack>
    </Card>
  )
}
