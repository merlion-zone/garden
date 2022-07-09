import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { MsgVoteEncodeObject } from '@cosmjs/stargate'
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import Long from 'long'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'

import { useAccountAddress, useConnectWallet, useMerlionClient } from '@/hooks'

interface FormData {
  option: VoteOption
}

export function Vote() {
  const toast = useToast()
  const { query } = useRouter()
  const { connected, account } = useConnectWallet()
  const merlionClient = useMerlionClient()
  const address = useAccountAddress()

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm<FormData>()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const closeModal = () => {
    onClose()
    setTimeout(reset, 100)
  }

  const onSubmit = async ({ option }: FormData) => {
    if (!connected || !account || !query.id) {
      toast({
        title: 'Please connect wallet first',
        status: 'warning',
      })

      return
    }

    const message: MsgVoteEncodeObject = {
      typeUrl: '/cosmos.gov.v1beta1.MsgVote',
      value: {
        proposalId: Long.fromString(query.id as string),
        voter: address!.mer(),
        option: option,
      },
    }

    try {
      const { transactionHash } = await merlionClient!.signAndBroadcast(
        account!,
        [message]
      )

      toast({
        title: 'Vote success',
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
        title: 'Vote failed',
        status: 'error',
      })
    }

    closeModal()
  }

  return (
    <>
      <Button variant="primary" onClick={onOpen}>
        Vote
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
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
                  No with vote
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
