import { PlacementWithLogical } from '@chakra-ui/popper/dist/declarations/src/popper.placement'
import {
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
} from '@chakra-ui/react'
import { ReactElement, ReactNode, isValidElement } from 'react'
import { BsQuestionCircle } from 'react-icons/bs'
import { FaQuestionCircle, FaRegQuestionCircle } from 'react-icons/fa'

interface WithHintProps {
  children: ReactNode
  hint: ReactNode
  placement?: PlacementWithLogical
  clickTrigger?: boolean
}

export const WithHint = ({
  hint,
  placement,
  clickTrigger,
  children,
}: WithHintProps) => (
  <Popover
    placement={placement ?? 'top'}
    trigger={clickTrigger ? 'click' : 'hover'}
    preventOverflow
    flip
  >
    <PopoverTrigger>
      {isValidElement(children) ? children : <span>{children}</span>}
    </PopoverTrigger>
    <Portal>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>{hint}</PopoverBody>
      </PopoverContent>
    </Portal>
  </Popover>
)

interface HintButtonProps {
  hint: string
  placement?: PlacementWithLogical
  clickTrigger?: boolean
  ariaLabel?: string
  outlineQuestionIcon?: boolean
  icon?: ReactElement
  onClick?: () => void
}

export const HintButton = ({
  hint,
  placement,
  clickTrigger,
  ariaLabel,
  outlineQuestionIcon,
  icon,
  onClick,
}: HintButtonProps) => (
  <WithHint hint={hint} placement={placement} clickTrigger={clickTrigger}>
    <IconButton
      variant="ghost"
      size="xs"
      color="subtle"
      icon={
        icon ? (
          icon
        ) : outlineQuestionIcon ? (
          <BsQuestionCircle />
        ) : (
          <FaQuestionCircle />
        )
      }
      aria-label={ariaLabel ?? hint}
      onClick={onClick}
    ></IconButton>
  </WithHint>
)
