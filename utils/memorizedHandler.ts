const eventHandlers = new Map<
  string,
  { memorized: Function; handler: Function }
>()

export function setMemorizedHandler(event: string, handler: Function) {
  if (!eventHandlers.has(event)) {
    const memo = {
      memorized: (...args: any[]) => {
        memo.handler(...args)
      },
      handler,
    }
    eventHandlers.set(event, memo)
  } else {
    eventHandlers.get(event)!.handler = handler
  }
}

export function getMemorizedHandler(event: string): Function | undefined {
  return eventHandlers.get(event)?.memorized
}
