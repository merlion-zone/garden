import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Container,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { HiMinus, HiPlus } from 'react-icons/hi'

enum ProposalType {
  TextProposal = 'TextProposal',
  CommunityPoolSpend = 'CommunityPoolSpend',
  ParameterChange = 'ParameterChange',
}

interface FormData {
  type: ProposalType
  title: string
  deposit: string
  recipient?: string
  amount?: string
  changes?: { subspace: string; key: string; value: string }[]
}

export function NewProposal() {
  const [type, setType] = useState<ProposalType>(ProposalType.TextProposal)
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      type: ProposalType.TextProposal,
      changes: [{}],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'changes',
  })

  const onSubmit = (value: FormData) => {
    console.log(value)
  }

  const onMax = () => {}

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'type') {
        setType(value.type ?? ProposalType.TextProposal)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  return (
    <>
      <Container
        as="section"
        maxW="5xl"
        pt={{ base: '6', md: '10' }}
        pb={{ base: '4', md: '8' }}
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
              New proposal
            </Heading>
            <Text color="muted">{/*  */}</Text>
          </Stack>
        </Stack>
      </Container>
      <Divider maxW="5xl" mx="auto" />
      <Container
        maxW="3xl"
        pt={{ base: '6', md: '10' }}
        pb={{ base: '4', md: '8' }}
      >
        <Stack bg="bg-surface" p="8" rounded="lg" spacing="8">
          <Stack spacing="4">
            <Alert
              status="success"
              variant="solid"
              rounded="lg"
              alignItems="start"
            >
              <AlertTitle>Tip:</AlertTitle>
              <AlertDescription>
                Upload proposal after forum discussion
              </AlertDescription>
            </Alert>
            <Alert
              status="warning"
              variant="solid"
              rounded="lg"
              alignItems="start"
            >
              <AlertTitle>Note:</AlertTitle>
              <AlertDescription>
                Proposal deposits will not be refunded if the proposal fails to
                reach the quorum or the result is NO_WITH_VETO
              </AlertDescription>
            </Alert>
          </Stack>
          <Stack as="form" onSubmit={handleSubmit(onSubmit)} spacing="5">
            <FormControl>
              <FormLabel>Proposal type</FormLabel>
              <Select {...register('type')}>
                <option value={ProposalType.TextProposal}>Text proposal</option>
                <option value={ProposalType.CommunityPoolSpend}>
                  Community pool spend
                </option>
                <option value={ProposalType.ParameterChange}>
                  Parameter change
                </option>
              </Select>
              <FormErrorMessage></FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input {...register('title')} />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea placeholder="We’re proposing to initiate the burn of 100,000,000 LION from the Community Pool to mint USM" />
            </FormControl>
            <FormControl isInvalid={!!errors.deposit}>
              <FormLabel>Initial deposit (optional)</FormLabel>
              <InputGroup>
                <InputLeftAddon>LION</InputLeftAddon>
                <Controller
                  control={control}
                  name="deposit"
                  render={({ field: { ref, ...restField } }) => {
                    return (
                      <NumberInput {...restField} w="full">
                        <NumberInputField
                          pr="4.5rem"
                          ref={ref}
                          roundedLeft="none"
                        />
                        <InputRightElement w="4.5rem">
                          <Button h="1.75rem" size="sm" onClick={onMax}>
                            MAX
                          </Button>
                        </InputRightElement>
                      </NumberInput>
                    )
                  }}
                />
              </InputGroup>
              <FormErrorMessage>{errors.deposit?.message}</FormErrorMessage>
            </FormControl>
            {type === ProposalType.CommunityPoolSpend && (
              <>
                <FormControl>
                  <FormLabel>Recipient</FormLabel>
                  <Input {...register('deposit')} />
                </FormControl>
                <FormControl isInvalid={!!errors.deposit}>
                  <FormLabel>Amount</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>LION</InputLeftAddon>
                    <Controller
                      control={control}
                      name="amount"
                      render={({ field: { ref, ...restField } }) => {
                        return (
                          <NumberInput {...restField} w="full">
                            <NumberInputField
                              id="amount"
                              pr="4.5rem"
                              ref={ref}
                              roundedLeft="none"
                            />
                            <InputRightElement w="4.5rem">
                              <Button h="1.75rem" size="sm" onClick={onMax}>
                                MAX
                              </Button>
                            </InputRightElement>
                          </NumberInput>
                        )
                      }}
                    />
                  </InputGroup>
                  <FormErrorMessage>{errors.deposit?.message}</FormErrorMessage>
                </FormControl>
              </>
            )}
            {type === ProposalType.ParameterChange && (
              <>
                <FormControl>
                  <FormLabel>Changes</FormLabel>
                  <Stack>
                    {fields.map((field, index) => (
                      <HStack key={field.id} spacing="4" alignItems="end">
                        <SimpleGrid flex="1" columns={3} spacing="4">
                          <Stack>
                            <Text fontSize="xs">Subspace</Text>
                            <Input
                              {...register(`changes.${index}.subspace`, {
                                required: 'Subspace is required',
                              })}
                            />
                            <FormErrorMessage>
                              {errors.changes?.[index]?.subspace?.message}
                            </FormErrorMessage>
                          </Stack>
                          <Stack>
                            <Text fontSize="xs">Key</Text>
                            <Input
                              {...register(`changes.${index}.key`, {
                                required: 'Key is required',
                              })}
                            />
                            <FormErrorMessage>
                              {errors.changes?.[index]?.key?.message}
                            </FormErrorMessage>
                          </Stack>
                          <Stack>
                            <Text fontSize="xs">Value</Text>
                            <Input
                              {...register(`changes.${index}.value`, {
                                required: 'Value is required',
                              })}
                            />
                            <FormErrorMessage>
                              {errors.changes?.[index]?.value?.message}
                            </FormErrorMessage>
                          </Stack>
                        </SimpleGrid>
                        <IconButton
                          icon={
                            index === fields.length - 1 ? (
                              <HiPlus />
                            ) : (
                              <HiMinus />
                            )
                          }
                          aria-label=""
                          variant="outline"
                          colorScheme="gray"
                          onClick={() => {
                            if (index === fields.length - 1) {
                              append([{}])
                            } else {
                              remove(index)
                            }
                          }}
                        />
                      </HStack>
                    ))}
                  </Stack>
                </FormControl>
              </>
            )}
            <Button type="submit">Submit</Button>
          </Stack>
        </Stack>
      </Container>
    </>
  )
}
