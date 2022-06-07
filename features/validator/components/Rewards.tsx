import { Button, HStack, Stack, Text } from '@chakra-ui/react'
import { Card } from './Card'

export function Rewards() {
  return (
    <Card>
      <Stack spacing="4">
        <Text fontSize="lg" fontWeight="medium">
          My rewards
        </Text>
        <HStack alignItems="baseline" mb="4">
          <Text fontSize="4xl">0</Text>
          <Text>Lion</Text>
        </HStack>
        <Button w="full" rounded="full" colorScheme="brand">
          Withdraw rewards
        </Button>
      </Stack>
    </Card>
  )
}
