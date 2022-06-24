import { HStack, IconButton, Link } from '@chakra-ui/react'
import { SiDiscord, SiTelegram, SiTwitter } from 'react-icons/si'

export const Social = () => {
  return (
    <HStack>
      <Link href="/twitter" isExternal _hover={{ textDecoration: undefined }}>
        <IconButton
          variant="ghost"
          size="md"
          color="subtle"
          icon={<SiTwitter />}
          aria-label="Twitter"
        ></IconButton>
      </Link>
      <Link href="/discord" isExternal _hover={{ textDecoration: undefined }}>
        <IconButton
          variant="ghost"
          size="md"
          color="subtle"
          icon={<SiDiscord />}
          aria-label="Discord"
        ></IconButton>
      </Link>
      <Link href="/telegram" isExternal _hover={{ textDecoration: undefined }}>
        <IconButton
          variant="ghost"
          size="md"
          color="subtle"
          icon={<SiTelegram />}
          aria-label="Telegram"
        ></IconButton>
      </Link>
    </HStack>
  )
}
