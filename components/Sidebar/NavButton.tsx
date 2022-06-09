import {
  As,
  Button,
  ButtonProps,
  HStack,
  Icon,
  Link,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import React from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

interface NavButtonProps extends ButtonProps {
  href: string
  isExternal?: boolean
  icon: As
  label: string
}

export const NavButton = (props: NavButtonProps) => {
  const { href, isExternal, icon, label, ...buttonProps } = props
  const router = useRouter()

  const button = (
    <Button
      w="full"
      as="div"
      variant={useColorModeValue('ghost-on-accent', 'ghost')}
      justifyContent="start"
      isActive={router.pathname === href}
      {...buttonProps}
    >
      <HStack spacing="3">
        <Icon
          as={icon}
          boxSize="6"
          color={useColorModeValue('on-accent-subtle', 'subtle')}
        />
        <Text>{label}</Text>
      </HStack>
    </Button>
  )

  return isExternal ? (
    <Link href={href} isExternal _hover={{ textDecoration: undefined }}>
      {button}
    </Link>
  ) : (
    <NextLink href={href} passHref>
      <Link _hover={{ textDecoration: undefined }}>{button}</Link>
    </NextLink>
  )
}
