import {
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { Dec } from '@merlionzone/merlionjs'
import { BiExtension } from 'react-icons/bi'

import { Card } from '@/components/Card'
import { HintButton, WithHint } from '@/components/Hint'
import { DecDisplay } from '@/components/NumberDisplay'
import { useBackingRatio, useMakerParams } from '@/hooks/query'

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
            <HintButton hint="(BR) The ratio of backing and LION depends on the market's pricing of the USM stablecoin"></HintButton>
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
            <HintButton hint="The last block at which backing ratio was adjusted"></HintButton>
          </HStack>
          <Text>{backingRatio?.lastUpdateBlock.toString() || 0}</Text>
        </HStack>
        <HStack align="baseline" justify="space-between">
          <HStack align="baseline">
            <Text>Adjusting Step:</Text>
            <HintButton hint="Step of adjusting backing ratio"></HintButton>
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
            <HintButton hint="Price band for adjusting backing ratio"></HintButton>
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
            <HintButton hint="Cooldown period blocks for adjusting backing ratio"></HintButton>
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
            hint="FBA system parameters"
            placement="bottom"
          ></HintButton>
        </HStack>

        <Stack py="2" align="center">
          <HStack align="baseline">
            <WithHint
              hint={
                "(BR) The ratio of backing and LION depends on the market's pricing of the USM stablecoin"
              }
            >
              <Text color={gray}>Backing Ratio</Text>
            </WithHint>
            <Text fontSize="3xl">
              <DecDisplay
                value={backingRatio?.backingRatio || 0}
                percentage
              ></DecDisplay>
            </Text>

            <WithHint hint={<BackingRatioDetails />} clickTrigger>
              <IconButton
                variant="ghost"
                aria-label="Backing Ration Details"
                icon={<Icon as={BiExtension} />}
              ></IconButton>
            </WithHint>
          </HStack>
          <HStack align="baseline">
            <WithHint
              hint={
                'The upper limit of USM price (against $USD) allowing mint and the lower limit of USM price allowing burn'
              }
            >
              <Text color={gray}>Mint/Burn Price Limit</Text>
            </WithHint>
            <Text fontSize="3xl">
              <DecDisplay
                value={
                  (makerParams &&
                    new Dec(1).add(Dec.fromProto(makerParams.mintPriceBias))) ||
                  0
                }
                percentage
              ></DecDisplay>
              /
              <DecDisplay
                value={
                  (makerParams &&
                    new Dec(1).sub(Dec.fromProto(makerParams.burnPriceBias))) ||
                  0
                }
                percentage
              ></DecDisplay>
            </Text>
          </HStack>
          <HStack align="baseline">
            <WithHint
              hint={
                'When actual backing ratio is less than system BR, arbitrager can swap backing assets for LION * (1 + bonus)'
              }
            >
              <Text color={gray}>Reback Bonus</Text>
            </WithHint>
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
            hint="OCC system parameters"
            placement="bottom"
          ></HintButton>
        </HStack>

        <Stack py="2" align="center">
          <HStack align="baseline">
            <WithHint
              hint={
                'The commission fee comes from liquidation bonus/penalty and it will be paid to the network'
              }
            >
              <Text color={gray}>Liquidation Commission Fee</Text>
            </WithHint>
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
