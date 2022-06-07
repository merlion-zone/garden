import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  useDisclosure,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'

interface FormData {
  amount: string
}

export function Undelegate() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<FormData>()

  const closeModal = () => {
    onClose()
    setTimeout(reset, 100)
  }

  const onSubmit = ({ amount }: FormData) => {
    // TODO
    closeModal()
  }

  return (
    <>
      <Button w="full" rounded="full" colorScheme="brand" onClick={onOpen}>
        Undelegate
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Undelegate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={!!errors.amount}>
              <FormLabel>Amount</FormLabel>
              <NumberInput>
                <NumberInputField
                  id="amount"
                  pr="4.5rem"
                  autoFocus
                  {...register('amount', { required: 'Amount is reauired' })}
                />
                <InputRightElement w="4.5rem">
                  <Button h="1.75rem" size="sm">
                    MAX
                  </Button>
                </InputRightElement>
              </NumberInput>
              <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              w="full"
              type="submit"
              rounded="full"
              colorScheme="brand"
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
