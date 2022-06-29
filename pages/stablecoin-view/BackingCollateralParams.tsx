import {
  HStack,
  Icon,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { Dec } from '@merlionzone/merlionjs'
import { BiExtension } from 'react-icons/bi'
import { useBackingRatio, useMakerParams } from '@/hooks/query'
import { HintButton } from '@/components/Hint'
import { Card } from '@/components/Card'
import { DecDisplay } from '@/components/NumberDisplay'

export const BackingCollateralParams = () => {
  const { data: makerParams } = useMakerParams()
  const { data: backingRatio } = useBackingRatio()

  const gray = useColorModeValue('gray.600', 'gray.400')

  const BackingRatioDetails = () => {
    return (
      <Stack spacing="0" fontSize="sm">
        <HStack align="baseline" justify="space-between">
          <HStack align="baseline">
            <Text>Backing Ratio:</Text>
            <HintButton
              hint="Backing Ratio"
              ariaLabel="Backing Ratio Tooltip"
              placement="bottom"
            ></HintButton>
          </HStack>
          <Text>
            <DecDisplay
              value={backingRatio?.backingRatio || 0}
              percentage
            ></DecDisplay>
          </Text>
        </HStack>
        <HStack align="baseline" justify="space-between">
          <HStack align="baseline">
            <Text>Updated at:</Text>
            <HintButton
              hint="Backing Ratio"
              ariaLabel="Backing Ratio Updated Time Tooltip"
              placement="bottom"
            ></HintButton>
          </HStack>
          <Text>{backingRatio?.lastUpdateBlock.toString() || 0}</Text>
        </HStack>
        <HStack align="baseline" justify="space-between">
          <HStack align="baseline">
            <Text>Adjusting Step:</Text>
            <HintButton
              hint="Backing Ratio"
              ariaLabel="Backing Ratio Adjusting Step Tooltip"
              placement="bottom"
            ></HintButton>
          </HStack>
          <Text>
            <DecDisplay
              value={makerParams?.backingRatioStep || 0}
              percentage
            ></DecDisplay>
          </Text>
        </HStack>
        <HStack align="baseline" justify="space-between">
          <HStack align="baseline">
            <Text>Price Band:</Text>
            <HintButton
              hint="Backing Ratio"
              ariaLabel="Backing Ratio Price Band Tooltip"
              placement="bottom"
            ></HintButton>
          </HStack>
          <Text>
            <DecDisplay
              value={makerParams?.backingRatioPriceBand || 0}
              prefix="&plusmn;"
              percentage
            ></DecDisplay>
          </Text>
        </HStack>
        <HStack align="baseline" justify="space-between">
          <HStack align="baseline">
            <Text>Cooldown Period:</Text>
            <HintButton
              hint="Backing Ratio"
              ariaLabel="Backing Ratio Cooldown Period Tooltip"
              placement="bottom"
            ></HintButton>
          </HStack>
          <Text>{makerParams?.backingRatioCooldownPeriod.toString() || 0}</Text>
        </HStack>
      </Stack>
    )
  }

  return (
    <>
      <Card>
        <HStack align="baseline">
          <Text>Backing Parameters</Text>
          <HintButton
            hint="FBA (fractional-backing-algorithmic) with parts of backing assets and parts of the algorithmic supply"
            ariaLabel="Backing Tooltip"
            placement="bottom"
          ></HintButton>
        </HStack>

        <Stack py="2" align="center">
          <HStack align="baseline">
            <Text color={gray}>Backing Ratio</Text>
            <Text fontSize="3xl">
              <DecDisplay
                value={backingRatio?.backingRatio || 0}
                percentage
              ></DecDisplay>
            </Text>
            <Popover placement="bottom">
              <PopoverTrigger>
                <IconButton
                  variant="ghost"
                  aria-label="Setting"
                  icon={<Icon as={BiExtension} />}
                ></IconButton>
              </PopoverTrigger>
              <Portal>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverBody>
                    <BackingRatioDetails />
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
          </HStack>
          <HStack align="baseline">
            <Text color={gray}>Mint/Burn Price Limit</Text>
            <Text fontSize="3xl">
              <DecDisplay
                value={
                  (makerParams &&
                    new Dec(1).sub(Dec.fromProto(makerParams.mintPriceBias))) ||
                  0
                }
                percentage
              ></DecDisplay>
              ~
              <DecDisplay
                value={
                  (makerParams &&
                    new Dec(1).add(Dec.fromProto(makerParams.burnPriceBias))) ||
                  0
                }
                percentage
              ></DecDisplay>
            </Text>
          </HStack>
          <HStack align="baseline">
            <Text color={gray}>Reback Bonus</Text>
            <Text fontSize="3xl">
              <DecDisplay
                value={makerParams?.rebackBonus || 0}
                percentage
              ></DecDisplay>
            </Text>
          </HStack>
        </Stack>
      </Card>

      <Card>
        <HStack align="baseline">
          <Text>Collateral Parameters</Text>
          <HintButton
            hint="OCC (over-collateralized-catalytic) over collateralized for interest-bearing lending, and loan-to-value maximized by catalytic Lion"
            ariaLabel="Collateral Tooltip"
            placement="bottom"
          ></HintButton>
        </HStack>

        <Stack py="2" align="center">
          <HStack align="baseline">
            <Text color={gray}>Liquidation Commission Fee</Text>
            <Text fontSize="3xl">
              <DecDisplay
                value={makerParams?.liquidationCommissionFee || 0}
                percentage
              ></DecDisplay>
            </Text>
          </HStack>
        </Stack>
      </Card>
    </>
  )
}
