import {
  Button,
  ButtonProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  useDisclosure,
} from '@chakra-ui/react'
import { MsgDepositEncodeObject } from '@cosmjs/stargate'
import Long from 'long'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

import config from '@/config'
import { useAccountAddress, useConnectWallet } from '@/hooks'
import { useBalance } from '@/hooks/query'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'
import { formatCoin, parseCoin } from '@/utils'

import { TransactionToast } from '../TransactionToast'

interface DepositModalProps extends ButtonProps {
  proposalId: string
}

interface FormData {
  amount: string
}

export function DepositModal({ proposalId, ...props }: DepositModalProps) {
  const toast = useToast()

  const address = useAccountAddress()
  const { sendTx, isSendReady } = useSendCosmTx()
  const { balance: lionBalance = '0' } = useBalance(
    address?.mer(),
    config.denom
  )
  const balance = useMemo(
    () =>
      lionBalance
        ? formatCoin({ amount: lionBalance, denom: config.denom })
        : null,
    [lionBalance]
  )

  const { connected, account } = useConnectWallet()

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      amount: '',
    },
  })

  const { isOpen, onOpen, onClose } = useDisclosure()
  const closeModal = () => {
    onClose()
    setTimeout(reset, 100)
  }

  const onMax = () => {
    setValue('amount', balance?.amount ?? '0')
  }

  const onSubmit = async ({ amount }: FormData) => {
    if (!connected || !account) {
      toast({
        title: 'Please connect wallet first',
        status: 'warning',
      })

      return
    }

    const message: MsgDepositEncodeObject = {
      typeUrl: '/cosmos.gov.v1beta1.MsgDeposit',
      value: {
        proposalId: Long.fromString(proposalId),
        depositor: address!.mer(),
        amount: [
          parseCoin({ amount, denom: config.displayDenom.toLowerCase() }),
        ],
      },
    }

    const receiptPromise = sendTx(message)

    toast({
      render: ({ onClose }) => (
        <TransactionToast
          title={`Deposit ${amount} ${config.displayDenom} for proposal: #${proposalId}`}
          receiptPromise={receiptPromise}
          onClose={onClose}
        />
      ),
    })

    receiptPromise?.finally(() => {
      closeModal()
    })
  }

  return (
    <>
      <Button {...props} onClick={onOpen}>
        Deposit
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          bgColor="bg-surface"
        >
          <ModalHeader>Deposit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={!!errors.amount}>
              <FormLabel>Amount</FormLabel>
              <InputGroup>
                <Controller
                  name="amount"
                  control={control}
                  rules={{
                    required: true,
                    validate: (v) =>
                      Number(v) > 0 || 'Amount must greater than 0',
                  }}
                  render={({ field: { ref, ...restField } }) => (
                    <NumberInput w="full" {...restField}>
                      <NumberInputField id="amount" pr="4.5rem" ref={ref} />
                      <InputRightElement w="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={onMax}>
                          MAX
                        </Button>
                      </InputRightElement>
                    </NumberInput>
                  )}
                />
              </InputGroup>
              <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              w="full"
              type="submit"
              rounded="full"
              colorScheme="brand"
              isLoading={!isSendReady}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
