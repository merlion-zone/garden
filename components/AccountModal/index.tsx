import {
  Box,
  Text,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Button,
  useClipboard,
} from '@chakra-ui/react'
import { FiCheckCircle, FiCopy } from 'react-icons/fi'
import { MdOpenInNew } from 'react-icons/md'
import { useConnectWallet } from '@/hooks'
import { shortenAddress } from '@/utils'
import { MetaMaskIcon } from '@/components/Icons/MetaMaskIcon'
import { KeplrIcon } from '@/components/Icons/KeplrIcon'

interface AccountModalProps {
  isOpen: boolean

  onClose(): void

  onChange(): void
}

const CopyAddressButton = ({ addr }: { addr: string }) => {
  const { hasCopied, onCopy } = useClipboard(addr)
  return !hasCopied ? (
    <Button variant="ghost" size="xs" leftIcon={<FiCopy />} onClick={onCopy}>
      Copy Address
    </Button>
  ) : (
    <Button variant="ghost" size="xs" leftIcon={<FiCheckCircle />}>
      Copied
    </Button>
  )
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
              <Button variant="outline" size="sm" onClick={onChange}>
                Change
              </Button>
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
