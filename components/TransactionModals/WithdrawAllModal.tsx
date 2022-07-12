import {
  Button,
  ButtonProps,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { typeUrls } from '@merlionzone/merlionjs'
import { MouseEventHandler } from 'react'

import { TransactionToast } from '@/components/TransactionToast'
import { useAccountAddress, useConnectWallet } from '@/hooks'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'
import { shortenAddress } from '@/utils'

export interface WithdrawAllModalProps extends ButtonProps {
  validatorAddresses: string[]
}

export function WithdrawAllModal({
  validatorAddresses,
  ...props
}: WithdrawAllModalProps) {
  const { account, connected } = useConnectWallet()
  const { sendTx, isSendReady } = useSendCosmTx()
  const address = useAccountAddress()
  const toast = useToast()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const openModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    e.preventDefault()
    onOpen()
  }

  const closeModal = () => {
    onClose()
  }

  const onWithdraw = async () => {
    if (!connected || !account) {
      toast({
        title: 'Please connect wallet first',
        status: 'warning',
        isClosable: true,
      })
      return
    }
    const messages = validatorAddresses.map((validatorAddress) => ({
      typeUrl: typeUrls.MsgWithdrawDelegatorReward,
      value: {
        delegatorAddress: address!.mer(),
        validatorAddress,
      },
    }))
    const receiptPromise = sendTx(messages)
    toast({
      render: ({ onClose }) => {
        return (
          <TransactionToast
            title="Withdraw all rewards"
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

  return (
    <>
      <Button {...props} onClick={openModal}>
        Withdraw all rewards
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent bgColor="bg-surface">
          <ModalHeader>Withdraw</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>You will withdraw the rewards on validator:</Text>
            <List>
              {validatorAddresses.map((validatorAddress) => (
                <ListItem key={validatorAddress} justifyContent="space-between">
                  <Text fontWeight="medium">
                    {validatorAddress && shortenAddress(validatorAddress)[2]}
                  </Text>
                </ListItem>
              ))}
            </List>
            <Text fontSize="xs" fontWeight="medium"></Text>
          </ModalBody>
          <ModalFooter>
            <Button
              w="full"
              rounded="full"
              colorScheme="brand"
              onClick={onWithdraw}
              isLoading={!isSendReady}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
