import { ArrowDownIcon } from '@chakra-ui/icons'
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

import { Explain } from './Explain'

interface ConfirmModalProps {
  isBuyback: boolean
  backingToken: AmountMetadata
  lionToken: AmountMetadata
  backingAmt: string
  lionAmt: string
  feeAmt: string
  isOpen: boolean

  onClose(): void

  onSubmit(): void
}

export const ConfirmModal = ({
  isBuyback,
  backingToken,
  lionToken,
  backingAmt,
  lionAmt,
  feeAmt,
  isOpen,
  onClose,
  onSubmit,
}: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="bg-surface" maxW="md">
        <ModalHeader>Confirm Swap</ModalHeader>
        <ModalCloseButton />
        <ModalBody mb="4">
          <AmountInput
            token={isBuyback ? lionToken : backingToken}
            value={isBuyback ? lionAmt : backingAmt}
            noAnnotation
          ></AmountInput>
          <OperatorIcon icon={<ArrowDownIcon />} />
          <AmountInput
            token={isBuyback ? backingToken : lionToken}
            value={isBuyback ? backingAmt : lionAmt}
            noAnnotation
          ></AmountInput>

          <Explain
            loading={false}
            isBuyback={isBuyback}
            backingMetadata={backingToken.metadata!}
            backingAmt={backingAmt}
            lionAmt={lionAmt}
            feeAmt={feeAmt}
            noCollapse
          />

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
            Confirm Swap
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
