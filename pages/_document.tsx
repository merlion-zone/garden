import { ColorModeScript } from '@chakra-ui/react'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import { theme } from '@/theme'

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* eslint-disable-next-line @next/next/no-title-in-document-head */}
          <title>Merlion Garden</title>
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon16.png"
          />
        </Head>
        <body>
          {/* Make Color mode to persists when you refresh the page. */}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
