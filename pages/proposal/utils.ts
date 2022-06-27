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

export interface ProposalContent {
  'Text proposal': TextProposal
  'Community pool spend': CommunityPoolSpendProposal
  'Parameter change': ParameterChangeProposal
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
  throw new Error(`Not support proposal type ${content.typeUrl}`)
}

export function getContent<T extends keyof ProposalContent>(
  type: T,
  value: ProposalContent[T]
) {
  switch (type) {
    case ProposalType.TEXT:
      return {
        typeUrl: '/cosmos.gov.v1beta1.TextProposal',
        value: TextProposal.encode(value).finish(),
      }
    case ProposalType.SPEND:
      return {
        typeUrl: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
        value: CommunityPoolSpendProposal.encode(
          value as CommunityPoolSpendProposal
        ).finish(),
      }
    case ProposalType.PARAMS:
      return {
        typeUrl: '/cosmos.params.v1beta1.ParameterChangeProposal',
        value: ParameterChangeProposal.encode(
          value as ParameterChangeProposal
        ).finish(),
      }
  }
  throw new Error(`Not support proposal type ${type}`)
}

export function getTime(timestamp: Timestamp) {
  return (
    Number(timestamp!.seconds) * 1000 + Number(timestamp!.nanos) / 1_000_000
  )
}
