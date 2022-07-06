import {
  Button,
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
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { TransactionToast } from '@/components/TransactionToast'
import { useAccountAddress, useConnectWallet } from '@/hooks'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'
import { formatCoin, parseCoin } from '@/utils'
import config from '@/config'
import { useDelegation } from '../hooks'

interface FormData {
  amount: string
}

export function Undelegate() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { query } = useRouter()
  const { account, connected } = useConnectWallet()
  const address = useAccountAddress()
  const toast = useToast()
  const { data: delegationData } = useDelegation(
    address?.mer(),
    query.address as string
  )
  const balance = useMemo(
    () =>
      delegationData && delegationData.balance
        ? formatCoin(delegationData.balance)
        : null,
    [delegationData]
  )
  const { sendTx } = useSendCosmTx()

  const {
    control,
    formState: { errors, isSubmitting },
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
        validatorAddress: query.address as string,
        amount: parseCoin({ amount, denom: config.displayDenom.toLowerCase() }),
      },
    }

    const receiptPromise = sendTx(message)

    toast({
      render: ({ onClose }) => {
        return (
          <TransactionToast
            title="Redelegate success"
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
        w="50%"
        rounded="full"
        variant="outline"
        colorScheme="brand"
        onClick={onOpen}
        disabled={Number(balance?.amount ?? 0) <= 0}
      >
        Undelegate
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
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
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
