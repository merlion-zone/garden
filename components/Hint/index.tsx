import {
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  PopoverArrow,
} from '@chakra-ui/react'
import { PlacementWithLogical } from '@chakra-ui/popper/dist/declarations/src/popper.placement'
import { FaQuestionCircle, FaRegQuestionCircle } from 'react-icons/fa'
import { BsQuestionCircle } from 'react-icons/bs'
import { isValidElement, ReactElement, ReactNode } from 'react'

interface WithHintProps {
  children: ReactNode
  hint: ReactNode
  placement?: PlacementWithLogical
}

export const WithHint = ({ hint, placement, children }: WithHintProps) => (
  <Popover placement={placement ?? 'top'} trigger="hover" preventOverflow flip>
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
  ariaLabel?: string
  placement?: PlacementWithLogical
  outlineQuestionIcon?: boolean
  icon?: ReactElement
  onClick?: () => void
}

export const HintButton = ({
  hint,
  ariaLabel,
  placement,
  outlineQuestionIcon,
  icon,
  onClick,
}: HintButtonProps) => (
  <WithHint hint={hint} placement={placement}>
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
