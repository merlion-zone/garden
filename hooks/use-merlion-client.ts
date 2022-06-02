import { useEffect, useState } from 'react'
import { MerlionClient } from '@merlionzone/merlionjs'
import { ENDPOINT } from '@/constants'

export function useMerlionClient() {
  const [merlionClient, setMerlionClient] = useState<MerlionClient | null>(null)

  useEffect(() => {
    MerlionClient.connect(ENDPOINT).then((client) => setMerlionClient(client))
  }, [])

  return merlionClient
}
