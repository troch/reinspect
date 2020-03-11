import React, { Context, useCallback, useEffect, useMemo } from "react"
import { useState } from "./useState"
import debounce from "./debounce"

interface Props<T> {
  store: T
  context: Context<T>
  children: React.ReactNode
  debounceTime?: number
}

export const Provider = <T extends {}>({
  store,
  context,
  debounceTime,
  children
}: Props<T>) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultStore = useMemo(() => store, [])
  const [_, setStore] = useState<T>(defaultStore, "Counter")

  // @ts-ignore
  const dispatch = useCallback(debounce(setStore, debounceTime), [setStore])

  useEffect(() => {
    debounce ? dispatch(store) : setStore(store)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store])

  return <context.Provider value={store}>{children}</context.Provider>
}
