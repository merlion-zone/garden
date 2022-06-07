import { bech32 } from 'bech32'
import { Address } from '@merlionzone/merlionjs'
import { BECH32_PREFIX } from '@/constants'

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): [string, string] {
  try {
    const addr = new Address(address)
    const ethAddr = addr.eth()
    const merAddr = addr.mer()
    return [
      `${ethAddr.substring(0, chars + 2)}...${ethAddr.substring(
        address.length - chars
      )}`,
      `${merAddr.substring(0, chars + 3)}...${merAddr.substring(
        address.length - chars
      )}`,
    ]
  } catch {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
}

export const validatorToDelegatorAddress = (address: string) => {
  const decode = bech32.decode(address).words
  return bech32.encode(BECH32_PREFIX, decode)
}
