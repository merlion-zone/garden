import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react'
import Image from 'next/image'
import { useRouter } from 'next/router'

import comingSoonPic from '@/public/images/merlion-sticker.png'

export const ComingSoon = () => {
  const router = useRouter()

  return (
    <HStack spacing="16">
      <Stack spacing="4">
        <Text fontSize="lg" color="gray.500">
          Coming soon.
        </Text>
        <Box>
          <Text>The requested feature is not implemented yet.</Text>
          <Text color="gray.500">That’s all we know.</Text>
        </Box>
        <HStack>
          <Button variant="outline" size="xs" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => router.push('/portfolio')}
          >
            Home
          </Button>
        </HStack>
      </Stack>
      <Box w="180px" h="180px" filter="grayscale(75%)">
        <Image src={comingSoonPic} alt="Not found" />
      </Box>
    </HStack>
  )
}
