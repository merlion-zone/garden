import {
  Box,
  BoxProps,
  Button,
  Circle,
  Container,
  Divider,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { HiCheck } from 'react-icons/hi'

export const steps = [
  {
    title: 'Created',
    description: '7 days ago',
  },
  {
    title: 'Deposit Period Ends',
    description: '7 days ago',
  },
  {
    title: 'Voting Period Starts',
    description: '7 days ago',
  },
  {
    title: 'Voting Period Ends',
    description: '7 days ago',
  },
]

export function ProposalDetail() {
  const currentStep = 3

  return (
    <>
      <Container
        maxW="5xl"
        as="section"
        pt={{ base: '4', md: '8' }}
        pb={{ base: '3', md: '5' }}
      >
        <Stack
          spacing="4"
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
        >
          <Stack spacing="1">
            <Heading
              size={useBreakpointValue({ base: 'xs', md: 'sm' })}
              fontWeight="medium"
            >
              Porposal detail
            </Heading>
            <Stack
              direction={{ base: 'column', sm: 'row' }}
              spacing={{ base: '2', sm: '6' }}
              color="muted"
            ></Stack>
          </Stack>
          <Stack direction="row" spacing="3">
            <Button variant="primary">Vote</Button>
          </Stack>
        </Stack>
      </Container>
      <Container
        as="section"
        maxW="5xl"
        pt={{ base: '3', md: '5' }}
        pb={{ base: '2', md: '4' }}
      >
        <Box rounded="lg" bg="bg-surface" p="8">
          <HStack justifyContent="space-between" alignItems="start">
            <Stack spacing="0">
              <HStack>
                <Text fontSize="xs" color="brand">
                  100
                </Text>
                <Divider orientation="vertical" h="3" />
                <Text fontSize="xs">Text proposal</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="medium">
                Proposal title
              </Text>
              <Text fontSize="xs" color="brand" mb="4">
                7 days ago
              </Text>
            </Stack>
            <Tag rounded="full" variant="solid" colorScheme="brand">
              Deposit
            </Tag>
          </HStack>
          <Text fontSize="sm">
            This is a proposal. This is a proposal. This is a proposal. This is
            a proposal. This is a proposal. This is a proposal. This is a
            proposal. This is a proposal. This is a proposal. This is a
            proposal. This is a proposal. This is a proposal. This is a
            proposal. This is a proposal. This is a proposal. This is a
            proposal. This is a proposal. This is a proposal. This is a
            proposal. This is a proposal.
          </Text>
        </Box>
      </Container>
      <Container
        as="section"
        maxW="5xl"
        pt={{ base: '3', md: '5' }}
        pb={{ base: '2', md: '4' }}
      >
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: '5', md: '6' }}>
          <Stack
            px={{ base: '2', md: '4' }}
            py={{ base: '3', md: '4' }}
            bg="bg-surface"
            borderRadius="lg"
          >
            <HStack justifyContent="space-between" spacing="0">
              <HStack>
                <Box w="4" h="4" rounded="full" bgColor="green" />
                <Text fontWeight="medium">Yes</Text>
              </HStack>
              <Text>100%</Text>
            </HStack>
            <Text>100,000 LION</Text>
          </Stack>
          <Stack
            px={{ base: '2', md: '4' }}
            py={{ base: '3', md: '4' }}
            bg="bg-surface"
            borderRadius="lg"
          >
            <HStack justifyContent="space-between" spacing="0">
              <HStack>
                <Box w="4" h="4" rounded="full" bgColor="red" />
                <Text fontWeight="medium">No</Text>
              </HStack>
              <Text>0%</Text>
            </HStack>
            <Text>0 LION</Text>
          </Stack>
          <Stack
            px={{ base: '2', md: '4' }}
            py={{ base: '3', md: '4' }}
            bg="bg-surface"
            borderRadius="lg"
          >
            <HStack justifyContent="space-between" spacing="0">
              <HStack>
                <Box w="4" h="4" rounded="full" bgColor="orange" />
                <Text fontWeight="medium">Vote</Text>
              </HStack>
              <Text>0%</Text>
            </HStack>
            <Text>0 LION</Text>
          </Stack>
          <Stack
            px={{ base: '2', md: '4' }}
            py={{ base: '3', md: '4' }}
            bg="bg-surface"
            borderRadius="lg"
          >
            <HStack justifyContent="space-between" spacing="0">
              <HStack>
                <Box w="4" h="4" rounded="full" bgColor="gray" />
                <Text fontWeight="medium">Abstain</Text>
              </HStack>
              <Text>0%</Text>
            </HStack>
            <Text>0 LION</Text>
          </Stack>
        </SimpleGrid>
      </Container>
      <Container
        as="section"
        maxW="5xl"
        pt={{ base: '3', md: '5' }}
        pb={{ base: '2', md: '4' }}
      >
        <Stack
          spacing="0"
          direction={{ base: 'column', md: 'row' }}
          rounded="lg"
          bg="bg-surface"
          py="10"
          px={{ base: '10', md: '0' }}
        >
          {steps.map((step, id) => (
            <Step
              key={id}
              cursor="pointer"
              title={step.title}
              description={step.description}
              isActive={currentStep === id}
              isCompleted={currentStep > id}
              isFirstStep={id === 0}
              isLastStep={steps.length === id + 1}
            />
          ))}
        </Stack>
      </Container>
    </>
  )
}

interface StepProps extends BoxProps {
  title: string
  description: string
  isCompleted: boolean
  isActive: boolean
  isLastStep: boolean
  isFirstStep: boolean
}

function Step(props: StepProps) {
  const {
    isActive,
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
          borderColor={
            isFirstStep
              ? 'transparent'
              : isCompleted || isActive
              ? 'accent'
              : 'inherit'
          }
        />
        <Circle
          size="8"
          bg={isCompleted ? 'accent' : 'inherit'}
          borderWidth={isCompleted ? '0' : '2px'}
          borderColor={isActive ? 'accent' : 'inherit'}
          {...props}
        >
          {isCompleted ? (
            <Icon as={HiCheck} color="inverted" boxSize="5" />
          ) : (
            <Circle bg={isActive ? 'accent' : 'border'} size="3" />
          )}
        </Circle>
        <Divider
          orientation={orientation}
          borderWidth="1px"
          borderColor={
            isCompleted ? 'accent' : isLastStep ? 'transparent' : 'inherit'
          }
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
