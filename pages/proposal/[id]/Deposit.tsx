import config from '@/config'
import { useAccountAddress, useConnectWallet, useMerlionClient } from '@/hooks'
import { useBalance } from '@/hooks/query'
import { formatCoin, parseCoin } from '@/utils'
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  InputGroup,
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
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { MsgDepositEncodeObject } from '@cosmjs/stargate'
import Long from 'long'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

interface FormData {
  amount: string
}

export function Deposit() {
  const toast = useToast()
  const { query } = useRouter()

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

  const { connected, account } = useConnectWallet()
  const merlionClient = useMerlionClient()

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setValue,
  } = useForm<FormData>()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const closeModal = () => {
    onClose()
    setTimeout(reset, 100)
  }

  const onMax = () => {
    setValue('amount', balance?.amount ?? '0')
  }

  const onSubmit = async ({ amount }: FormData) => {
    if (!connected || !account || !query.id) {
      toast({
        title: 'Please connect wallet first',
        status: 'warning',
      })

      return
    }

    const message: MsgDepositEncodeObject = {
      typeUrl: '/cosmos.gov.v1beta1.MsgDeposit',
      value: {
        proposalId: Long.fromString(query.id as string),
        depositor: account,
        amount: [
          parseCoin({ amount, denom: config.displayDenom.toLowerCase() }),
        ],
      },
    }

    try {
      const { transactionHash } = await merlionClient!.signAndBroadcast(
        account!,
        [message]
      )

      toast({
        title: 'Deposit success',
        description: (
          <Text>
            View on explorer: <Link isExternal>{transactionHash}</Link>
          </Text>
        ),
        status: 'success',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Deposit failed',
        status: 'error',
      })
    }

    closeModal()
  }

  return (
    <>
      <Button variant="primary" onClick={onOpen}>
        Deposit
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Deposit</ModalHeader>
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
