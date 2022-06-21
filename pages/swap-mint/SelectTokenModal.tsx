import { useAccountAddress } from '@/hooks'
import {
  useAllBackingParams,
  useAllBackingPools,
  useBalance,
  useBalancesMap,
  useDenomsMetadataMap,
} from '@/hooks/query'
import {
  Box,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import Avvvatars from 'avvvatars-react'
import { shortenDenom } from '@/utils'
import { AmountDisplay } from '@/components/NumberDisplay'
import React from 'react'

interface SelectTokenModalProps {
  isOpen: boolean

  onClose(): void

  onSelect(denom: string): void
}

export const SelectTokenModal = ({
  isOpen,
  onClose,
  onSelect,
}: SelectTokenModalProps) => {
  const account = useAccountAddress()
  const { data: allBackingPools } = useAllBackingPools()
  const { data: allBackingParams } = useAllBackingParams()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()

  const BalanceDisplay = ({ denom }: any) => {
    const { balance } = useBalance(account?.mer() as any, denom)
    return (
      <AmountDisplay
        value={balance}
        decimals={denomsMetadataMap?.get(denom)?.displayExponent}
      />
    )
  }

  const hoverRowBg = useColorModeValue('gray.50', 'gray.900')

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="bg-surface" maxW="lg">
        <ModalHeader>Select a backing token</ModalHeader>
        <ModalCloseButton />
        <ModalBody mb="4">
          <Box
            maxH="lg"
            borderRadius="lg"
            border="1px"
            borderColor={useColorModeValue('gray.300', 'gray.700')}
            overflowY="auto"
          >
            {allBackingParams?.map((params) => {
              return (
                <HStack
                  key={params.backingDenom}
                  cursor="pointer"
                  _hover={{ bg: hoverRowBg }}
                  py="2"
                  px="4"
                  justify="space-between"
                  onClick={() => {
                    onClose()
                    onSelect(params.backingDenom)
                  }}
                >
                  <HStack>
                    <Avvvatars value={params.backingDenom} style="shape" />
                    <Box>
                      <Text>
                        {denomsMetadataMap?.get(params.backingDenom)?.symbol}
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        {shortenDenom(params.backingDenom)}
                      </Text>
                    </Box>
                  </HStack>
                  <BalanceDisplay denom={params.backingDenom} />
                </HStack>
              )
            })}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
