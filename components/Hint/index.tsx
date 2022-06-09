import { IconButton, Tooltip } from '@chakra-ui/react'
import { FaQuestionCircle } from 'react-icons/fa'

interface HintProps {
  hint: string
  ariaLabel?: string
}

export const Hint = ({ hint, ariaLabel }: HintProps) => (
  <Tooltip hasArrow placement="top" label={hint}>
    <IconButton
      variant="ghost"
      size="xs"
      color="subtle"
      icon={<FaQuestionCircle />}
      aria-label={ariaLabel ?? hint}
    ></IconButton>
  </Tooltip>
)
