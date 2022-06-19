import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

const Home: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    void router.replace(`/portfolio`)
  }, [router])

  return null
}

export default Home
