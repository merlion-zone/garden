import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Collateral() {
  const router = useRouter()

  useEffect(() => {
    void router.replace(`/collateral/collateral-mint`)
  }, [router])

  return null
}
