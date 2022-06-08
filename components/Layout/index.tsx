import { ReactNode } from 'react'
import {
  Box,
  Container,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Show,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { Toolbar } from '@/components/Toolbar'

interface LayoutProps {
  children?: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const isDesktop = useBreakpointValue({ base: false, lg: true })
  return (
    <Flex
      as="section"
      direction={{ base: 'column', lg: 'row' }}
      height="100vh"
      bg="bg-canvas"
      overflowY="auto"
    >
      {isDesktop ? <Sidebar /> : <Navbar />}

      <Flex direction="column" maxW="100%" px="0" flex="1">
        <Toolbar></Toolbar>
        <Stack spacing={{ base: '8', lg: '6' }} flex="1">
          {children}
        </Stack>
      </Flex>
    </Flex>
  )
}
