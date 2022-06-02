import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClientProvider } from 'react-query'
import { queryClient } from '@/constants'
import { theme } from '@/theme'

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ChakraProvider>
  )
}

export default App
