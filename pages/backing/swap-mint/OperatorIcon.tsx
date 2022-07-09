import { Center, IconButton, useColorModeValue } from '@chakra-ui/react'
import React, { ReactElement } from 'react'

export const OperatorIcon = ({
  icon,
  onClick,
}: {
  icon: ReactElement
  onClick?: false | (() => void)
}) => (
  <Center
    w="44px"
    h="44px"
    my="-4"
    bg={useColorModeValue('gray.50', 'gray.800')}
    border="6px solid"
    borderRadius="xl"
    borderColor={useColorModeValue('white', 'gray.900')}
    cursor="pointer"
    sx={{
      position: 'relative',
      left: 'calc(50% - 1rem)',
    }}
    onClick={onClick || (() => {})}
  >
    {onClick ? (
      <IconButton
        variant="ghost"
        size="sm"
        aria-label="Mint Operator"
        icon={icon}
      />
    ) : (
      icon
    )}
  </Center>
)
