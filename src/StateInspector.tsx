import React, { useMemo } from "react"
import { createStore, Reducer, Action } from "redux"
import { EnhancedStore, StateInspectorContext } from "./context"

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__?: any
    }
}

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
            const actionReducerId = action.type.split("/")[0]
            const isInitAction = /\/_init$/.test(action.type)
            const isTeardownAction = /\/_teardown$/.test(action.type)

            const currentState = isTeardownAction
                ? omit(state, actionReducerId)
                : { ...state }

            return Object.keys(registeredReducers).reduce((acc, reducerId) => {
                const reducer = registeredReducers[reducerId]
                const reducerState = state[reducerId]
                const reducerAction = action.payload
                const isForCurrentReducer = actionReducerId === reducerId

                if (isForCurrentReducer) {
                    acc[reducerId] = isInitAction
                        ? action.payload
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
                name: name || "React state",
                actionsBlacklist: ["/_init", "/_teardown"]
            })
        )

        store.registerHookedReducer = (reducer, initialState, reducerId) => {
            registeredReducers[reducerId] = reducer

            store.dispatch({
                type: `${reducerId}/_init`,
                payload: initialState
            })

            return () => {
                delete registeredReducers[reducerId]

                store.dispatch({
                    type: `${reducerId}/_teardown`
                })
            }
        }

        return store
    }, [])

    return (
        <StateInspectorContext.Provider value={store}>
            {children}
        </StateInspectorContext.Provider>
    )
}
