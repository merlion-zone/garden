import { useCallback, useState } from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { MdLanguage } from 'react-icons/md'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useConnectWallet } from '@/hooks'
import { useEffectOnce } from 'react-use'
import { shortenAddress } from '@/utils'
import { ConnectWalletModal } from '@/components/ConnectWalletModal'
import { AccountModal } from '@/components/AccountModal'
import { MetaMaskIcon } from '@/components/Icons/MetaMaskIcon'
import { KeplrIcon } from '@/components/Icons/KeplrIcon'
import { WrongNetworkAlert } from '@/components/WrongNetworkAlert'

export const Toolbar = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const {
    isOpen: isConnectWalletOpen,
    onOpen: onConnectWalletOpen,
    onClose: onConnectWalletClose,
  } = useDisclosure()
  const {
    isOpen: isAccountModalOpen,
    onOpen: onAccountModalOpen,
    onClose: onAccountModalClose,
  } = useDisclosure()
  const {
    isOpen: isWrongNetworkOpen,
    onOpen: onWrongNetworkOpen,
    onClose: onWrongNetworkClose,
  } = useDisclosure()

  const { walletType, connected, account, onConnect } = useConnectWallet()
  useEffectOnce(() => {
    onConnect(null)
  })

  const [ethAddr, merAddr] = account ? shortenAddress(account) : []

  const [isConnectWalletBack, setIsConnectWalletBack] = useState(false)

  const onAccountModalChange = useCallback(() => {
    onAccountModalClose()
    setIsConnectWalletBack(true)
    onConnectWalletOpen()
  }, [onAccountModalClose, onConnectWalletOpen])

  const onConnectWalletBack = useCallback(() => {
    onConnectWalletClose()
    setIsConnectWalletBack(false)
    onAccountModalOpen()
  }, [onAccountModalOpen, onConnectWalletClose])

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
            {connected === null ? (
              <Button variant="solid" onClick={onConnectWalletOpen}>
                Connect
              </Button>
            ) : connected ? (
              <Button
                leftIcon={
                  walletType === 'metamask' ? <MetaMaskIcon /> : <KeplrIcon />
                }
                variant="outline"
                onClick={onAccountModalOpen}
              >
                {walletType === 'metamask' ? ethAddr : merAddr}
              </Button>
            ) : (
              <Button
                variant="solid"
                colorScheme="red"
                onClick={onWrongNetworkOpen}
              >
                Wrong network
              </Button>
            )}
          </ButtonGroup>
        </HStack>
      </Flex>

      <ConnectWalletModal
        back={isConnectWalletBack}
        isOpen={isConnectWalletOpen}
        onClose={() => {
          onConnectWalletClose()
          setIsConnectWalletBack(false)
        }}
        onBack={onConnectWalletBack}
      ></ConnectWalletModal>
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={onAccountModalClose}
        onChange={onAccountModalChange}
      ></AccountModal>
      <WrongNetworkAlert
        isOpen={isWrongNetworkOpen}
        onClose={onWrongNetworkClose}
      ></WrongNetworkAlert>
    </Box>
  )
}
