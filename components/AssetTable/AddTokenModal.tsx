import {
  Button,
  Collapse,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { ethers } from 'ethers'
import { useCallback, useState } from 'react'
import { useDebounce } from 'react-use'

import { useDenomMetadata } from '@/hooks/query'
import { useCachedDenoms } from '@/hooks/useCachedDenoms'

interface AddTokenModalProps {
  isOpen: boolean

  onClose(): void
}

export const AddTokenModal = ({ isOpen, onClose }: AddTokenModalProps) => {
  const { addDenom, hasDenom } = useCachedDenoms()

  const [denomInput, setDenomInput] = useState('')
  const [denom, setDenom] = useState<string | undefined>(undefined)

  const { data: denomMetadata } = useDenomMetadata(denom)

  useDebounce(
    () => {
      if (!denomInput) {
        setDenom(undefined)
        return
      }
      const denom = ethers.utils.isAddress(denomInput)
        ? `erc20/${ethers.utils.getAddress(denomInput)}`
        : denomInput
      setDenom(denom)
    },
    1000,
    [denomInput]
  )

  const onCloseClean = useCallback(() => {
    setDenomInput('')
    onClose()
  }, [onClose])

  const onAdd = useCallback(() => {
    if (!denomMetadata) {
      return
    }
    addDenom(denomMetadata.base)
    setDenomInput('')
    onCloseClean()
  }, [addDenom, denomMetadata, onCloseClean])

  const borderColor = useColorModeValue('gray.300', 'gray.700')

  return (
    <Modal isOpen={isOpen} onClose={onCloseClean} isCentered>
      <ModalOverlay />
      <ModalContent bg="bg-surface">
        <ModalHeader>Add Token</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="6">
          <Stack spacing="6">
            <Input
              placeholder="Denom name or ERC20 address"
              size="lg"
              value={denomInput}
              onChange={(event) => setDenomInput(event.target.value.trim())}
            />

            <Collapse in={!!denomMetadata} animateOpacity>
              <Stack
                p="3"
                borderRadius="md"
                border="1px"
                borderColor={borderColor}
                fontSize="sm"
              >
                <HStack>
                  <Text>Symbol:</Text>
                  <Text>{denomMetadata?.symbol}</Text>
                </HStack>
                <HStack>
                  <Text>Decimals:</Text>
                  <Text>{denomMetadata?.displayExponent}</Text>
                </HStack>
                <HStack>
                  <Text>Description:</Text>
                  <Text noOfLines={2}>{denomMetadata?.description}</Text>
                </HStack>
              </Stack>
            </Collapse>

            <Button
              variant="solid"
              isDisabled={!denomMetadata || hasDenom(denomMetadata.base)}
              onClick={onAdd}
            >
              {!denomMetadata && denom
                ? 'Token not found'
                : denomMetadata && hasDenom(denomMetadata.base)
                ? 'Token has been added'
                : 'Add Token'}
            </Button>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
