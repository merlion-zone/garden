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
  Select,
  useDisclosure,
} from '@chakra-ui/react'
import { MsgBeginRedelegateEncodeObject } from '@merlionzone/merlionjs'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { TransactionToast } from '@/components/TransactionToast'
import config from '@/config'
import { useAccountAddress, useConnectWallet } from '@/hooks'
import { useQueryDelegation, useQueryValidators } from '@/hooks/query'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'
import { formatCoin, parseCoin } from '@/utils'

interface RedelegateModalProps extends ButtonProps {
  validatorAddress: string
}

interface FormData {
  validator: string
  amount: string
}

export function RedelegateModal({
  validatorAddress,
  ...props
}: RedelegateModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { data } = useQueryValidators('BOND_STATUS_BONDED')
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
        delegatorAddress: address!.mer(),
        validatorDstAddress: validator,
        validatorSrcAddress: validatorAddress,
        amount: parseCoin({ amount, denom: config.displayDenom.toLowerCase() }),
      },
    }

    const receiptPromise = sendTx(message)

    toast({
      render: ({ onClose }) => {
        return (
          <TransactionToast
            title={`Redelegate ${amount} ${config.displayDenom}`}
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
                {data?.validators.map(
                  ({ description, operatorAddress }) =>
                    operatorAddress !== validatorAddress && (
                      <option key={operatorAddress} value={operatorAddress}>
                        {description!.moniker}
                      </option>
                    )
                )}
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
