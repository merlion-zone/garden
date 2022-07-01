import {
  Box,
  Text,
  Collapse,
  HStack,
  Stack,
  Divider,
  useDisclosure,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react'
import { useSwapMintSettings } from '@/hooks/useSetting'
import { AmountDisplay, DecDisplay } from '@/components/NumberDisplay'
import { Dec } from '@merlionzone/merlionjs'
import { DenomMetadata, useDisplayPrice } from '@/hooks/query'
import config from '@/config'
import React, { useState } from 'react'
import { ChevronDownIcon, InfoOutlineIcon } from '@chakra-ui/icons'
import { WithHint } from '@/components/Hint'

interface ExplainProps {
  loading: boolean
  isBuyback: boolean
  backingMetadata: DenomMetadata
  backingAmt: string
  lionAmt: string
  feeAmt: string
  noCollapse?: boolean
}

function exchangeRates(...amounts: [Dec, string][]) {
  const r = []
  for (let i = 0; i < amounts.length; i++) {
    if (!amounts[i][0].isZero()) {
      r.push(
        amounts.map(
          (amt) => [amt[0].div(amounts[i][0]), amt[1]] as [Dec, string]
        )
      )
    }
  }
  return r
}

export const Explain = ({
  loading,
  isBuyback,
  backingMetadata,
  backingAmt,
  lionAmt,
  feeAmt,
  noCollapse,
}: ExplainProps) => {
  const { isOpen, onToggle } = useDisclosure()

  const rates = exchangeRates(
    [new Dec(backingAmt || 0), backingMetadata.symbol],
    [new Dec(lionAmt || 0), config.displayDenom]
  )
  const [ratesIndex, setRatesIndex] = useState(0)

  const { data: backingPrice } = useDisplayPrice(backingMetadata.base)
  const { data: lionPrice } = useDisplayPrice(config.denom)
  const fee = isBuyback ? backingPrice?.mul(feeAmt) : lionPrice?.mul(feeAmt)

  const { slippageTolerance: slippage } = useSwapMintSettings()
  const tolerance = new Dec(1).sub(slippage)

  let [backingAmtMin, lionAmtMin] = [new Dec(0), new Dec(0)]
  if (isBuyback) {
    backingAmtMin = new Dec(backingAmt || 0).mul(tolerance)
  } else {
    lionAmtMin = new Dec(lionAmt || 0).mul(tolerance)
  }

  const MinReceived = () => {
    return isBuyback ? (
      <AmountDisplay
        value={backingAmtMin}
        suffix={' ' + backingMetadata.symbol}
      />
    ) : (
      <AmountDisplay value={lionAmtMin} suffix={' ' + config.displayDenom} />
    )
  }

  const ExplainDetails = () => {
    return (
      <Stack fontSize="sm">
        <HStack justify="space-between">
          <WithHint
            hint={
              'The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending.'
            }
            placement="right"
          >
            <Text>Expected Output</Text>
          </WithHint>
          <Text textAlign="end">
            {isBuyback ? (
              <AmountDisplay
                value={backingAmt || 0}
                suffix={' ' + backingMetadata.symbol}
              />
            ) : (
              <AmountDisplay
                value={lionAmt || 0}
                suffix={' ' + config.displayDenom}
              />
            )}
          </Text>
        </HStack>
        <Divider />
        <HStack justify="space-between" color="gray.500">
          <WithHint
            hint={
              'The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will revert.'
            }
            placement="right"
          >
            <Text>
              Minimum received after slippage (
              {<DecDisplay value={slippage.mul(100)} />}
              %)
            </Text>
          </WithHint>
          <Text textAlign="end">
            <MinReceived />
          </Text>
        </HStack>
        <HStack justify="space-between" color="gray.500">
          <Text>{isBuyback ? 'Buyback' : 'Reback'} Fee</Text>
          <Text textAlign="end">
            <AmountDisplay value={fee} prefix="$" />
          </Text>
        </HStack>
      </Stack>
    )
  }

  return (
    <>
      <HStack
        justify="space-between"
        my="3"
        px="3"
        mb={!(noCollapse || isOpen) ? '0' : undefined}
        fontSize="sm"
        cursor={!noCollapse ? 'pointer' : undefined}
        userSelect="none"
        borderRadius="xl"
        _hover={{
          bg: useColorModeValue('gray.50', 'gray.800'),
        }}
        onClick={onToggle}
      >
        <HStack>
          {rates.length > 0 && (
            <>
              {!noCollapse && (
                <Box w="4">
                  {loading ? (
                    <Spinner speed="0.65s" color="gray.400" size="xs" />
                  ) : isOpen ? (
                    <InfoOutlineIcon />
                  ) : (
                    <WithHint hint={<ExplainDetails />} placement="bottom">
                      <InfoOutlineIcon />
                    </WithHint>
                  )}
                </Box>
              )}
              <Box
                cursor="pointer"
                onClick={(event) => {
                  event.stopPropagation()
                  rates.length && setRatesIndex((ratesIndex + 1) % rates.length)
                }}
              >
                <AmountDisplay
                  value={rates[ratesIndex][0][0]}
                  suffix={' ' + rates[ratesIndex][0][1]}
                />
                <span> = </span>
                <AmountDisplay
                  value={rates[ratesIndex][1][0]}
                  suffix={' ' + rates[ratesIndex][1][1]}
                />
              </Box>
            </>
          )}
        </HStack>
        {!noCollapse && (
          <Text fontSize="3xl" color="gray.500">
            <ChevronDownIcon
              transition="all 0.2s ease-out"
              transform={isOpen ? 'rotate(180deg)' : undefined}
            />
          </Text>
        )}
      </HStack>
      <Collapse in={noCollapse || isOpen} animateOpacity>
        <Box
          p="3"
          borderRadius="2xl"
          border="1px"
          borderColor={useColorModeValue('gray.300', 'gray.700')}
        >
          <ExplainDetails />
        </Box>

        {noCollapse && (
          <Text fontStyle="italic" fontSize="xs" color="gray.500" mt="2">
            Output is estimated. You will receive at least {<MinReceived />} or
            the transaction will revert.
          </Text>
        )}
      </Collapse>
    </>
  )
}
