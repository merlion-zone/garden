// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
import { Address } from '@merlionzone/merlionjs'

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
