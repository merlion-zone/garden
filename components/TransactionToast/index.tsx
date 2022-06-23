import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertStatus,
  AlertTitle,
  Box,
  CloseButton,
  Link,
  Progress,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { DeliverTxResponse } from '@cosmjs/stargate'
import { useCallback, useMemo, useState } from 'react'

interface TransactionToastProps {
  receiptPromise?: Promise<DeliverTxResponse>
  title: string

  onClose(): void
}

export const TransactionToast = ({
  receiptPromise,
  title,
  onClose,
}: TransactionToastProps) => {
  const [status, setStatus] = useState<AlertStatus>('loading')
  const [desc, setDesc] = useState('')
  const [txHash, setTxHash] = useState('')
  const [progress, setProgress] = useState(100)

  const progressClose = useCallback(() => {
    const start = Date.now()
    const duration = 20000
    const intervalId = setInterval(() => {
      const progress = ((start + duration - Date.now()) / duration) * 100
      if (progress < 0) {
        clearInterval(intervalId)
        return
      }
      setProgress(progress)
    }, 10)
    setTimeout(() => {
      onClose()
      clearInterval(intervalId)
    }, duration)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useMemo(() => {
    if (!receiptPromise) {
      return
    }

    receiptPromise
      .then((receipt) => {
        console.debug(receipt)
        setTxHash(receipt.transactionHash)
        if (receipt.code) {
          console.warn(
            `Deliver transaction: ${receipt.code}, ${receipt.rawLog}`
          )
          setStatus('warning')
        } else {
          setStatus('success')
        }
      })
      .catch((e) => {
        console.error(`Deliver transaction: ${e}`)
        setStatus('error')
        if (e.toString().includes('Request rejected')) {
          setDesc('Transaction rejected')
        }
      })
      .finally(() => {
        progressClose()
      })
  }, [receiptPromise, progressClose])

  const statusColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box borderRadius="xl" overflow="hidden">
      <Alert variant="solid" p="4" status={status}>
        <AlertIcon />
        <Box ps="2">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>
            <Text color={statusColor}>
              {desc
                ? desc
                : status === 'loading'
                ? 'Pending'
                : status === 'success'
                ? 'Success'
                : status === 'warning'
                ? 'Failure'
                : 'Error'}
            </Text>
            {txHash && (
              <Text>
                <Link isExternal href={txHash}>
                  View on Explorer
                </Link>
              </Text>
            )}
          </AlertDescription>
        </Box>
        <CloseButton
          alignSelf="flex-start"
          position="relative"
          right={-1}
          top={-1}
          onClick={onClose}
        />
      </Alert>
      <Progress
        sx={{
          h: '3px',
        }}
        isIndeterminate={status === 'loading'}
        value={progress}
        colorScheme="brand"
      />
    </Box>
  )
}
