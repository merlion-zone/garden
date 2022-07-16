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
import { Dec, proto } from '@merlionzone/merlionjs'
import React, { useEffect, useMemo, useState } from 'react'

import { DecDisplay } from '@/components/NumberDisplay'
import config from '@/config'
import { useAccountAddress } from '@/hooks'
import {
  useAccountCollateral,
  useAllCollateralParams,
  useAllCollateralPools,
  useChainStatus,
  useDenomsMetadataMap,
  useDisplayPrice,
  useTotalCollateral,
} from '@/hooks/query'
import { Settings } from '@/pages/backing/swap-mint/Settings'
import BorrowRepay from '@/pages/collateral/BorrowRepay'
import DepositRedeem from '@/pages/collateral/DepositRedeem'
import { calculateActualLtv, calculateDebt } from '@/pages/collateral/estimate'
import { formatNumberSuitable } from '@/utils'

export default function Collateral() {
  const account = useAccountAddress()

  const { data: chainStatus } = useChainStatus()
  const { data: totalCollateral, mutate: mutateTotalCollateral } =
    useTotalCollateral()
  const { data: allCollateralParams } = useAllCollateralParams()
  const { data: allCollateralPools, mutate: mutateAllCollateralPools } =
    useAllCollateralPools()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()

  const [collateralDenom, setCollateralDenom] = useState<string | undefined>(
    undefined
  )
  const [collateralParams, setCollateralParams] = useState<
    proto.maker.CollateralRiskParams | undefined
  >(undefined)
  const [collateralPool, setCollateralPool] = useState<
    proto.maker.PoolCollateral | undefined
  >(undefined)
  useEffect(() => {
    const params = allCollateralParams?.find(
      (params) => params.collateralDenom === collateralDenom
    )
    const pool = allCollateralPools?.find(
      (params) => params.collateral?.denom === collateralDenom
    )
    setCollateralParams(params)
    setCollateralPool(pool)
  }, [collateralDenom, allCollateralParams, allCollateralPools])

  const { data: accountCollateral, mutate: mutateAccountCollateral } =
    useAccountCollateral(account?.mer(), collateralDenom)

  const { data: collateralPrice } = useDisplayPrice(collateralDenom)
  const { data: lionPrice } = useDisplayPrice(config.denom)
  const { data: merPrice } = useDisplayPrice(config.merDenom)

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
    if (!debt.greaterThan(0)) {
      return undefined
    }
    return new Dec(accountCollateral?.collateral?.amount)
      .mul(collateralPrice || 0)
      .divPow(collateralToken.metadata?.displayExponent || 0)
      .mul(Dec.fromProto(collateralParams?.liquidationThreshold || ''))
      .div(debt.divPow(config.merDenomDecimals))
      .toDecimalPlaces(2)
      .toString()
  }, [
    accountCollateral,
    collateralParams,
    collateralPrice,
    collateralToken,
    debt,
  ])

  const centerTitle = useBreakpointValue({ base: false, md: true })

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
                  <Settings />
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
                      <Text>USM Debt:</Text>
                      <Text>
                        {formatNumberSuitable(
                          debt.toString(),
                          config.merDenomDecimals,
                          2
                        )}
                        &nbsp;
                        {config.merDisplayDenom}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>USM Loanable:</Text>
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
                    <HStack justify="space-between">
                      <Text>Health Factor:</Text>
                      <Text>{healthFactor ?? <>&infin;</>}</Text>
                    </HStack>
                  </Stack>
                </Stack>
              </Stack>

              <Stack>
                <Text fontSize="lg">
                  {collateralToken.metadata?.symbol} Collateral Pool
                </Text>
                <Stack fontSize="sm" spacing="8" ps="4">
                  <Stack>
                    <HStack justify="space-between">
                      <Text>Basic Collateral Ratio:</Text>
                      <Text>
                        <DecDisplay
                          value={collateralParams?.basicLoanToValue}
                          percentage
                        />
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Premium Collateral Ratio:</Text>
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
                  <Stack>
                    <HStack justify="space-between">
                      <Text>Borrow Fee:</Text>
                      <Text>
                        <DecDisplay
                          value={collateralParams?.mintFee}
                          percentage
                        />
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Interest APY:</Text>
                      <Text>
                        <DecDisplay
                          value={collateralParams?.interestFee}
                          percentage
                        />
                      </Text>
                    </HStack>
                  </Stack>
                  <Stack>
                    <HStack justify="space-between">
                      <Text>Liquidation Fee:</Text>
                      <Text>
                        <DecDisplay
                          value={collateralParams?.liquidationFee}
                          percentage
                        />
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Liquidation Threshold:</Text>
                      <Text>
                        <DecDisplay
                          value={collateralParams?.liquidationThreshold}
                          percentage
                        />
                      </Text>
                    </HStack>
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

              <BorrowRepay isBorrow={isDepositBorrow} />
            </Stack>
          </SimpleGrid>
        </Stack>
      </Box>
    </Container>
  )
}
