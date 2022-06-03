import {
  As,
  Button,
  ButtonProps,
  HStack,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import React from 'react'

interface NavButtonProps extends ButtonProps {
  icon: As
  label: string
}

export const NavButton = (props: NavButtonProps) => {
  const { icon, label, ...buttonProps } = props
  return (
    <Button
      variant={useColorModeValue('ghost-on-accent', 'ghost')}
      justifyContent="start"
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
}
