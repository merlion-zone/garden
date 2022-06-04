import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  StackDivider,
} from '@chakra-ui/react'
import { MetaMaskIcon } from '@/components/Icons/MetaMaskIcon'
import { KeplrIcon } from '@/components/Icons/KeplrIcon'

interface ConnectWalletModalProps {
  isOpen: boolean

  onClose(): void
}

export const ConnectWalletModal = ({
  isOpen,
  onClose,
}: ConnectWalletModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="6">
          <Stack divider={<StackDivider />} spacing="0">
            <Button
              leftIcon={<MetaMaskIcon />}
              colorScheme="brand"
              variant="ghost"
              size="xl"
              justifyContent="flex-start"
              iconSpacing="6"
            >
              MetaMask
            </Button>
            <Button
              leftIcon={<KeplrIcon />}
              colorScheme="brand"
              variant="ghost"
              size="xl"
              justifyContent="flex-start"
              iconSpacing="6"
            >
              Keplr
            </Button>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
