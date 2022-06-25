import { FunctionComponent } from 'react'
import {
  StringEvent,
  TxResponse,
} from 'cosmjs-types/cosmos/base/abci/v1beta1/abci'
import { Tx } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { GetTxsEventResponse } from 'cosmjs-types/cosmos/tx/v1beta1/service'
import { typeUrls } from '@merlionzone/merlionjs'
import { useFormatCoin } from '@/hooks/query/moduleQueries'

export interface CosmMsg {
  type: string
  typeUrl: keyof typeof typeUrls
  events: StringEvent[]
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
    const type =
      cosmMsgTypes[msg.typeUrl] || msg.typeUrl.split('.').pop() || 'Unknown'
    return {
      type,
      typeUrl: msg.typeUrl as any,
      events: txResponse.logs[i].events,
    }
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

const cosmMsgTypes: { [typeUrl: string]: string } = {
  [typeUrls.MsgMintBySwap]: 'Swap Mint',
  [typeUrls.MsgBurnBySwap]: 'Swap Burn',
}

export const cosmMsgDescComponents: {
  [typeUrl: string]: FunctionComponent<CosmMsgProps>
} = {
  [typeUrls.MsgMintBySwap]: MsgMintBySwapDesc,
  [typeUrls.MsgBurnBySwap]: MsgBurnBySwapDesc,
}

/****************************** Maker ******************************/

function MsgMintBySwapDesc({ msg }: CosmMsgProps) {
  const attrs = extractEventAttributes(msg.events, 'mint_by_swap')
  const coinIn = useFormatCoin(attrs?.get('coin_in'))
  const coinOut = useFormatCoin(attrs?.get('coin_out'))
  return <>{`Swap ${coinIn} for ${coinOut}`}</>
}

function MsgBurnBySwapDesc({ msg }: CosmMsgProps) {
  const attrs = extractEventAttributes(msg.events, 'burn_by_swap')
  const coinIn = useFormatCoin(attrs?.get('coin_in'))
  const coinOut = useFormatCoin(attrs?.get('coin_out'))
  return <>{`Swap ${coinIn} for ${coinOut}`}</>
}
