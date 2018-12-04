import { useHookedReducer } from "./useReducer"
import { useMemo, useContext, useState as useReactState } from "react"
import { EnhancedStore, StateInspectorContext } from "./StateInspector"

type StateAction<S> = (s: S) => S | S

function stateReducer<S>(state: S, action: StateAction<S>): S {
    return typeof action === "function" ? action(state) : action
}

export const useState = <S>(initialState: () => S | S, id: string) => {
    const store = useMemo<EnhancedStore>(
        () => useContext(StateInspectorContext),
        []
    )

    if (!store) {
        return useReactState<S>(initialState)
    }

    const finalInitialState = useMemo<S>(
        () =>
            typeof initialState === "function" ? initialState() : initialState,
        []
    )

    return useHookedReducer<S, any>(stateReducer, finalInitialState, store, id)
}
