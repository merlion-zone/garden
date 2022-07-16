import { Box, Button, useDisclosure } from '@chakra-ui/react'
import { Dec, proto } from '@merlionzone/merlionjs'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDebounce, useDeepCompareEffect } from 'react-use'

import { AmountInput } from '@/components/AmountInput'
import config from '@/config'
import { useAccountAddress } from '@/hooks'
import {
  errors,
  useAccountCollateral,
  useAllCollateralParams,
  useAllCollateralPools,
  useBalance,
  useChainStatus,
  useDenomsMetadataMap,
  useDisplayPrice,
  useTotalCollateral,
} from '@/hooks/query'
import { useSendCosmTx } from '@/hooks/useSendCosmTx'
import { useSwapMintSettings } from '@/hooks/useSetting'
import { useToast } from '@/hooks/useToast'
import { InputKind } from '@/pages/backing/swap-mint/estimateSwapMint'
import { borrowOrRepay } from '@/pages/collateral/borrowOrRepay'
import { depositOrRedeem } from '@/pages/collateral/depositOrRedeem'
import { calculateActualLtv, calculateDebt } from '@/pages/collateral/estimate'

export default function BorrowRepay({ isBorrow }: { isBorrow: boolean }) {
  const account = useAccountAddress()

  const { data: chainStatus } = useChainStatus()
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
    if (allCollateralParams?.length) {
      setCollateralDenom(allCollateralParams[0].collateralDenom)
    }
  }, [allCollateralParams])
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

  const { balance: collateralBalance, mutate: mutateCollateralBalance } =
    useBalance(account?.mer(), collateralDenom)
  const { balance: lionBalance, mutate: mutateLionBalance } = useBalance(
    account?.mer(),
    config.denom
  )
  const { balance: usmBalance, mutate: mutateUsmBalance } = useBalance(
    account?.mer(),
    config.merDenom
  )

  const collateralToken = useMemo(() => {
    return {
      metadata: denomsMetadataMap?.get(collateralDenom!),
      price: collateralPrice,
    }
  }, [denomsMetadataMap, collateralDenom, collateralPrice])

  const usmToken = useMemo(
    () => ({
      metadata: denomsMetadataMap?.get(config.merDenom),
      price: merPrice,
    }),
    [denomsMetadataMap, merPrice]
  )

  const { maxLoan } = useMemo(
    () =>
      calculateActualLtv({
        isDeposit: isBorrow,
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
      isBorrow,
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

  const [disabled, setDisabled] = useState(false)
  const [sendEnabled, setSendEnabled] = useState(false)
  const [sendTitle, setSendTitle] = useState<string>('')
  const setInitialTitle = useCallback(() => {
    setSendTitle(isBorrow ? 'Borrow' : 'Repay')
  }, [isBorrow])

  const [usmAmt, setUsmAmt] = useState('')
  const [feeAmt, setFeeAmt] = useState('')

  const [inputKind, setInputKind] = useState<InputKind>(InputKind.None)
  const [estimated, setEstimated] = useState(false)

  const { sendTx, isSendReady } = useSendCosmTx()
  const { expertMode, slippageTolerance } = useSwapMintSettings()
  const toast = useToast()

  // initial states
  useEffect(() => {
    setDisabled(false)
    setSendEnabled(false)
    setInitialTitle()

    setUsmAmt('')
    setFeeAmt('')

    setEstimated(false)
  }, [isBorrow, setInitialTitle])

  // check availability
  useDeepCompareEffect(() => {
    const params = allCollateralParams?.find(
      (params) => params.collateralDenom === collateralDenom
    )
    // check collateral pool availability
    if (params && !params.enabled) {
      setDisabled(true)
      setSendEnabled(false)
      setSendTitle(errors.collateralDisabled)
      return
    }

    if (isBorrow) {
      // check borrow
      if (debt.greaterThanOrEqualTo(maxLoan)) {
        setDisabled(true)
        setSendEnabled(false)
        setSendTitle(errors.noUsmLoanable)
      } else {
        setDisabled(false)
        setInitialTitle()
      }
    } else {
      // check repay
      if (!debt.greaterThan(0)) {
        setDisabled(true)
        setSendEnabled(false)
        setSendTitle(errors.noUsmDebt)
      } else {
        setDisabled(false)
        setInitialTitle()
      }
    }
  }, [
    allCollateralParams,
    collateralDenom,
    debt,
    isBorrow,
    maxLoan,
    setInitialTitle,
  ])

  const onInput = useCallback(
    (name: string, value: string) => {
      switch (name) {
        case config.merDenom:
          setInputKind(InputKind.Usm)
          setUsmAmt(value)
          break
      }
    },
    [collateralToken]
  )

  // estimate borrow/repay
  useDebounce(
    () => {
      if (disabled || !chainStatus || !accountCollateral || !collateralParams) {
        return
      }
      if (inputKind === InputKind.None) {
        return
      }
      setInputKind(InputKind.None)

      const usmAmount = new Dec(usmAmt).mulPow(config.merDenomDecimals).toInt()
      if (isBorrow) {
        // estimate borrow
        const feeRatio = Dec.fromProto(collateralParams.mintFee)
        const feeAmount = usmAmount.mul(feeRatio)
        if (
          usmAmount
            .add(feeAmount)
            .add(debt)
            .add(interestPerMinute)
            .greaterThan(maxLoan)
        ) {
          setSendEnabled(false)
          setSendTitle(errors.exceedsCollateralLoanable)
          return
        }
        if (
          collateralParams.maxMerMint &&
          usmAmount
            .add(feeAmount)
            .add(collateralPool?.merDebt?.amount || 0)
            .greaterThan(collateralParams.maxMerMint)
        ) {
          setSendEnabled(false)
          setSendTitle(errors.usmInsufficientQuota)
          return
        }

        setSendEnabled(true)
        setInitialTitle()
      } else {
        // estimate repay
        if (usmAmount.greaterThan(usmBalance || 0)) {
          setSendEnabled(false)
          setSendTitle(errors.usmInsufficientBalance)
          return
        }

        setSendEnabled(true)
        setInitialTitle()
        if (usmAmount.greaterThan(debt.add(interestPerMinute))) {
          let repayMax = new Dec(debt.add(interestPerMinute))
          if (repayMax.greaterThan(usmBalance || 0)) {
            repayMax = new Dec(usmBalance)
          }
          setUsmAmt(repayMax.divPow(config.merDenomDecimals).toString())
        }
      }
    },
    1000,
    [
      accountCollateral,
      chainStatus,
      collateralParams,
      collateralPool,
      debt,
      interestPerMinute,
      inputKind,
      isBorrow,
      maxLoan,
      disabled,
      setInitialTitle,
      usmAmt,
      usmBalance,
    ]
  )

  const onReceipt = useCallback(() => {
    setUsmAmt('')
    setSendEnabled(false)

    mutateAllCollateralPools()
    mutateAccountCollateral()
    mutateCollateralBalance()
    mutateLionBalance()
    mutateUsmBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // on borrow/repay tx submit
  const onBorrowRepaySubmit = useCallback(() => {
    if (!account || !collateralDenom) {
      return
    }
    borrowOrRepay({
      isBorrow: isBorrow,
      account: account.mer(),
      collateralDenom,
      usmAmt,
      sendTx,
      toast,
      onReceipt,
    })
  }, [account, collateralDenom, isBorrow, onReceipt, sendTx, toast, usmAmt])

  const {
    isOpen: isConfirmModalOpen,
    onOpen: onConfirmModalOpen,
    onClose: onConfirmModalClose,
  } = useDisclosure()

  return (
    <Box>
      <AmountInput
        token={usmToken}
        value={usmAmt}
        hoverBorder
        onInput={onInput}
        isDisabled={disabled || disabled}
        noMaxButton={isBorrow}
      ></AmountInput>

      <Button
        w="full"
        size="xl"
        mt="6"
        borderRadius="2xl"
        fontSize="xl"
        isDisabled={!sendEnabled || !isSendReady}
        isLoading={!isSendReady}
        loadingText="Waiting for completed"
        onClick={() => {
          expertMode ? onBorrowRepaySubmit() : onConfirmModalOpen()
        }}
      >
        {sendTitle}
      </Button>
    </Box>
  )
}
