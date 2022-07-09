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
  Select,
  useDisclosure,
} from '@chakra-ui/react'
import { MsgBeginRedelegateEncodeObject } from '@merlionzone/merlionjs'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { TransactionToast } from '@/components/TransactionToast'
import config from '@/config'
import { useAccountAddress, useConnectWallet, useValidators } from '@/hooks'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'
import { formatCoin, parseCoin } from '@/utils'

import { useDelegation } from '../hooks'

interface FormData {
  validator: string
  amount: string
}

export function Redelegate() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { query } = useRouter()
  const { data } = useValidators()
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
    register,
    reset,
    setValue,
  } = useForm<FormData>()

  const closeModal = () => {
    onClose()
    setTimeout(reset, 100)
  }

  const onSubmit = async ({ validator, amount }: FormData) => {
    if (!connected || !account) {
      toast({
        title: 'Please connect wallet first',
        status: 'warning',
        isClosable: true,
      })
      return
    }

    const message: MsgBeginRedelegateEncodeObject = {
      typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
      value: {
        delegatorAddress: address?.mer(),
        validatorDstAddress: validator,
        validatorSrcAddress: query.address as string,
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
        Redelegate
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          bgColor="bg-surface"
        >
          <ModalHeader>Redelegate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={!!errors.validator}>
              <FormLabel>Validator</FormLabel>
              <Select
                id="validator"
                placeholder="Select validator"
                {...register('validator', {
                  required: 'Please select a validator',
                })}
              >
                {data?.validators.map(({ description, operatorAddress }) => (
                  <option key={operatorAddress} value={operatorAddress}>
                    {description!.moniker}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.validator?.message}</FormErrorMessage>
            </FormControl>
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
