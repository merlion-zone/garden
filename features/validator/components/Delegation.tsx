import { HStack, Stack, Text } from '@chakra-ui/react'
import { Card } from './Card'
import { Delegate } from './Delegate'
import { Redelegate } from './Redelegate'
import { Undelegate } from './Undelegate'

export function Delegation() {
  return (
    <Card>
      <Stack spacing="4">
        <Text fontSize="lg" fontWeight="medium">
          My delegation
        </Text>
        <HStack alignItems="baseline" mb="4">
          <Text fontSize="4xl">0</Text>
          <Text>Lion</Text>
        </HStack>
        <HStack>
          <Delegate />
          <Redelegate />
        </HStack>
        <Undelegate />
      </Stack>
    </Card>
  )
}
