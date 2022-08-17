const memorizedHandlers = new Map<
  string,
  { memorized: (...args: any[]) => void; handler: Function }
>()

export function setMemorizedHandler(event: string, handler: Function) {
  if (!memorizedHandlers.has(event)) {
    const memo = {
      memorized: (...args: any[]) => {
        memo.handler(...args)
      },
      handler,
    }
    memorizedHandlers.set(event, memo)
  } else {
    memorizedHandlers.get(event)!.handler = handler
  }
}

export function getMemorizedHandler(
  event: string
): ((...args: any[]) => void) | undefined {
  return memorizedHandlers.get(event)?.memorized
}
