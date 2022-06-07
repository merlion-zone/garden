import { useRef } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react'
import { switchEthereumChain } from '@/hooks'

interface WrongNetworkAlertProps {
  isOpen: boolean

  onClose(): void
}

export const WrongNetworkAlert = ({
  isOpen,
  onClose,
}: WrongNetworkAlertProps) => {
  const cancelRef = useRef<any>()

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Wrong Network
          </AlertDialogHeader>

          <AlertDialogBody>
            Please switch to the Merlion network in your wallet.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} variant="outline" onClick={onClose}>
              Cancel
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
