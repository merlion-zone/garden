import {
  Avatar,
  AvatarBadge,
  AvatarProps,
  Box,
  BoxProps,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import * as React from 'react'
import { HiBadgeCheck } from 'react-icons/hi'

export const Card = (props: BoxProps) => (
  <Box
    bg="bg-surface"
    w="full"
    maxW="full"
    mx="auto"
    p={{ base: '6', md: '8' }}
    rounded={{ sm: 'lg' }}
    shadow={{ md: 'base' }}
    {...props}
  />
)

interface UserAvatarProps extends AvatarProps {
  isVerified?: boolean
}

export const UserAvatar = (props: UserAvatarProps) => {
  const { isVerified, ...avatarProps } = props
  const avatarColor = useColorModeValue('white', 'gray.700')
  const iconColor = useColorModeValue('teal.500', 'teal.200')

  return (
    <Avatar size={{ base: 'md', md: 'lg' }} {...avatarProps}>
      {isVerified && (
        <AvatarBadge
          borderWidth="4px"
          borderColor={avatarColor}
          insetEnd="3"
          bottom="3"
          bg={avatarColor}
        >
          <Icon as={HiBadgeCheck} fontSize="2xl" color={iconColor} />
        </AvatarBadge>
      )}
    </Avatar>
  )
}
