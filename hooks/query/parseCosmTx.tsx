import { FunctionComponent } from 'react'
import {
  StringEvent,
  TxResponse,
} from 'cosmjs-types/cosmos/base/abci/v1beta1/abci'
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { GetTxsEventResponse } from 'cosmjs-types/cosmos/tx/v1beta1/service'
import { Any } from 'cosmjs-types/google/protobuf/any'
import { typeUrls, proto, Coin } from '@merlionzone/merlionjs'
import { useFormatCoin, useFormatCoins } from '@/hooks/query/moduleQueries'
import config from '@/config'
import { shortenAddress } from '@/utils'

export interface CosmMsg {
  type: string
  typeUrl: keyof typeof typeUrls
  events: StringEvent[]
  msg: Any
  evmTx?:
    | proto.evmTx.LegacyTx
    | proto.evmTx.AccessListTx
    | proto.evmTx.DynamicFeeTx
}

interface CosmMsgProps {
  msg: CosmMsg
}

export interface CosmTx extends TxResponse {
  msgs?: CosmMsg[]
}

export function parseCosmTxs(txsResponse: GetTxsEventResponse): CosmTx[] {
  return txsResponse.txs.map((tx, i) =>
    parseCosmTx(tx, txsResponse.txResponses[i])
  )
}

export function parseCosmTx(tx: Tx, txResponse: TxResponse): CosmTx {
  const msgs = tx.body?.messages.map((msg, i) => {
    let cosmMsg = {
      typeUrl: msg.typeUrl as any,
      events: txResponse.logs[i].events,
      msg,
    } as CosmMsg

    if (msg.typeUrl === typeUrls.MsgEthereumTx) {
      const { type, evmTx } = parseMsgEthereumTx(msg)
      cosmMsg.type = type
      cosmMsg.evmTx = evmTx
    } else {
      cosmMsg.type =
        cosmMsgDescComponents[msg.typeUrl]?.[0] ||
        msg.typeUrl.split('.').pop() ||
        'Unknown'
    }
    return cosmMsg
  })

  return {
    msgs,
    ...txResponse,
  }
}

function extractEventAttributes(
  events: {
    type: string
    attributes: { key: string; value: string }[]
  }[],
  type: string
): Map<string, string> | undefined {
  const event = events.find((event) => event.type === type)
  if (!event) {
    return
  }
  const result = new Map<string, string>()
  event.attributes.forEach((attr) => {
    result.set(attr.key, attr.value)
  })
  return result
}

const cosmMsgDescComponents: {
  [typeUrl: string]: [string, FunctionComponent<CosmMsgProps>]
} = {
  [typeUrls.MsgEthereumTx]: ['', MsgEthereumTxDesc],
  [typeUrls.MsgSend]: ['Transfer', MsgSendTx],
  [typeUrls.MsgMintBySwap]: ['Swap Mint', MsgMintBySwapDesc],
  [typeUrls.MsgBurnBySwap]: ['Swap Burn', MsgBurnBySwapDesc],
  [typeUrls.MsgBuyBacking]: ['Buy Backing', MsgBuyBackingDesc],
  [typeUrls.MsgSellBacking]: ['Sell Backing', MsgSellBackingDesc],
  [typeUrls.MsgSubmitProposal]: ['Submit Proposal', MsgSubmitProposalDesc],
  [typeUrls.MsgVote]: ['Vote on Proposal', MsgVoteDesc],
}

export function getMsgDescComponent(
  msg: CosmMsg
): FunctionComponent<CosmMsgProps> {
  return cosmMsgDescComponents[msg.typeUrl]?.[1] || MsgEmptyDesc
}

function MsgEmptyDesc({ msg }: CosmMsgProps) {
  return <></>
}

/****************************** Bank ******************************/

function MsgSendTx({ msg }: CosmMsgProps) {
  const attrs = extractEventAttributes(msg.events, 'transfer')
  const amount = useFormatCoin(attrs?.get('amount'))
  const recipient = attrs?.get('recipient')
  const recipientShort = recipient && shortenAddress(recipient)[1]
  return (
    <>
      Send {amount} to {recipientShort}
    </>
  )
}

/****************************** Evm ******************************/

function parseMsgEthereumTx(msg: Any) {
  const evmMsg = proto.evmTx.MsgEthereumTx.decode(msg.value)
  let evmTx:
    | proto.evmTx.LegacyTx
    | proto.evmTx.AccessListTx
    | proto.evmTx.DynamicFeeTx
    | undefined = undefined
  switch (evmMsg.data?.typeUrl) {
    case typeUrls.EthereumLegacyTx:
      evmTx = proto.evmTx.LegacyTx.decode(evmMsg.data.value)
      break
    case typeUrls.EthereumAccessListTx:
      evmTx = proto.evmTx.AccessListTx.decode(evmMsg.data.value)
      break
    case typeUrls.EthereumDynamicFeeTx:
      evmTx = proto.evmTx.DynamicFeeTx.decode(evmMsg.data.value)
      break
    default:
      break
  }

  const type = !evmTx
    ? evmMsg.data?.typeUrl.split('.').pop() || 'Unknown'
    : !evmTx.to
    ? 'Deploy contract'
    : evmTx.data && evmTx.data.length
    ? 'Execute contract'
    : 'Transfer'

  return {
    type: `${type} (EVM Tx)`,
    evmTx,
  }
}

function MsgEthereumTxDesc({ msg }: CosmMsgProps) {
  const value = useFormatCoin(new Coin(config.denom, msg.evmTx?.value || 0))
  const to = msg.evmTx?.to && shortenAddress(msg.evmTx.to)
  return (
    <>
      <span>Value: {value}</span>
      {to && (
        <>
          <br />
          <span>To: {to[0]}</span>
        </>
      )}
    </>
  )
}

/****************************** Maker ******************************/

function MsgMintBySwapDesc({ msg }: CosmMsgProps) {
  const attrs = extractEventAttributes(msg.events, 'mint_by_swap')
  const coinIn = useFormatCoins(attrs?.get('coin_in')?.split(','))
  const coinOut = useFormatCoin(attrs?.get('coin_out'))
  return <>{`Swap ${coinIn?.join(' + ')} for ${coinOut}`}</>
}

function MsgBurnBySwapDesc({ msg }: CosmMsgProps) {
  const attrs = extractEventAttributes(msg.events, 'burn_by_swap')
  const coinIn = useFormatCoin(attrs?.get('coin_in'))
  const coinOut = useFormatCoins(attrs?.get('coin_out')?.split(','))
  return <>{`Swap ${coinIn} for ${coinOut?.join(' + ')}`}</>
}

function MsgBuyBackingDesc({ msg }: CosmMsgProps) {
  const attrs = extractEventAttributes(msg.events, 'buy_backing')
  const coinIn = useFormatCoin(attrs?.get('coin_in'))
  const coinOut = useFormatCoin(attrs?.get('coin_out'))
  return <>{`Swap ${coinIn} for ${coinOut}`}</>
}

function MsgSellBackingDesc({ msg }: CosmMsgProps) {
  const attrs = extractEventAttributes(msg.events, 'sell_backing')
  const coinIn = useFormatCoin(attrs?.get('coin_in'))
  const coinOut = useFormatCoin(attrs?.get('coin_out'))
  return <>{`Swap ${coinIn} for ${coinOut}`}</>
}

function MsgSubmitProposalDesc({ msg }: CosmMsgProps) {
  let attrs = extractEventAttributes(msg.events, 'submit_proposal')
  const proposalId = attrs?.get('proposal_id')
  const proposalType = attrs?.get('proposal_type')
  attrs = extractEventAttributes(msg.events, 'proposal_deposit')
  const deposit = useFormatCoin(attrs?.get('amount'))
  return (
    <>
      <span>ID: {proposalId}</span>
      <br />
      <span>Type: {proposalType}</span>
      <br />
      <span>Deposit: {deposit}</span>
    </>
  )
}

function MsgVoteDesc({ msg }: CosmMsgProps) {
  return <></>
}
