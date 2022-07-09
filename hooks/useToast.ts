import { UseToastOptions, useToast as useBaseToast } from '@chakra-ui/react'
import { useMemo } from 'react'

export function useToast() {
  const defaultOptions = useMemo(() => {
    return {
      position: 'top-right',
      duration: null,
      containerStyle: {
        position: 'relative',
        top: '20',
        right: '2',
      },
    } as UseToastOptions
  }, [])
  return useBaseToast(defaultOptions)
}
