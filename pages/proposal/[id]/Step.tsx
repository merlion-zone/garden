import {
  BoxProps,
  Circle,
  Divider,
  Icon,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { HiCheck } from 'react-icons/hi'

interface StepProps extends BoxProps {
  title: string
  description: string
  isCompleted: boolean
  isLastStep: boolean
  isFirstStep: boolean
}

export function Step(props: StepProps) {
  const {
    isCompleted,
    isLastStep,
    isFirstStep,
    title,
    description,
    ...stackProps
  } = props
  const isMobile = useBreakpointValue({ base: true, md: false })

  const orientation = useBreakpointValue<'horizontal' | 'vertical'>({
    base: 'vertical',
    md: 'horizontal',
  })

  return (
    <Stack
      spacing="4"
      direction={{ base: 'row', md: 'column' }}
      flex="1"
      {...stackProps}
    >
      <Stack
        spacing="0"
        align="center"
        direction={{ base: 'column', md: 'row' }}
      >
        <Divider
          display={isMobile ? 'none' : 'initial'}
          orientation={orientation}
          borderWidth="1px"
          borderColor={isFirstStep ? 'transparent' : 'accent'}
        />
        <Circle
          size="8"
          bg={isCompleted ? 'accent' : 'inherit'}
          borderWidth={isCompleted ? '0' : '2px'}
          borderColor="accent"
        >
          {isCompleted ? (
            <Icon as={HiCheck} color="inverted" boxSize="5" />
          ) : (
            <Circle bg="accent" size="3" />
          )}
        </Circle>
        <Divider
          orientation={orientation}
          borderWidth="1px"
          borderColor={isLastStep ? 'transparent' : 'accent'}
        />
      </Stack>
      <Stack
        spacing="0.5"
        pb={isMobile && !isLastStep ? '8' : '0'}
        align={{ base: 'start', md: 'center' }}
      >
        <Text color="emphasized" fontWeight="medium">
          {title}
        </Text>
        <Text color="muted">{description}</Text>
      </Stack>
    </Stack>
  )
}
