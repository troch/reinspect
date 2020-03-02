import { useHookedReducer } from "./useReducer"
import { useMemo, useContext, useState as useReactState, useRef } from "react"
import { EnhancedStore, StateInspectorContext } from "./context"

type StateAction<S> = S | ((s: S) => S)

function stateReducer<S>(state: S, action: StateAction<S>): S {
  return typeof action === "function" ? (action as (s: S) => S)(state) : action
}

export const useState = <S>(
  initialState: S | (() => S),
  id: string | number
) => {
  const inspectorStore = useContext(StateInspectorContext)
  // Keeping the first values
  const [store, reducerId] = useMemo<
    [EnhancedStore | undefined, string | number]
  >(() => [inspectorStore, id], [])

  if (!store || !reducerId) {
    return useReactState<S>(initialState)
  }

  const finalInitialState = useMemo<S>(
    () =>
      typeof initialState === "function"
        ? (initialState as () => S)()
        : initialState,
    []
  )

  return useHookedReducer<S, any>(
    stateReducer,
    finalInitialState,
    store,
    reducerId
  )
}
