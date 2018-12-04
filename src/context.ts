import React from "react"
import { Store, Action, Reducer } from "redux"

type UnsubscribeFn = () => void

export type EnhancedStore = Store & {
    registerHookedReducer: <S, A extends Action = Action<any>>(
        reducer: Reducer<S, A>,
        initialState: S,
        reducerId: string | number
    ) => UnsubscribeFn
}

export const StateInspectorContext = React.createContext<EnhancedStore>(null)
