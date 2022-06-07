import { ReactNode } from 'react'
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react'
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
        <Box flex="1">
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
