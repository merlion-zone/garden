import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  InputRightElement,
  Link,
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
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { Controller, useForm } from 'react-hook-form'
import { useDelegation } from '../hooks'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { MsgBeginRedelegateEncodeObject } from '@merlionzone/merlionjs'
import config from '@/config'
import { formatCoin, parseCoin } from '@/utils'
import {
  useAccountAddress,
  useConnectWallet,
  useMerlionClient,
  useValidators,
} from '@/hooks'

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
  const merlionClient = useMerlionClient()
  const toast = useToast()
  const { data: delegationData } = useDelegation(
    account,
    query.address as string
  )
  const balance = useMemo(
    () =>
      delegationData && delegationData.balance
        ? formatCoin(delegationData.balance)
        : null,
    [delegationData]
  )

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
    try {
      const { transactionHash } = await merlionClient!.signAndBroadcast(
        account!,
        [message]
      )
      toast({
        title: 'Redelegate success',
        description: (
          <Text>
            View on explorer: <Link isExternal>{transactionHash}</Link>
          </Text>
        ),
        status: 'success',
      })
    } catch (error) {
      console.log(error)
      toast({
        title: 'Redelegate failed',
        status: 'error',
      })
    }

    closeModal()
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
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
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
              <Controller
                control={control}
                name="amount"
                render={({ field: { ref, ...restField } }) => (
                  <NumberInput {...restField}>
                    <NumberInputField id="amount" pr="4.5rem" ref={ref} />
                    <InputRightElement w="4.5rem">
                      <Button h="1.75rem" size="sm" onClick={onMax}>
                        MAX
                      </Button>
                    </InputRightElement>
                  </NumberInput>
                )}
              />
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
