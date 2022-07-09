import { Button, HStack, useColorModeValue } from '@chakra-ui/react'
import { ReactNode } from 'react'

export type NavTarget = 'mint-burn' | 'buyback-reback'

interface NavbarProps {
  value?: NavTarget

  onChange(value: NavTarget): void
}

export const Navbar = ({ value, onChange }: NavbarProps) => {
  const btnColor = useColorModeValue('gray.500', 'gray.300')
  const btnActiveColor = useColorModeValue('gray.900', 'white')
  const btnActiveBg = useColorModeValue('gray.50', 'gray.800')

  const Btn = ({
    target,
    children,
  }: {
    target: NavTarget
    children: ReactNode
  }) => (
    <Button
      variant="ghost"
      borderRadius="3xl"
      colorScheme="gray"
      color={btnColor}
      _active={{ bg: btnActiveBg, color: btnActiveColor }}
      _hover={{ bg: btnActiveBg, color: btnActiveColor }}
      isActive={value === target}
      onClick={() => onChange(target)}
    >
      {children}
    </Button>
  )

  return (
    <HStack
      mt="4"
      bg={useColorModeValue('white', 'gray.900')}
      boxShadow={useColorModeValue('lg', 'lg-dark')}
      borderRadius="3xl"
    >
      <Btn target="mint-burn">Mint & Burn</Btn>
      <Btn target="buyback-reback">Buyback & Reback</Btn>
    </HStack>
  )
}
