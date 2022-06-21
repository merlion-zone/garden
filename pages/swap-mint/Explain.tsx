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
import { DenomMetadata, useDisplayCoinPrice } from '@/hooks/query'
import config from '@/config'
import { useState } from 'react'
import { ChevronDownIcon, InfoOutlineIcon } from '@chakra-ui/icons'

interface ExplainProps {
  loading: boolean
  isMint: boolean
  backingMetadata: DenomMetadata
  backingAmt: string
  lionAmt: string
  usmAmt: string
  feeAmt: string
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
  isMint,
  backingMetadata,
  backingAmt,
  lionAmt,
  usmAmt,
  feeAmt,
}: ExplainProps) => {
  const { isOpen, onToggle } = useDisclosure()

  const rates = exchangeRates(
    [new Dec(backingAmt || 0), backingMetadata.symbol],
    [new Dec(lionAmt || 0), config.displayDenom],
    [new Dec(usmAmt || 0), config.merDisplayDenom]
  )
  const [ratesIndex, setRatesIndex] = useState(0)

  const { displayPrice: usmPrice } = useDisplayCoinPrice(config.merDenom)
  const fee = usmPrice && feeAmt && usmPrice?.mul(feeAmt)

  const { defaultSlippageTolerance, slippageTolerance } = useSwapMintSettings()
  let slippage = new Dec(slippageTolerance || defaultSlippageTolerance)
  if (slippage.greaterThan(50)) {
    slippage = new Dec(50)
  }
  const tolerance = new Dec(1).sub(slippage.div(100))

  let [backingAmtMin, lionAmtMin, usmAmtMin] = [
    new Dec(0),
    new Dec(0),
    new Dec(0),
  ]
  if (isMint) {
    usmAmtMin = new Dec(usmAmt || 0).mul(tolerance)
  } else {
    backingAmtMin = new Dec(backingAmt || 0).mul(tolerance)
    lionAmtMin = new Dec(lionAmt || 0).mul(tolerance)
  }

  return (
    <>
      <HStack
        justify="space-between"
        my="3"
        px="3"
        mb={!isOpen ? '0' : undefined}
        fontSize="sm"
        cursor="pointer"
        userSelect="none"
        borderRadius="xl"
        _hover={{
          bg: useColorModeValue('gray.50', 'gray.800'),
        }}
        onClick={onToggle}
      >
        <HStack
          onClick={() => {
            rates.length && setRatesIndex((ratesIndex + 1) % rates.length)
          }}
        >
          {rates.length > 0 && (
            <>
              <Box w="4">
                {loading ? (
                  <Spinner speed="0.65s" color="gray.400" size="xs" />
                ) : (
                  <InfoOutlineIcon />
                )}
              </Box>
              <AmountDisplay
                value={rates[ratesIndex][0][0]}
                suffix={' ' + rates[ratesIndex][0][1]}
              />
              <span>+</span>
              <AmountDisplay
                value={rates[ratesIndex][1][0]}
                suffix={' ' + rates[ratesIndex][1][1]}
              />
              <span>=</span>
              <AmountDisplay
                value={rates[ratesIndex][2][0]}
                suffix={' ' + rates[ratesIndex][2][1]}
              />
            </>
          )}
        </HStack>
        <Text fontSize="3xl" color="gray.500">
          <ChevronDownIcon
            transition="all 0.2s ease-out"
            transform={isOpen ? 'rotate(180deg)' : undefined}
          />
        </Text>
      </HStack>
      <Collapse in={isOpen} animateOpacity>
        <Stack
          p="3"
          fontSize="sm"
          borderRadius="2xl"
          border="1px"
          borderColor={useColorModeValue('gray.300', 'gray.700')}
        >
          <HStack justify="space-between">
            <Text>Expected Output</Text>
            <Text>
              {isMint ? (
                <>
                  <AmountDisplay
                    value={usmAmt}
                    suffix={' ' + config.merDisplayDenom}
                  />
                </>
              ) : (
                <>
                  <AmountDisplay
                    value={backingAmt}
                    suffix={' ' + backingMetadata.symbol}
                  />
                  <span>+</span>
                  <AmountDisplay
                    value={lionAmt}
                    suffix={' ' + config.displayDenom}
                  />
                </>
              )}
            </Text>
          </HStack>
          <Divider />
          <HStack justify="space-between" color="gray.500">
            <Text>
              Minimum received after slippage ({<DecDisplay value={slippage} />}
              %)
            </Text>
            <Text>
              {isMint ? (
                <>
                  <AmountDisplay
                    value={usmAmtMin}
                    suffix={' ' + config.merDisplayDenom}
                  />
                </>
              ) : (
                <>
                  <AmountDisplay
                    value={backingAmtMin}
                    suffix={' ' + backingMetadata.symbol}
                  />
                  <span>+</span>
                  <AmountDisplay
                    value={lionAmtMin}
                    suffix={' ' + config.displayDenom}
                  />
                </>
              )}
            </Text>
          </HStack>
          <HStack justify="space-between" color="gray.500">
            <Text>{isMint ? 'Mint' : 'Burn'} Fee</Text>
            <Text>
              <AmountDisplay value={fee} prefix="$" />
            </Text>
          </HStack>
        </Stack>
      </Collapse>
    </>
  )
}
