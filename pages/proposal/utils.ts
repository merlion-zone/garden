import { CommunityPoolSpendProposal } from 'cosmjs-types/cosmos/distribution/v1beta1/distribution'
import { ParameterChangeProposal } from 'cosmjs-types/cosmos/params/v1beta1/params'
import { TextProposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov'
import type { Any } from 'cosmjs-types/google/protobuf/any'
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp'

// TODO: support other proposals
export enum ProposalType {
  TEXT = 'Text proposal',
  SPEND = 'Community pool spend',
  PARAMS = 'Parameter change',
}

export function decodeContent(content: Any) {
  switch (content.typeUrl) {
    case '/cosmos.gov.v1beta1.TextProposal':
      return {
        type: ProposalType.TEXT,
        ...TextProposal.decode(content.value),
      }
    case '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal':
      return {
        type: ProposalType.SPEND,
        ...CommunityPoolSpendProposal.decode(content.value),
      }
    case '/cosmos.params.v1beta1.ParameterChangeProposal':
      return {
        type: ProposalType.SPEND,
        ...ParameterChangeProposal.decode(content.value),
      }
  }
}

export function getTime(timestamp: Timestamp) {
  return (
    Number(timestamp!.seconds) * 1000 + Number(timestamp!.nanos) / 1_000_000
  )
}
