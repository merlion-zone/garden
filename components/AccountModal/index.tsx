import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react'
import { MdOpenInNew } from 'react-icons/md'

import { CopyAddressButton } from '@/components/CopyAddress'
import { KeplrIcon } from '@/components/Icons/KeplrIcon'
import { MetaMaskIcon } from '@/components/Icons/MetaMaskIcon'
import { useConnectWallet } from '@/hooks'
import { shortenAddress } from '@/utils'

interface AccountModalProps {
  isOpen: boolean

  onClose(): void

  onChange(disconnect: boolean): void
}

export const AccountModal = ({
  isOpen,
  onClose,
  onChange,
}: AccountModalProps) => {
  const { walletType, account } = useConnectWallet()

  const [ethAddr, merAddr] = account ? shortenAddress(account) : []

  return account ? (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="bg-surface">
        <ModalHeader>Account</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="6">
          <Box borderWidth="1px" p={{ base: '0', md: '4' }} borderRadius="lg">
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="500" color="subtle">
                Connected with {walletType}
              </Text>
              <HStack>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onChange(true)}
                >
                  Disconnect
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onChange(false)}
                >
                  Change
                </Button>
              </HStack>
            </HStack>
            <HStack pt="2" fontSize="xl">
              {walletType === 'metamask' ? <MetaMaskIcon /> : <KeplrIcon />}
              <Text fontWeight="bold">
                {walletType === 'metamask' ? ethAddr : merAddr}
              </Text>
            </HStack>
            <HStack pt="2">
              <CopyAddressButton addr={account}></CopyAddressButton>
              <Button variant="link" size="xs" leftIcon={<MdOpenInNew />}>
                View on Explorer
              </Button>
            </HStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  ) : (
    <></>
  )
}
