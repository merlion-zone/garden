import { useToast as useBaseToast } from '@chakra-ui/react'

export function useToast() {
  return useBaseToast({
    position: 'top-right',
    duration: null,
    containerStyle: {
      position: 'relative',
      top: '20',
      right: '2',
    },
  })
}
