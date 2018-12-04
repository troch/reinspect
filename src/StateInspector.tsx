import React, { useMemo } from "react"
import { createStore, Reducer, Action, Store } from "redux"

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__?: any
    }
}

type UnsubscribeFn = () => void

export type EnhancedStore = Store & {
    registerHookedReducer: <S, A extends Action = Action<any>>(
        reducer: Reducer<S, A>,
        initialState: S,
        reducerId: string
    ) => UnsubscribeFn
}

export const StateInspectorContext = React.createContext<EnhancedStore>(null)

interface StateInspectorProps {
    name?: string
    initialState?: any
}

const omit = (obj, keyToRemove) =>
    Object.keys(obj)
        .filter(key => key !== keyToRemove)
        .reduce((acc, key) => {
            acc[key] = obj[key]
            return acc
        }, {})

export const StateInspector: React.SFC<StateInspectorProps> = ({
    name,
    initialState = {},
    children
}) => {
    const store = useMemo<EnhancedStore>(() => {
        if (!window.__REDUX_DEVTOOLS_EXTENSION__) {
            return null
        }

        const registeredReducers: Record<
            string | number,
            Reducer<any, Action<any>>
        > = {}

        const storeReducer = (state, action) => {
            const isInitAction = /\/init$/.test(action.type)
            const isTeardownAction = /\/teardown$/.test(action.type)

            const currentState = isTeardownAction
                ? omit(state, action.payload.reducerId)
                : { ...state }

            return Object.keys(registeredReducers).reduce((acc, reducerId) => {
                const reducer = registeredReducers[reducerId]
                const reducerState = state[reducerId]
                const reducerAction = action.payload.action
                const isForCurrentReducer =
                    action.payload && action.payload.reducerId === reducerId

                if (isForCurrentReducer) {
                    acc[reducerId] = isInitAction
                        ? action.payload.initialState
                        : reducer(reducerState, reducerAction)
                } else {
                    acc[reducerId] = reducerState
                }

                return acc
            }, currentState)
        }

        const store: EnhancedStore = createStore(
            storeReducer,
            initialState,
            window.__REDUX_DEVTOOLS_EXTENSION__({
                name: name || "React state"
            })
        )

        store.registerHookedReducer = (reducer, initialState, reducerId) => {
            registeredReducers[reducerId] = reducer

            store.dispatch({
                type: `${reducerId}/init`,
                payload: {
                    reducerId,
                    initialState
                }
            })

            return () => {
                delete registeredReducers[reducerId]

                store.dispatch({
                    type: `${reducerId}/teardown`,
                    payload: {
                        reducerId
                    }
                })
            }
        }
    }, [])

    return (
        <StateInspectorContext.Provider value={store}>
            {children}
        </StateInspectorContext.Provider>
    )
}
