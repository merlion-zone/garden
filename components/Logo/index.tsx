import { Flex, Heading, Spacer, Text } from '@chakra-ui/react'

export const Logo = () => {
  return (
    <Flex>
      <Heading as="h4" size="sm" fontSize="xl" pr={2}>
        Merlion
      </Heading>
      <Heading as="h4" size="sm" fontSize="xl" fontWeight="200">
        Garden
      </Heading>
    </Flex>
  )
}
