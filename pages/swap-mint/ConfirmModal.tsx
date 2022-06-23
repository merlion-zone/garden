import {
  Button,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { AmountInput, AmountMetadata } from '@/pages/swap-mint/AmountInput'
import { OperatorIcon } from '@/pages/swap-mint/OperatorIcon'
import { ArrowDownIcon, SmallAddIcon } from '@chakra-ui/icons'
import React from 'react'
import { Explain } from '@/pages/swap-mint/Explain'

interface ConfirmModalProps {
  isMint: boolean
  backingToken: AmountMetadata
  lionToken: AmountMetadata
  usmToken: AmountMetadata
  backingAmt: string
  lionAmt: string
  usmAmt: string
  feeAmt: string
  isOpen: boolean

  onClose(): void

  onSubmit(): void
}

export const ConfirmModal = ({
  isMint,
  backingToken,
  lionToken,
  usmToken,
  backingAmt,
  lionAmt,
  usmAmt,
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
            token={isMint ? backingToken : usmToken}
            value={isMint ? backingAmt : usmAmt}
            noAnnotation
          ></AmountInput>
          <OperatorIcon icon={isMint ? <SmallAddIcon /> : <ArrowDownIcon />} />
          <AmountInput
            token={isMint ? lionToken : backingToken}
            value={isMint ? lionAmt : backingAmt}
            noAnnotation
          ></AmountInput>
          <OperatorIcon icon={isMint ? <ArrowDownIcon /> : <SmallAddIcon />} />
          <AmountInput
            token={isMint ? usmToken : lionToken}
            value={isMint ? usmAmt : lionAmt}
            noAnnotation
          ></AmountInput>

          <Explain
            loading={false}
            isMint={isMint}
            backingMetadata={backingToken.metadata!}
            backingAmt={backingAmt}
            lionAmt={lionAmt}
            usmAmt={usmAmt}
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