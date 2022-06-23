import BigNumber from 'bignumber.js'
import { Coin } from '@cosmjs/stargate'

import { CURRENCIES } from '@/constants'

export const parseCoin = (coin: Coin): Coin => {
  const currency = CURRENCIES.find(
    (c) => coin.denom === c.denom || coin.denom === c.minimalDenom
  )

  if (!currency) throw new Error(`not supported coin: ${coin.denom}`)

  if (coin.denom === currency.minimalDenom) return coin

  const decimals = new BigNumber(10).pow(currency.decimals)

  BigNumber.config({ EXPONENTIAL_AT: 1e9 })

  return {
    denom: currency.minimalDenom,
    amount: decimals.times(coin.amount).toString(),
  }
}

export function formatCoin(coin: Coin, decimalPlaces: number = 6): Coin {
  const currency = CURRENCIES.find(
    (c) => coin.denom === c.denom || coin.denom === c.minimalDenom
  )

  if (!currency) throw new Error(`not supported coin: ${coin.denom}`)

  const amount = new BigNumber(coin.amount)

  if (coin.denom === currency.denom)
    return {
      denom: coin.denom,
      amount: amount.toFixed(decimalPlaces),
    }

  const decimal = new BigNumber(10).pow(currency.decimals)
  return {
    denom: currency.denom,
    amount: amount.div(decimal).toFixed(decimalPlaces),
  }
}
