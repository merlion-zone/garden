import { Button, Flex, Heading } from '@chakra-ui/react'
import { useRouter } from 'next/router'

export const Logo = () => {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      colorScheme="default"
      onClick={() => router.push('/')}
    >
      <Flex>
        <Heading as="h4" size="sm" fontSize="xl" pr={2}>
          Merlion
        </Heading>
        <Heading as="h4" size="sm" fontSize="xl" fontWeight="200">
          Garden
        </Heading>
      </Flex>
    </Button>
  )
}
