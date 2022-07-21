import { ChakraProvider } from '@chakra-ui/react'
import '@fontsource/inter/variable.css'
import type { AppProps } from 'next/app'

import { Layout } from '@/components/Layout'
import { LanguageProvider } from '@/pages/i18n'
import { theme } from '@/theme'

function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <ChakraProvider resetCSS theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </LanguageProvider>
  )
}

export default App
