import React, { Reducer } from "react"
import { Store } from "redux"

type UnsubscribeFn = () => void

export type EnhancedStore = Store & {
  registerHookedReducer: (
    reducer: Reducer<any, any>,
    initialState: any,
    reducerId: string | number
  ) => UnsubscribeFn
}

export const StateInspectorContext = React.createContext<
  EnhancedStore | undefined
>(undefined)
