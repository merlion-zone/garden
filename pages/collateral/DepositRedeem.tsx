import { Box, Button, useDisclosure } from '@chakra-ui/react'
import { Dec } from '@merlionzone/merlionjs'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce, useDeepCompareEffect } from 'react-use'

import { AmountInput } from '@/components/AmountInput'
import config from '@/config'
import { useAccountAddress } from '@/hooks'
import {
  errors,
  useAccountCollateral,
  useBalance,
  useChainStatus,
  useCollateralParams,
  useCollateralPool,
  useDenomsMetadataMap,
  useDisplayPrice,
  useFirstCollateralDenom,
} from '@/hooks/query'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useSwapMintSettings } from '@/hooks/useSetting'
import { useToast } from '@/hooks/useToast'
import { SelectTokenModal } from '@/pages/backing/swap-mint/SelectTokenModal'
import { InputKind } from '@/pages/backing/swap-mint/estimateSwapMint'
import { LtvSlider } from '@/pages/collateral/LtvSlider'
import { depositOrRedeem } from '@/pages/collateral/depositOrRedeem'
import { calculateActualLtv, calculateDebt } from '@/pages/collateral/estimate'

export default function DepositRedeem({
  isDeposit,
  onSetCollateralDenom,
}: {
  isDeposit: boolean
  onSetCollateralDenom(denom?: string): void
}) {
  const account = useAccountAddress()

  const { data: chainStatus } = useChainStatus()
  const { data: denomsMetadataMap } = useDenomsMetadataMap()

  const [collateralDenom, setCollateralDenom] = useState<string | undefined>(
    undefined
  )
  const { denom: firstCollateralDenom } = useFirstCollateralDenom()
  useEffect(() => {
    setCollateralDenom(firstCollateralDenom)
  }, [firstCollateralDenom])
  useEffect(() => {
    onSetCollateralDenom(collateralDenom)
  }, [collateralDenom, onSetCollateralDenom])

  const { params: collateralParams } = useCollateralParams(collateralDenom)
  const { pool: collateralPool, mutate: mutateCollateralPool } =
    useCollateralPool(collateralDenom)

  const { data: accountCollateral, mutate: mutateAccountCollateral } =
    useAccountCollateral(account?.mer(), collateralDenom)

  const { data: collateralPrice } = useDisplayPrice(collateralDenom)
  const { data: lionPrice } = useDisplayPrice(config.denom)

  const { balance: collateralBalance, mutate: mutateCollateralBalance } =
    useBalance(account?.mer(), collateralDenom)
  const { balance: lionBalance, mutate: mutateLionBalance } = useBalance(
    account?.mer(),
    config.denom
  )

  const collateralToken = useMemo(() => {
    return {
      metadata: denomsMetadataMap?.get(collateralDenom!),
      price: collateralPrice,
    }
  }, [denomsMetadataMap, collateralDenom, collateralPrice])

  const { maxLoan } = useMemo(
    () =>
      calculateActualLtv({
        isDeposit: isDeposit,
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
      isDeposit,
      lionPrice,
    ]
  )
  const { debt } = useMemo(
    () =>
      calculateDebt({
        collateralParams,
        accountCollateral,
        latestBlockHeight: chainStatus?.syncInfo.latestBlockHeight,
      }),
    [accountCollateral, chainStatus, collateralParams]
  )

  const [disabled, setDisabled] = useState(false)
  const [sendEnabled, setSendEnabled] = useState(false)
  const [sendTitle, setSendTitle] = useState<string>('')
  const setInitialTitle = useCallback(() => {
    setSendTitle(isDeposit ? 'Deposit' : 'Redeem')
  }, [isDeposit])

  const [collateralAmt, setCollateralAmt] = useState('')
  const [lionAmt, setLionAmt] = useState('')
  const [feeAmt, setFeeAmt] = useState('')

  const [inputKind, setInputKind] = useState<InputKind>(InputKind.None)

  const { sendTx, isSendReady } = useSendCosmTx()
  const { expertMode, slippageTolerance } = useSwapMintSettings()
  const toast = useToast()

  // initial states
  useEffect(() => {
    setDisabled(false)
    setSendEnabled(false)
    setInitialTitle()

    setCollateralAmt('')
    setLionAmt('')
    setFeeAmt('')
  }, [isDeposit, setInitialTitle])

  // check availability
  useDeepCompareEffect(() => {
    // check collateral pool availability
    if (collateralParams && !collateralParams.enabled) {
      setDisabled(true)
      setSendEnabled(false)
      setSendTitle(errors.collateralDisabled)
      return
    }

    if (isDeposit) {
    } else {
      // check redeem
      if (!maxLoan.greaterThan(0) || debt.greaterThanOrEqualTo(maxLoan)) {
        setDisabled(true)
        setSendEnabled(false)
        setSendTitle(errors.noCollateralRedeemable)
      } else {
        setDisabled(false)
        setInitialTitle()
      }
    }
  }, [
    collateralDenom,
    collateralParams,
    debt,
    isDeposit,
    maxLoan,
    setInitialTitle,
  ])

  const onInput = useCallback(
    (name: string, value: string) => {
      switch (name) {
        case collateralToken.metadata?.base:
          setInputKind(InputKind.Collateral)
          setCollateralAmt(value)
          setLionAmt('') // it's ok
          break
        case config.denom:
          setInputKind(InputKind.Lion)
          setLionAmt(value)
          break
      }
    },
    [collateralToken]
  )

  // estimate deposit/redeem
  useDebounce(
    () => {
      if (
        disabled ||
        !collateralToken.metadata ||
        !collateralPool?.collateral ||
        !collateralParams ||
        !collateralPrice ||
        !accountCollateral?.collateral
      ) {
        return
      }
      if (inputKind === InputKind.None) {
        return
      }
      setInputKind(InputKind.None)

      const collateralAmount = new Dec(collateralAmt)
        .mulPow(collateralToken.metadata.displayExponent)
        .toInt()
      const lionAmount = new Dec(lionAmt).mulPow(config.denomDecimals).toInt()
      if (!collateralAmount.greaterThan(0) && !lionAmount.greaterThan(0)) {
        setSendEnabled(false)
        setInitialTitle()
        return
      }

      if (isDeposit) {
        // estimate deposit
        if (collateralAmount.greaterThan(collateralBalance || 0)) {
          setSendEnabled(false)
          setSendTitle(errors.collateralInsufficientBalance)
          return
        }
        if (
          collateralAmount
            .add(collateralPool.collateral.amount)
            .greaterThan(collateralParams.maxCollateral)
        ) {
          setSendEnabled(false)
          setSendTitle(errors.collateralInsufficientQuota)
          return
        }
        if (lionAmount.greaterThan(lionBalance || 0)) {
          setSendEnabled(false)
          setSendTitle(errors.lionInsufficientBalance)
          return
        }
      } else {
        // estimate redeem
        const { ltv, error } = calculateActualLtv({
          isDeposit: isDeposit,
          collateralParams,
          collateralToken,
          accountCollateral,
          collateralPrice,
          lionPrice,
          collateralAmt,
          lionAmt,
        })
        if (
          error ||
          new Dec(accountCollateral.collateral.amount)
            .sub(collateralAmount)
            .mul(collateralPrice)
            .divPow(collateralToken.metadata.displayExponent)
            .mul(ltv)
            .lessThan(debt.divPow(config.merDenomDecimals))
        ) {
          setSendEnabled(false)
          setSendTitle(errors.exceedsCollateralRedeemable)
          return
        }
      }

      setSendEnabled(true)
      setInitialTitle()
    },
    500,
    [
      collateralAmt,
      lionAmt,
      collateralParams,
      collateralPool,
      collateralToken,
      disabled,
      setInitialTitle,
      inputKind,
      isDeposit,
      collateralBalance,
      lionBalance,
      accountCollateral,
      collateralPrice,
      lionPrice,
      debt,
    ]
  )

  const onReceipt = useCallback(() => {
    setCollateralAmt('')
    setLionAmt('')
    setSendEnabled(false)

    mutateCollateralPool()
    mutateAccountCollateral()
    mutateCollateralBalance()
    mutateLionBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // on deposit/redeem tx submit
  const onDepositRedeemSubmit = useCallback(() => {
    if (!account) {
      return
    }
    depositOrRedeem({
      isDeposit: isDeposit,
      account: account.mer(),
      collateralToken,
      collateralAmt,
      lionAmt,
      sendTx,
      toast,
      onReceipt,
    })
  }, [
    account,
    collateralAmt,
    collateralToken,
    isDeposit,
    lionAmt,
    onReceipt,
    sendTx,
    toast,
  ])

  const {
    isOpen: isSelectTokenModalOpen,
    onOpen: onSelectTokenModalOpen,
    onClose: onSelectTokenModalClose,
  } = useDisclosure()
  const {
    isOpen: isConfirmModalOpen,
    onOpen: onConfirmModalOpen,
    onClose: onConfirmModalClose,
  } = useDisclosure()

  return (
    <Box>
      <AmountInput
        token={collateralToken}
        value={collateralAmt}
        onSelectToken={onSelectTokenModalOpen}
        hoverBorder
        onInput={onInput}
        isDisabled={disabled || disabled}
      ></AmountInput>

      <LtvSlider
        isDeposit={isDeposit}
        isDisabled={disabled || disabled}
        collateralParams={collateralParams}
        collateralToken={collateralToken}
        accountCollateral={accountCollateral}
        collateralPrice={collateralPrice}
        lionPrice={lionPrice}
        lionBalance={new Dec(lionBalance).divPow(config.denomDecimals)}
        collateralAmt={collateralAmt}
        lionAmt={lionAmt}
        onInput={onInput}
      />

      <Button
        w="full"
        size="xl"
        mt="4"
        borderRadius="2xl"
        fontSize="xl"
        isDisabled={!sendEnabled || !isSendReady}
        isLoading={!isSendReady}
        loadingText="Waiting for completed"
        onClick={() => {
          expertMode ? onDepositRedeemSubmit() : onConfirmModalOpen()
        }}
      >
        {sendTitle}
      </Button>

      <SelectTokenModal
        isOpen={isSelectTokenModalOpen}
        onClose={onSelectTokenModalClose}
        onSelect={(denom) => {
          setCollateralDenom(denom)
          setInputKind(InputKind.Collateral)
        }}
      />
    </Box>
  )
}
