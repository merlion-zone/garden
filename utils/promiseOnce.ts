import { SetStateAction } from 'jotai'
import { SetAtom } from 'jotai/core/atom'
import { MutableRefObject } from 'react'

export function promiseOnce<T>(
  [isAvailable, setIsAvailable]: [
    Awaited<boolean>,
    SetAtom<SetStateAction<boolean>, void>
  ],
  promiseResolverQueueRef: MutableRefObject<(Function | undefined)[]>,
  promise: Promise<T>
): Promise<T> {
  const readyPromise = () => {
    if (!isAvailable) {
      let resolve = undefined
      const promise = new Promise((r) => {
        resolve = r
      })
      promiseResolverQueueRef.current.push(resolve)
      return promise
    } else {
      return Promise.resolve()
    }
  }

  return readyPromise().then(() => {
    setIsAvailable(false)
    return promise.finally(() => {
      setIsAvailable(true)
      promiseResolverQueueRef.current.shift()?.()
    })
  })
}
