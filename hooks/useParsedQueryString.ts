import { useMemo } from 'react'

export function parsedQueryString() {
  return new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : undefined
  )
}

export default function useParsedQueryString() {
  return useMemo(() => parsedQueryString(), [])
}
