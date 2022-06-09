import { IconButton, Tooltip } from '@chakra-ui/react'
import { FaQuestionCircle, FaRegQuestionCircle } from 'react-icons/fa'

interface HintProps {
  hint: string
  ariaLabel?: string
  outlineQuestionIcon?: boolean
}

export const Hint = ({ hint, ariaLabel, outlineQuestionIcon }: HintProps) => (
  <Tooltip hasArrow placement="top" label={hint}>
    <IconButton
      variant="ghost"
      size="xs"
      color="subtle"
      icon={
        outlineQuestionIcon ? <FaRegQuestionCircle /> : <FaQuestionCircle />
      }
      aria-label={ariaLabel ?? hint}
    ></IconButton>
  </Tooltip>
)
