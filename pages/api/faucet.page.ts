import { GasPrice } from '@cosmjs/stargate'
import {
  Address,
  DirectEthSecp256k1Wallet,
  MerlionClient,
} from '@merlionzone/merlionjs'
import { PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'
import { utils } from 'ethers'
import type { NextApiRequest, NextApiResponse } from 'next'

import config from '@/config'

const RE_CAPTCHA_ENDPOINT = process.env.RE_CAPTCHA_ENDPOINT
const PROJECT_ID = process.env.PROJECT_ID
const API_KEY = process.env.API_KEY
const SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY as string
const FAUCET_MNEMONIC = process.env.FAUCET_MNEMONIC as string

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient()
  }
  // @ts-ignore
  global.prisma ??= new PrismaClient()
  // @ts-ignore
  prisma = global.prisma
}

const verifyUrl = `${RE_CAPTCHA_ENDPOINT}/v1/projects/${PROJECT_ID}/assessments?key=${API_KEY}`

async function recaptcha(token: string): Promise<boolean> {
  try {
    const res = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        event: {
          token,
          siteKey: SITE_KEY,
          expectedAction: 'faucet',
        },
      }),
    }).then(async (res) => res.json())

    return res.tokenProperties.valid && res.riskAnalysis.score < 0.9
  } catch (_) {}

  return false
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    ok: boolean
    msg?: string
    hash?: string
    error?: string
  }>
) {
  // Only supported POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res
      .status(405)
      .json({ ok: false, msg: `HTTP method ${req.method} is not supported.` })
  }

  const body = JSON.parse(req.body)

  let address: Address
  try {
    address = new Address(body.address)
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Invalid address' })
  }

  if (!FAUCET_MNEMONIC) {
    return res.status(500).json({ ok: false, error: '' })
  }

  try {
    const now = Date.now()

    const updatedAt =
      (
        await prisma.user.findUnique({
          where: { address: address.mer() },
        })
      )?.updatedAt.getTime() ?? 0

    const duration = dayjs.duration(now - updatedAt).asHours()

    if (duration < 24) {
      return res.status(500).json({
        ok: false,
        error: `Try again after ${Math.ceil(24 - duration)} hours`,
      })
    }

    if (!(await recaptcha(body.token))) {
      return res.status(500).json({ ok: false, error: 'Transaction error' })
    }

    const hdWallet = utils.HDNode.fromMnemonic(FAUCET_MNEMONIC)
    const account = hdWallet.derivePath("m/44'/60'/0'/0/0")
    const privateKey = utils.arrayify(account.privateKey)

    const wallet = await DirectEthSecp256k1Wallet.fromKey(privateKey, 'mer')
    const sender = (await wallet.getAccounts())[0].address

    const merlionClient = await MerlionClient.connectWithSigner(
      config.rpcEndpoint,
      wallet,
      {
        gasPrice: GasPrice.fromString('5000alion'),
      }
    )

    const txRes = await merlionClient.sendTokens(sender, address.mer(), [
      { amount: '1000000000000000000', denom: 'alion' },
    ])

    const user = {
      address: address.mer(),
      updatedAt: new Date(now),
    }

    await prisma.user.upsert({
      where: { address: address.mer() },
      update: user,
      create: user,
    })

    return res
      .status(200)
      .json({ ok: true, msg: '', hash: txRes.transactionHash })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ ok: false, error: 'Transaction error' })
  }
}
