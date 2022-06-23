import config from '@/config'
import { useAccountAddress, useMerlionClient } from '@/hooks'
import { parseCoin } from '@/utils'
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
  InputRightElement,
  Link,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useBreakpointValue,
  useToast,
} from '@chakra-ui/react'
import { MsgSubmitProposalEncodeObject } from '@cosmjs/stargate'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { HiMinus, HiPlus } from 'react-icons/hi'
import { getContent, ProposalType } from './utils'

interface FormData {
  type: ProposalType
  title: string
  description: string
  deposit: string
  recipient?: string
  amount?: string
  changes?: { subspace: string; key: string; value: string }[]
}

export default function NewProposal() {
  const router = useRouter()
  const toast = useToast()
  const [type, setType] = useState<ProposalType>(ProposalType.TEXT)
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      type: ProposalType.TEXT,
      changes: [{}],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'changes',
  })

  const merlionClient = useMerlionClient()
  const address = useAccountAddress()

  const onSubmit = async ({
    deposit,
    amount = '0',
    ...contentParams
  }: FormData) => {
    const content = getContent(type, {
      ...contentParams,
      amount: [
        parseCoin({
          denom: config.displayDenom.toLowerCase(),
          amount: amount,
        }),
      ],
    })

    const msg: MsgSubmitProposalEncodeObject = {
      typeUrl: '/cosmos.gov.v1beta1.MsgSubmitProposal',
      value: {
        content: content!,
        initialDeposit: [
          parseCoin({
            denom: config.displayDenom.toLowerCase(),
            amount: deposit,
          }),
        ],
        proposer: address!.mer(),
      },
    }

    try {
      const { transactionHash } = await merlionClient!.signAndBroadcast(
        address!.mer(),
        [msg]
      )
      toast({
        title: 'Submit proposal success',
        description: (
          <Text>
            View on explorer: <Link isExternal>{transactionHash}</Link>
          </Text>
        ),
        status: 'success',
      })

      await router.push(`/governance`)
    } catch (error) {
      console.log(error)
      toast({
        title: 'Submit proposal failed',
        status: 'error',
      })
    }
  }

  const onMax = () => {}

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'type') {
        setType(value.type ?? ProposalType.TEXT)
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
                reach the quorum or the result is `NO_WITH_VETO`
              </AlertDescription>
            </Alert>
          </Stack>
          <Stack as="form" onSubmit={handleSubmit(onSubmit)} spacing="5">
            <FormControl>
              <FormLabel>Proposal type</FormLabel>
              <Select {...register('type')}>
                <option value={ProposalType.TEXT}>Text proposal</option>
                <option value={ProposalType.SPEND}>{ProposalType.SPEND}</option>
                <option value={ProposalType.PARAMS}>
                  {ProposalType.PARAMS}
                </option>
              </Select>
              <FormErrorMessage></FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                {...register('title', { required: 'Title is required' })}
              />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="We’re proposing to initiate the burn of 100,000,000 LION from the Community Pool to mint USM"
                {...register('description', {
                  required: 'Description is required',
                })}
              />
              <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
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
            {type === ProposalType.SPEND && (
              <>
                <FormControl>
                  <FormLabel>Recipient</FormLabel>
                  <Input {...register('recipient')} />
                  {/* TODO: check address */}
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
            {type === ProposalType.PARAMS && (
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
            <Button type="submit" isLoading={isSubmitting}>
              Submit
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  )
}
