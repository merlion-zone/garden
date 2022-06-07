import {
  As,
  Button,
  ButtonProps,
  forwardRef,
  HStack,
  Icon,
  Link,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import React from 'react'

interface NavButtonProps extends ButtonProps {
  href?: string
  isExternal?: boolean
  icon: As
  label: string
}

export const NavButton = forwardRef((props: NavButtonProps, ref) => {
  const { isExternal, icon, label, ...buttonProps } = props

  return (
    <Button
      as="a"
      variant={useColorModeValue('ghost-on-accent', 'ghost')}
      justifyContent="start"
      target={isExternal ? '_blank' : '_self'}
      rel={isExternal ? 'noopener' : ''}
      {...buttonProps}
      ref={ref}
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
})
