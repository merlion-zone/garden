import { Box, Button, Center, HStack, Stack, Text } from '@chakra-ui/react'
import Image from 'next/image'
import { useRouter } from 'next/router'

import notFoundPic from '@/public/images/merlion-sticker.png'

export default function NotFound() {
  const router = useRouter()

  return (
    <Center h="full">
      <HStack spacing="16">
        <Stack spacing="4">
          <Text fontSize="lg" color="gray.500">
            404 Not Found.
          </Text>
          <Box>
            <Text>The requested page was not found.</Text>
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
          <Image src={notFoundPic} alt="Not found" />
        </Box>
      </HStack>
    </Center>
  )
}
