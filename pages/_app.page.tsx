import { ChakraProvider } from '@chakra-ui/react'
import '@fontsource/inter/variable.css'
import type { AppProps } from 'next/app'
import { QueryClientProvider } from 'react-query'

import { Layout } from '@/components/Layout'
import { queryClient } from '@/constants'
import { LanguageProvider } from '@/pages/i18n'
import { theme } from '@/theme'

function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <ChakraProvider resetCSS theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </QueryClientProvider>
      </ChakraProvider>
    </LanguageProvider>
  )
}

export default App
