import type { ReactNode } from 'react'
import Head from 'next/head'
import { Box, Divider, Flex, Show, Stack } from '@chakra-ui/react'
import { Sidebar } from './sidebar'
import { Header } from './header'

export interface LayoutProps {
  title?: string
  description?: string
  children?: ReactNode
}

export function Layout({
  title = 'Merlion Garden',
  description = '',
  children,
}: LayoutProps) {
  return (
    <>
      <Head>
        <meta name="description" content={description} />
        <title>{title}</title>
      </Head>
      <Flex as="section" minH="100vh" bg="bg-canvas">
        <Show above="md">
          <Sidebar flex="1" w="xs" />
          <Divider orientation="vertical" h="100vh" />
        </Show>
        <Stack flex="1" overflow="hidden" spacing="0">
          <Header />
          <Divider />
          <Box as="main" overflowY="auto" flexGrow="1" flexBasis="0">
            {children}
          </Box>
        </Stack>
      </Flex>
    </>
  )
}
