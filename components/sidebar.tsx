import NextLink from 'next/link'
import {
  Box,
  Button,
  Center,
  Divider,
  HStack,
  Icon,
  Link,
  Spacer,
  Stack,
  StackProps,
  Text,
} from '@chakra-ui/react'
import { FiBookOpen, FiHome, FiUser } from 'react-icons/fi'
import { useRouter } from 'next/router'

export function Sidebar(props: StackProps) {
  const { pathname } = useRouter()

  return (
    <Stack
      bg="bg-surface"
      maxW={{ base: 'full', sm: 'xs' }}
      minW="xs"
      pb={{ base: '6', sm: '8' }}
      px={{ base: '4', sm: '6' }}
      {...props}
    >
      <Stack spacing="8" shouldWrapChildren>
        {/* <Logo /> */}
        <Box>
          <Center h="16">
            <Text fontSize="xl" fontWeight="semibold">
              Merlion
            </Text>
            &nbsp;Garden
          </Center>
          <Divider px={{ base: '4', sm: '6' }} ml={{ base: '-4', sm: '-6' }} />
        </Box>
        <Stack spacing="1">
          <NextLink href="/" passHref>
            <Button
              as="a"
              variant="ghost"
              justifyContent="start"
              aria-current={pathname === '/' && 'page'}
            >
              <HStack spacing="3">
                <Icon as={FiHome} boxSize="6" color="subtle" />
                <Text>Home</Text>
              </HStack>
            </Button>
          </NextLink>
        </Stack>
        <Stack>
          <Text fontSize="sm" color="subtle" fontWeight="medium">
            Staking
          </Text>
          <Stack spacing="1">
            <NextLink href="/validators" passHref>
              <Button
                as="a"
                variant="ghost"
                justifyContent="start"
                aria-current={pathname === '/validators' && 'page'}
              >
                <HStack spacing="3">
                  <Icon as={FiUser} boxSize="6" color="subtle" />
                  <Text>Validators</Text>
                </HStack>
              </Button>
            </NextLink>
          </Stack>
        </Stack>
      </Stack>
      <Spacer />
      <Stack>
        <Link isExternal href="//docs.merlion.zone">
          <HStack>
            <FiBookOpen />
            <Text>Documentation</Text>
          </HStack>
        </Link>
        <Divider />
      </Stack>
    </Stack>
  )
}
