import {
  Box,
  Button,
  Container,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Heading,
  HStack,
  IconButton,
  Show,
  Spacer,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react'
import { FiMenu, FiMoon, FiSun } from 'react-icons/fi'
import { Sidebar } from '../sidebar'

export function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode, setColorMode } = useColorMode()

  return (
    <Box as="header" bg="bg-surface">
      <Container>
        <HStack h="16" spacing="0">
          <Show below="md">
            <HStack spacing="1">
              <IconButton
                icon={<FiMenu />}
                variant="ghost"
                aria-label="Open menu"
                onClick={onOpen}
              />
              <Heading fontSize="xl" fontWeight="medium">
                Garden
              </Heading>
            </HStack>
          </Show>
          <Spacer />
          <HStack spacing="3">
            {colorMode === 'dark' ? (
              <IconButton
                icon={<FiSun />}
                variant="ghost"
                aria-label="Switch to light mode"
                onClick={() => setColorMode('light')}
              />
            ) : (
              <IconButton
                icon={<FiMoon />}
                variant="ghost"
                aria-label="Switch to dark mode"
                onClick={() => setColorMode('dark')}
              />
            )}
            <Button rounded="full" colorScheme="brand" variant="outline">
              Connect Wallet
            </Button>
          </HStack>
        </HStack>
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <Sidebar h="full" />
          </DrawerContent>
        </Drawer>
      </Container>
    </Box>
  )
}
