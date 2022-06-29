import { Button, useClipboard } from '@chakra-ui/react'
import { FiCheckCircle, FiCopy } from 'react-icons/fi'
import { HintButton } from '@/components/Hint'

export const CopyAddressButton = ({ addr }: { addr: string }) => {
  const { hasCopied, onCopy } = useClipboard(addr)
  return !hasCopied ? (
    <Button variant="ghost" size="xs" leftIcon={<FiCopy />} onClick={onCopy}>
      Copy Address
    </Button>
  ) : (
    <Button variant="ghost" size="xs" leftIcon={<FiCheckCircle />}>
      Copied
    </Button>
  )
}

export const CopyAddressIcon = ({ addr }: { addr: string }) => {
  const { hasCopied, onCopy } = useClipboard(addr)
  const label = !hasCopied ? 'Copy Address' : 'Copied'
  return (
    <HintButton
      hint={label}
      icon={!hasCopied ? <FiCopy /> : <FiCheckCircle />}
      onClick={!hasCopied ? onCopy : () => {}}
    />
  )
}
