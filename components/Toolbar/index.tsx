import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { MdLanguage, MdOutlinePalette } from 'react-icons/md'
import { FaMoon, FaSun } from 'react-icons/fa'

export const Toolbar = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box
      width="full"
      py="4"
      px={{ base: '4', md: '8' }}
      bg="bg-canvas"
      boxShadow={useColorModeValue('sm', 'sm-dark')}
    >
      <Flex justify="end" align="center">
        <HStack spacing="4">
          <ButtonGroup variant="ghost" spacing="1">
            <IconButton
              icon={<MdLanguage fontSize="1.25rem" />}
              aria-label="Language"
            />
            {colorMode === 'light' ? (
              <IconButton
                icon={<FaMoon fontSize="1.25rem" />}
                aria-label="Dark mode"
                onClick={toggleColorMode}
              />
            ) : (
              <IconButton
                icon={<FaSun fontSize="1.25rem" />}
                aria-label="Light mode"
                onClick={toggleColorMode}
              />
            )}
          </ButtonGroup>
          <ButtonGroup variant="ghost">
            <Button colorScheme="brand" variant="solid">
              Connect
            </Button>
          </ButtonGroup>
        </HStack>
      </Flex>
    </Box>
  )
}
