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
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { Controller, useForm } from 'react-hook-form'
import { useAccountAddress, useConnectWallet } from '@/hooks'
import { useBalance } from '@/hooks/query'
import config from '@/config'
import { formatCoin, parseCoin } from '@/utils'
import { MsgDelegateEncodeObject } from '@cosmjs/stargate'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { TransactionToast } from '@/components/TransactionToast'
import { useToast } from '@/hooks/useToast'

interface FormData {
  amount: string
}

export function Delegate() {
  const { query } = useRouter()
  const { account, connected } = useConnectWallet()
  const address = useAccountAddress()
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
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
    const message: MsgDelegateEncodeObject = {
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
      value: {
        delegatorAddress: address!.mer(),
        validatorAddress: query.address as string,
        amount: parseCoin({ amount, denom: config.displayDenom.toLowerCase() }),
      },
    }
    const receiptPromise = sendTx(message)
    toast({
      render: ({ onClose }) => {
        return (
          <TransactionToast
            title="Delegate success"
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
      <Button w="full" rounded="full" colorScheme="brand" onClick={onOpen}>
        Delegate
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          bgColor="bg-surface"
        >
          <ModalHeader>Delegate</ModalHeader>
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
