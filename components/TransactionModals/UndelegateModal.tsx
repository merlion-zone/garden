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
import { MsgUndelegateEncodeObject } from '@cosmjs/stargate'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { TransactionToast } from '@/components/TransactionToast'
import config from '@/config'
import { useAccountAddress, useConnectWallet } from '@/hooks'
import { useQueryDelegation } from '@/hooks/query'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'
import { formatCoin, parseCoin } from '@/utils'

interface UndelegateModalProps extends ButtonProps {
  validatorAddress: string
}

interface FormData {
  amount: string
}

export function UndelegateModal({
  validatorAddress,
  ...props
}: UndelegateModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { account, connected } = useConnectWallet()
  const address = useAccountAddress()
  const toast = useToast()
  const { data: delegationData } = useQueryDelegation(
    address?.mer(),
    validatorAddress
  )
  const balance = useMemo(
    () =>
      delegationData?.delegationResponse?.balance
        ? formatCoin(delegationData.delegationResponse.balance)
        : null,
    [delegationData]
  )
  const { sendTx, isSendReady } = useSendCosmTx()

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm<FormData>()

  const closeModal = () => {
    onClose()
    setTimeout(reset, 100)
  }

  const onSubmit = async ({ amount }: FormData) => {
    if (!connected || !account) {
      toast({
        title: 'Please connect wallet first',
        status: 'warning',
        isClosable: true,
      })
      return
    }
    const message: MsgUndelegateEncodeObject = {
      typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
      value: {
        delegatorAddress: address?.mer(),
        validatorAddress: validatorAddress,
        amount: parseCoin({ amount, denom: config.displayDenom.toLowerCase() }),
      },
    }

    const receiptPromise = sendTx(message)

    toast({
      render: ({ onClose }) => {
        return (
          <TransactionToast
            title={`Undelegate ${amount} ${config.displayDenom}`}
            receiptPromise={receiptPromise}
            onClose={onClose}
          />
        )
      },
    })

    receiptPromise?.finally(() => {
      closeModal()
    })
  }

  const onMax = () => {
    setValue('amount', balance?.amount ?? '0')
  }

  return (
    <>
      <Button
        {...props}
        onClick={onOpen}
        disabled={Number(balance?.amount ?? 0) <= 0}
      >
        Undelegate
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          bgColor="bg-surface"
        >
          <ModalHeader>Undelegate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={!!errors.amount}>
              <FormLabel>Amount</FormLabel>
              <InputGroup>
                <Controller
                  control={control}
                  name="amount"
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
