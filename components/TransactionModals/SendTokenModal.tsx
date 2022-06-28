import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { MsgSendEncodeObject } from '@cosmjs/stargate'
import { useAccountAddress } from '@/hooks'
import { Address, Coin, Dec, typeUrls } from '@merlionzone/merlionjs'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useToast } from '@/hooks/useToast'
import { TransactionToast } from '@/components/TransactionToast'
import {
  Box,
  Button,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react'
import { AmountInput } from '@/components/AmountInput'
import {
  errors,
  useBalance,
  useDenomsMetadataMap,
  useDisplayCoinPrice,
} from '@/hooks/query'
import { formatNumber } from '@/utils'

interface SendTokenModalProps {
  denom: string
  isOpen: boolean

  onClose(): void
}

export const SendTokenModal = ({
  denom,
  isOpen,
  onClose,
}: SendTokenModalProps) => {
  const account = useAccountAddress()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()
  const { displayPrice } = useDisplayCoinPrice(denom)

  const amountMedata = useMemo(() => {
    return {
      metadata: denomsMetadataMap?.get(denom),
      price: displayPrice,
    }
  }, [denom, denomsMetadataMap, displayPrice])

  const { balance } = useBalance(account?.mer(), amountMedata.metadata?.base)
  const balanceDisplay = new Dec(balance).divPow(
    amountMedata.metadata?.displayExponent || 0
  )

  const amountId = useId()
  const receiverId = useId()
  const memoId = useId()
  const [amount, setAmount] = useState('')
  const [receiver, setReceiver] = useState('')
  const [memo, setMemo] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)
  const [title, setTitle] = useState('')

  useEffect(() => {
    try {
      // TODO: consider gas fee for LION
      if (balanceDisplay.lessThan(amount)) {
        setTitle(errors.insufficientBalance(amountMedata.metadata?.symbol))
        setIsDisabled(true)
        return
      }
    } catch {
      setIsDisabled(true)
      setTitle('Send Token')
      return
    }
    try {
      new Address(receiver)
    } catch {
      setTitle(receiver ? errors.invalidReceiverAddress : 'Send Token')
      setIsDisabled(true)
      return
    }
    setIsDisabled(false)
    setTitle('Send Token')
  }, [amount, amountMedata, balanceDisplay, receiver])

  const onInput = useCallback((name: string, value: string) => {
    setAmount(value)
  }, [])

  const { sendTx, isSendReady } = useSendCosmTx()
  const toast = useToast()

  const onCloseClean = useCallback(() => {
    setAmount('')
    setReceiver('')
    setMemo('')
    onClose()
  }, [onClose])

  // TODO: confirmation modal
  const onSend = useCallback(() => {
    if (!account || !amountMedata.metadata) {
      return
    }
    const toAddr = new Address(receiver).mer()
    const amt = new Dec(amount)
      .mulPow(amountMedata.metadata.displayExponent)
      .toString()
    const msgSend: MsgSendEncodeObject = {
      typeUrl: typeUrls.MsgSend,
      value: {
        fromAddress: account.mer(),
        toAddress: toAddr,
        amount: [new Coin(denom, amt.toString()).toProto()],
      },
    }

    const receiptPromise = sendTx(msgSend, memo.trim())

    const title = `Send ${formatNumber(
      amount,
      amountMedata.metadata.displayExponent
    )} ${amountMedata.metadata.symbol} to ${toAddr}`

    toast({
      render: ({ onClose }) => {
        return (
          <TransactionToast
            title={title}
            receiptPromise={receiptPromise}
            onClose={onClose}
          />
        )
      },
    })

    receiptPromise?.finally(() => {
      onCloseClean()
    })
  }, [
    account,
    amountMedata.metadata,
    receiver,
    amount,
    denom,
    sendTx,
    memo,
    toast,
    onCloseClean,
  ])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onCloseClean} isCentered>
        <ModalOverlay />
        <ModalContent bg="bg-surface">
          <ModalHeader>Send Token</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="6">
            <Stack spacing="8">
              <Box>
                <FormLabel htmlFor={amountId}>Amount</FormLabel>
                <AmountInput
                  id={amountId}
                  token={amountMedata}
                  value={amount}
                  onInput={onInput}
                  bg={useColorModeValue('white', 'gray.800')}
                  border={{
                    borderRadius: 'xl',
                    borderColor: 'inherit',
                  }}
                  hoverBorder
                  focusBorder
                ></AmountInput>
              </Box>

              <Box>
                <FormLabel htmlFor={receiverId}>Receiver</FormLabel>
                <Input
                  id={receiverId}
                  placeholder="Cosm address or ERC20 address"
                  size="lg"
                  value={receiver}
                  onChange={(event) => setReceiver(event.target.value.trim())}
                />
              </Box>

              <Box>
                <FormLabel htmlFor={memoId}>Memo</FormLabel>
                <Input
                  id={memoId}
                  placeholder="Memo text"
                  size="lg"
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                />
              </Box>

              <Button
                size="lg"
                isDisabled={isDisabled}
                isLoading={!isSendReady}
                loadingText="Waiting for transaction completed"
                onClick={onSend}
              >
                {title}
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
