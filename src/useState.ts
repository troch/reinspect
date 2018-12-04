import { useHookedReducer } from "./useReducer"
import { useMemo, useContext, useState as useReactState } from "react"
import { EnhancedStore, StateInspectorContext } from "./context"

type StateAction<S> = (s: S) => S | S

function stateReducer<S>(state: S, action: StateAction<S>): S {
    return typeof action === "function" ? action(state) : action
}

export const useState = <S>(initialState: () => S | S, id: string | number) => {
    const [store, reducerId] = useMemo<[EnhancedStore, string | number]>(
        () => [useContext(StateInspectorContext), id],
        []
    )

    if (!store || !reducerId) {
        return useReactState<S>(initialState)
    }

    const finalInitialState = useMemo<S>(
        () =>
            typeof initialState === "function" ? initialState() : initialState,
        []
    )

    return useHookedReducer<S, any>(
        stateReducer,
        finalInitialState,
        store,
        reducerId
    )
}
