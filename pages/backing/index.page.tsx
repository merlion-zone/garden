import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Backing() {
  const router = useRouter()

  useEffect(() => {
    void router.replace('/backing/swap-mint')
  }, [router])

  return null
}
