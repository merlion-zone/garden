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
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import React from 'react'

import { AmountInput, AmountMetadata } from '@/components/AmountInput'
import { AmountDisplay, DecDisplay } from '@/components/NumberDisplay'

interface ConfirmModalProps {
  isBorrow: boolean
  usmToken: AmountMetadata
  usmAmt: string
  feeAmt: string
  interestFee: string
  isOpen: boolean

  onClose(): void

  onSubmit(): void
}

export const ConfirmModal = ({
  isBorrow,
  usmToken,
  usmAmt,
  feeAmt,
  interestFee,
  isOpen,
  onClose,
  onSubmit,
}: ConfirmModalProps) => {
  const borderColor = useColorModeValue('gray.300', 'gray.700')

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="bg-surface" maxW="md">
        <ModalHeader>Confirm {isBorrow ? 'Borrow' : 'Repay'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody mb="4">
          <AmountInput
            token={usmToken}
            value={usmAmt}
            noAnnotation
          ></AmountInput>

          {isBorrow && (
            <Box
              mt="4"
              p="3"
              borderRadius="2xl"
              border="1px"
              borderColor={borderColor}
            >
              <Stack fontSize="sm">
                <HStack justify="space-between" color="gray.500">
                  <Text>Borrow Fee</Text>
                  <Text textAlign="end">
                    <AmountDisplay value={feeAmt} prefix="$" />
                  </Text>
                </HStack>
                <HStack justify="space-between" color="gray.500">
                  <Text>Interest APY:</Text>
                  <Text textAlign="end">
                    <DecDisplay value={interestFee} percentage />
                  </Text>
                </HStack>
              </Stack>
            </Box>
          )}

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
            {isBorrow ? 'Borrow' : 'Repay'}
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
