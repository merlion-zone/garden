import { IconButton, Tooltip } from '@chakra-ui/react'
import { PlacementWithLogical } from '@chakra-ui/popper/dist/declarations/src/popper.placement'
import { FaQuestionCircle, FaRegQuestionCircle } from 'react-icons/fa'
import { BsQuestionCircle } from 'react-icons/bs'
import { ReactNode } from 'react'

interface HintProps {
  hint: string
  ariaLabel?: string
  placement?: PlacementWithLogical
  outlineQuestionIcon?: boolean
}

export const Hint = ({
  hint,
  ariaLabel,
  placement,
  outlineQuestionIcon,
}: HintProps) => (
  <Tooltip hasArrow placement={placement ?? 'top'} label={hint}>
    <IconButton
      variant="ghost"
      size="xs"
      color="subtle"
      icon={outlineQuestionIcon ? <BsQuestionCircle /> : <FaQuestionCircle />}
      aria-label={ariaLabel ?? hint}
    ></IconButton>
  </Tooltip>
)

interface WithHintProps {
  children: ReactNode
  hint: ReactNode
  placement?: PlacementWithLogical
}

export const WithHint = ({ hint, placement, children }: WithHintProps) => (
  <Tooltip hasArrow placement={placement ?? 'top'} label={hint}>
    {children}
  </Tooltip>
)
