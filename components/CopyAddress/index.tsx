import { Button, IconButton, Tooltip, useClipboard } from '@chakra-ui/react'
import { FiCheckCircle, FiCopy } from 'react-icons/fi'
import { FaQuestionCircle } from 'react-icons/fa'

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
    <Tooltip hasArrow placement="top" label={label}>
      <IconButton
        variant="ghost"
        size="xs"
        color="subtle"
        icon={!hasCopied ? <FiCopy /> : <FiCheckCircle />}
        aria-label={label}
        onClick={!hasCopied ? onCopy : () => {}}
      ></IconButton>
    </Tooltip>
  )
}
