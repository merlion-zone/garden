import { HStack, Icon, IconButton, Link } from '@chakra-ui/react'
import { MdMenuBook } from 'react-icons/md'
import { SiDiscord, SiGithub, SiTelegram, SiTwitter } from 'react-icons/si'

export const Links = () => {
  return (
    <>
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
        <Link
          href="/telegram"
          isExternal
          _hover={{ textDecoration: undefined }}
        >
          <IconButton
            variant="ghost"
            size="md"
            color="subtle"
            icon={<SiTelegram />}
            aria-label="Telegram"
          ></IconButton>
        </Link>
      </HStack>

      <HStack>
        <Link
          href="https://docs.merlion.zone/intro/overview.html"
          isExternal
          _hover={{ textDecoration: undefined }}
        >
          <IconButton
            variant="ghost"
            size="md"
            color="subtle"
            icon={<Icon as={MdMenuBook} />}
            aria-label="Docs"
          ></IconButton>
        </Link>
        <Link
          href="https://github.com/merlion-zone"
          isExternal
          _hover={{ textDecoration: undefined }}
        >
          <IconButton
            variant="ghost"
            size="md"
            color="subtle"
            icon={<SiGithub />}
            aria-label="Github"
          ></IconButton>
        </Link>
      </HStack>
    </>
  )
}
