import {
  Button,
  ButtonProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
} from '@chakra-ui/react'
import { MsgVoteEncodeObject } from '@cosmjs/stargate'
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import Long from 'long'
import { useForm } from 'react-hook-form'

import { useAccountAddress, useConnectWallet } from '@/hooks'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'

import { TransactionToast } from '../TransactionToast'

interface VoteModalProps extends ButtonProps {
  proposalId: string
}

interface FormData {
  option: VoteOption
}

export function VoteModal({ proposalId, ...props }: VoteModalProps) {
  const toast = useToast()
  const { connected, account } = useConnectWallet()
  const { sendTx, isSendReady } = useSendCosmTx()
  const address = useAccountAddress()

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<FormData>()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const closeModal = () => {
    onClose()
    setTimeout(reset, 100)
  }

  const onSubmit = async ({ option }: FormData) => {
    if (!connected || !account) {
      toast({
        title: 'Please connect wallet first',
        status: 'warning',
      })

      return
    }

    const message: MsgVoteEncodeObject = {
      typeUrl: '/cosmos.gov.v1beta1.MsgVote',
      value: {
        proposalId: Long.fromString(proposalId),
        voter: address!.mer(),
        option: option,
      },
    }

    const receiptPromise = sendTx(message)

    let displayOption: string

    switch (option) {
      case 1:
        displayOption = '`Yes`'
        break
      case 2:
        displayOption = '`Abstain`'
        break
      case 3:
        displayOption = '`No`'
        break
      case 4:
        displayOption = '`NoWithVeto`'
        break
      default:
        displayOption = ''
        break
    }

    toast({
      render: ({ onClose }) => (
        <TransactionToast
          title={`Vote ${displayOption} for proposal: #${proposalId}`}
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
        Vote
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          bgColor="bg-surface"
        >
          <ModalHeader>Vote</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={!!errors.option}>
              <FormLabel>Option</FormLabel>
              <Select
                {...register('option', {
                  required: 'Please select a option',
                  valueAsNumber: true,
                })}
              >
                <option value={VoteOption.VOTE_OPTION_YES}>Yes</option>
                <option value={VoteOption.VOTE_OPTION_NO}>No</option>
                <option value={VoteOption.VOTE_OPTION_NO_WITH_VETO}>
                  No with veto
                </option>
                <option value={VoteOption.VOTE_OPTION_ABSTAIN}>Abstain</option>
              </Select>
              <FormErrorMessage>{errors.option?.message}</FormErrorMessage>
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
