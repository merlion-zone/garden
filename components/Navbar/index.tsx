import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import * as React from 'react'
import { Logo } from '@/components/Logo'
import { Sidebar } from '@/components/Sidebar'
import { ToggleButton } from '@/components/ToggleButton'

export const Navbar = () => {
  const { isOpen, onToggle, onClose } = useDisclosure()
  return (
    <Box
      width="full"
      py="4"
      px={{ base: '4', md: '8' }}
      bg="bg-surface"
      boxShadow={useColorModeValue('sm', 'sm-dark')}
    >
      <Flex justify="space-between" align="center">
        <Logo />
        <ToggleButton
          isOpen={isOpen}
          aria-label="Open Menu"
          onClick={onToggle}
        />
        <Drawer
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          isFullHeight
          preserveScrollBarGap
        >
          <DrawerOverlay />
          <DrawerContent>
            <Sidebar />
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  )
}
