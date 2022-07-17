import { SmallAddIcon } from '@chakra-ui/icons'
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'

import { AmountInput, AmountMetadata } from '@/components/AmountInput'
import { OperatorIcon } from '@/pages/backing/swap-mint/OperatorIcon'

interface ConfirmModalProps {
  isDeposit: boolean
  collateralToken: AmountMetadata
  lionToken: AmountMetadata
  collateralAmt: string
  lionAmt: string
  isOpen: boolean

  onClose(): void

  onSubmit(): void
}

export const ConfirmModal = ({
  isDeposit,
  collateralToken,
  lionToken,
  collateralAmt,
  lionAmt,
  isOpen,
  onClose,
  onSubmit,
}: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="bg-surface" maxW="md">
        <ModalHeader>Confirm {isDeposit ? 'Deposit' : 'Redeem'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody mb="4">
          <AmountInput
            token={collateralToken}
            value={collateralAmt}
            noAnnotation
          ></AmountInput>
          <OperatorIcon icon={<SmallAddIcon />} />
          <AmountInput
            token={lionToken}
            value={lionAmt}
            noAnnotation
          ></AmountInput>

          <Button
            w="full"
            size="xl"
            mt="4"
            borderRadius="2xl"
            fontSize="xl"
            onClick={() => {
              onClose()
              onSubmit()
            }}
          >
            {isDeposit ? 'Deposit' : 'Redeem'}
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
