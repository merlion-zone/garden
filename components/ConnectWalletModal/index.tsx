import {
  Box,
  Button,
  CloseButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { useConnectWallet } from '@/hooks'
import { MetaMaskIcon } from '@/components/Icons/MetaMaskIcon'
import { KeplrIcon } from '@/components/Icons/KeplrIcon'
import { VscCircleFilled } from 'react-icons/vsc'

interface ConnectWalletModalProps {
  back?: boolean
  isOpen: boolean

  onClose(): void

  onBack(): void
}

export const ConnectWalletModal = ({
  back = false,
  isOpen,
  onClose,
  onBack,
}: ConnectWalletModalProps) => {
  const { walletType, account, onConnect } = useConnectWallet()

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="bg-surface">
        <ModalHeader>
          {!back ? (
            'Connect Wallet'
          ) : (
            <Box mb="6">
              <CloseButton
                sx={{
                  position: 'absolute',
                  top: 2,
                  insetStart: 3,
                }}
                onClick={onBack}
              >
                <FiArrowLeft size="20px" />
              </CloseButton>
            </Box>
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="6">
          <Stack>
            <Button
              leftIcon={<MetaMaskIcon />}
              rightIcon={
                walletType === 'metamask' && !!account ? (
                  <VscCircleFilled />
                ) : (
                  <></>
                )
              }
              variant="outline"
              size="xl"
              justifyContent="flex-start"
              iconSpacing="6"
              isDisabled={walletType === 'metamask' && !!account}
              onClick={() => {
                onConnect('metamask')
                onClose()
              }}
            >
              MetaMask
            </Button>
            <Button
              leftIcon={<KeplrIcon />}
              rightIcon={
                walletType === 'keplr' && !!account ? (
                  <VscCircleFilled />
                ) : (
                  <></>
                )
              }
              variant="outline"
              size="xl"
              justifyContent="flex-start"
              iconSpacing="6"
              isDisabled={walletType === 'keplr' && !!account}
              onClick={() => {
                onConnect('keplr')
                onClose()
              }}
            >
              Keplr
            </Button>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
