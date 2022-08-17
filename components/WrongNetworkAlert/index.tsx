import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'

import { switchEthereumChain, useConnectWallet } from '@/hooks'

interface WrongNetworkAlertProps {
  isOpen: boolean

  onClose(): void
}

export const WrongNetworkAlert = ({
  isOpen,
  onClose,
}: WrongNetworkAlertProps) => {
  const { onDisconnect } = useConnectWallet()

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="bg-surface">
        <ModalHeader>Wrong Network</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="6">
          Please switch to the Merlion network in your wallet.
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              onDisconnect()
              onClose()
            }}
          >
            Disconnect
          </Button>
          <Button
            onClick={() => {
              switchEthereumChain().then(() => {})
              onClose()
            }}
            ml={3}
          >
            Switch network
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
