import { ReactNode } from 'react'
import { Box, Flex, useBreakpoint, useBreakpointValue } from '@chakra-ui/react'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { Toolbar } from '@/components/Toolbar'
import Head from 'next/head'

interface LayoutProps {
  children?: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const isDesktop = useBreakpointValue({ base: false, lg: true }, 'lg')
  return (
    <>
      <Head>
        <title>Merlion Garden</title>
      </Head>
      <Flex
        as="section"
        direction={{ base: 'column', lg: 'row' }}
        height="100vh"
        bg="bg-canvas"
      >
        {isDesktop ? <Sidebar /> : <Navbar />}

        <Flex direction="column" maxW="100%" px="0" flex="1">
          <Toolbar></Toolbar>
          <Box flex="1" overflowY="auto">
            {children}
          </Box>
        </Flex>
      </Flex>
    </>
  )
}
