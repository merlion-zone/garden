import { SettingsIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Container,
  Divider,
  HStack,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import { Dec } from '@merlionzone/merlionjs'
import React, { useMemo, useState } from 'react'

import { WithHint } from '@/components/Hint'
import { DecDisplay } from '@/components/NumberDisplay'
import config from '@/config'
import { useAccountAddress } from '@/hooks'
import {
  useAccountCollateral,
  useChainStatus,
  useCollateralParams,
  useDenomsMetadataMap,
  useDisplayPrice,
} from '@/hooks/query'
import { Settings } from '@/pages/backing/swap-mint/Settings'
import BorrowRepay from '@/pages/collateral/borrow-repay/BorrowRepay'
import DepositRedeem from '@/pages/collateral/deposit-redeem/DepositRedeem'
import { calculateActualLtv, calculateDebt } from '@/pages/collateral/estimate'
import { formatNumberSuitable } from '@/utils'

export default function Collateral() {
  const account = useAccountAddress()

  const { data: chainStatus } = useChainStatus()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()

  const [collateralDenom, setCollateralDenom] = useState<string | undefined>(
    undefined
  )

  const { params: collateralParams } = useCollateralParams(collateralDenom)

  const { data: accountCollateral } = useAccountCollateral(
    account?.mer(),
    collateralDenom
  )

  const { data: collateralPrice } = useDisplayPrice(collateralDenom)
  const { data: lionPrice } = useDisplayPrice(config.denom)

  const collateralToken = useMemo(() => {
    return {
      metadata: denomsMetadataMap?.get(collateralDenom!),
      price: collateralPrice,
    }
  }, [denomsMetadataMap, collateralDenom, collateralPrice])

  const [isDepositBorrow, setIsDepositBorrow] = useState(true)

  const { maxLoan } = useMemo(
    () =>
      calculateActualLtv({
        isDeposit: true,
        collateralParams,
        collateralToken,
        accountCollateral,
        collateralPrice,
        lionPrice,
      }),
    [
      accountCollateral,
      collateralParams,
      collateralPrice,
      collateralToken,
      lionPrice,
    ]
  )
  const { debt, interestPerMinute } = useMemo(
    () =>
      calculateDebt({
        collateralParams,
        accountCollateral,
        latestBlockHeight: chainStatus?.syncInfo.latestBlockHeight,
      }),
    [accountCollateral, chainStatus, collateralParams]
  )

  const loanable = useMemo(() => {
    const feeRatio = Dec.fromProto(collateralParams?.mintFee || '')
    let loanable = maxLoan.sub(debt).sub(interestPerMinute).div(feeRatio.add(1))
    if (loanable.lessThan(0)) {
      loanable = new Dec(0)
    }
    return loanable.toDecimalPlaces(2 + config.merDenomDecimals)
  }, [collateralParams, debt, interestPerMinute, maxLoan])

  const healthFactor = useMemo(() => {
    if (!debt.divPow(config.merDenomDecimals).greaterThan(0)) {
      return undefined
    }
    return new Dec(accountCollateral?.collateral?.amount)
      .mul(collateralPrice || 0)
      .divPow(collateralToken.metadata?.displayExponent || 0)
      .mul(Dec.fromProto(collateralParams?.liquidationThreshold || ''))
      .div(debt.divPow(config.merDenomDecimals))
      .toDecimalPlaces(2)
  }, [
    accountCollateral,
    collateralParams,
    collateralPrice,
    collateralToken,
    debt,
  ])

  const healthFactorColor =
    !healthFactor || healthFactor.greaterThan(1.5)
      ? 'green.500'
      : healthFactor.greaterThan(1)
      ? 'orange'
      : 'red.500'

  const centerTitle = useBreakpointValue({ base: false, md: true })

  const collateralRatioHint = (
    <Text fontSize="sm">
      The maximum USM loan ratio (called loan-to-value, or LTV) depends on the
      BasicLTV and PremiumLTV for this collateral pool, and the additional
      LION-boosting catalytic added by you.
    </Text>
  )

  return (
    <Container centerContent>
      <Box
        w={{ base: 'full', md: '4xl' }}
        m="16"
        p="4"
        bg={useColorModeValue('white', 'gray.900')}
        boxShadow={useColorModeValue('lg', 'lg-dark')}
        borderRadius="3xl"
      >
        <HStack justify="space-between" pt="2" pb="4">
          {centerTitle && <Box></Box>}
          <Button
            variant="ghost"
            fontSize="lg"
            fontWeight="bold"
            onClick={() => setIsDepositBorrow(!isDepositBorrow)}
          >
            {isDepositBorrow ? 'Deposit & Borrow' : 'Redeem & Repay'}
          </Button>
          {!centerTitle && <Box></Box>}
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <IconButton
                variant="ghost"
                aria-label="Setting"
                icon={<SettingsIcon />}
              ></IconButton>
            </PopoverTrigger>
            <Portal>
              <PopoverContent>
                <PopoverBody>
                  <Settings hideSlippageTolerance />
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </Popover>
        </HStack>

        <Divider />

        <Stack spacing={{ base: '5', lg: '6' }} my="8">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="20">
            <Stack spacing="16" mx="4">
              <Stack>
                <Text fontSize="lg">
                  Your {collateralToken.metadata?.symbol} Position
                </Text>
                <Stack fontSize="sm" spacing="8" ps="4">
                  <Stack>
                    <HStack justify="space-between">
                      <Text>Collateral Deposit:</Text>
                      <Text>
                        {formatNumberSuitable(
                          accountCollateral?.collateral?.amount || 0,
                          collateralToken.metadata?.displayExponent,
                          collateralToken.metadata?.displayExponent
                        )}
                        &nbsp;
                        {collateralToken.metadata?.symbol}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Catalytic LION:</Text>
                      <Text>
                        {formatNumberSuitable(
                          accountCollateral?.lionCollateralized?.amount || 0,
                          config.denomDecimals
                        )}
                        &nbsp;
                        {config.displayDenom}
                      </Text>
                    </HStack>
                  </Stack>
                  <Stack>
                    <HStack justify="space-between">
                      <Text>Debt:</Text>
                      <Text>
                        {formatNumberSuitable(
                          debt.toString(),
                          config.merDenomDecimals,
                          config.merDenomDecimals
                        )}
                        &nbsp;
                        {config.merDisplayDenom}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Loanable:</Text>
                      <Text>
                        {formatNumberSuitable(
                          loanable.toString(),
                          config.merDenomDecimals,
                          2
                        )}
                        &nbsp;
                        {config.merDisplayDenom}
                      </Text>
                    </HStack>
                    <WithHint hint="Safety of your deposited collateral against the borrowed USM. If the health factor goes below 1, the liquidation of your collateral might be triggered.">
                      <HStack justify="space-between" h="7">
                        <Text>Health Factor:</Text>
                        <Text
                          color={healthFactorColor}
                          fontSize={!healthFactor ? 'lg' : undefined}
                          fontWeight="bold"
                        >
                          {healthFactor ? (
                            healthFactor.toString()
                          ) : (
                            <>&infin;</>
                          )}
                        </Text>
                      </HStack>
                    </WithHint>
                  </Stack>
                </Stack>
              </Stack>

              <Stack>
                <Text fontSize="lg">
                  {collateralToken.metadata?.symbol} Collateral Params
                </Text>
                <Stack fontSize="sm" spacing="8" ps="4">
                  <WithHint hint={collateralRatioHint}>
                    <Stack>
                      <HStack justify="space-between">
                        <Text>Basic LTV:</Text>
                        <Text>
                          <DecDisplay
                            value={collateralParams?.basicLoanToValue}
                            percentage
                          />
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Premium LTV:</Text>
                        <Text>
                          <DecDisplay
                            value={collateralParams?.loanToValue}
                            percentage
                          />
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Catalytic LION Ratio:</Text>
                        <Text>
                          <DecDisplay
                            value={collateralParams?.catalyticLionRatio}
                            percentage
                          />
                        </Text>
                      </HStack>
                    </Stack>
                  </WithHint>
                  <Stack>
                    <WithHint hint="The fee is added to your debt every time you borrow USM.">
                      <HStack justify="space-between">
                        <Text>Borrow Fee:</Text>
                        <Text>
                          <DecDisplay
                            value={collateralParams?.mintFee}
                            percentage
                          />
                        </Text>
                      </HStack>
                    </WithHint>
                    <WithHint hint="The annualized percent that your debt will increase each year.">
                      <HStack justify="space-between">
                        <Text>Interest APY:</Text>
                        <Text>
                          <DecDisplay
                            value={collateralParams?.interestFee}
                            percentage
                          />
                        </Text>
                      </HStack>
                    </WithHint>
                  </Stack>
                  <Stack>
                    <WithHint hint="The discount a liquidator gets when buying collateral flagged for liquidation.">
                      <HStack justify="space-between">
                        <Text>Liquidation Fee:</Text>
                        <Text>
                          <DecDisplay
                            value={collateralParams?.liquidationFee}
                            percentage
                          />
                        </Text>
                      </HStack>
                    </WithHint>
                    <WithHint hint="The maximum threshold of debt that will be flagged for liquidation.">
                      <HStack justify="space-between">
                        <Text>Liquidation Threshold:</Text>
                        <Text>
                          <DecDisplay
                            value={collateralParams?.liquidationThreshold}
                            percentage
                          />
                        </Text>
                      </HStack>
                    </WithHint>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            <Stack spacing="8">
              <DepositRedeem
                isDeposit={isDepositBorrow}
                onSetCollateralDenom={setCollateralDenom}
              />

              <Divider />

              <BorrowRepay
                isBorrow={isDepositBorrow}
                collateralDenom={collateralDenom}
              />
            </Stack>
          </SimpleGrid>
        </Stack>
      </Box>
    </Container>
  )
}
