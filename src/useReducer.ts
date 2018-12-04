import {
    useReducer as useReactReducer,
    Reducer,
    useMemo,
    Dispatch,
    useState,
    useEffect,
    useContext
} from "react"
import { Action } from "redux"
import { StateInspectorContext, EnhancedStore } from "./context"

export function useHookedReducer<S, A extends Action<any>>(
    reducer: Reducer<S, A>,
    initialState: S,
    store: EnhancedStore,
    reducerId: string | number
): [S, Dispatch<A>] {
    const initialReducerState = useMemo(() => {
        const initialStateInStore = store.getState()[reducerId]
        return initialStateInStore === undefined
            ? initialState
            : initialStateInStore
    }, [])

    const [localState, setState] = useState<S>(initialReducerState)

    const dispatch = useMemo<Dispatch<A>>(() => {
        const dispatch = (action: A) =>
            store.dispatch({
                type: reducerId,
                payload: {
                    reducerId,
                    action
                }
            })

        return dispatch
    }, [])

    useEffect(() => {
        const teardown = store.registerHookedReducer<S, A>(
            reducer,
            initialReducerState,
            reducerId
        )

        let lastReducerState = localState
        const unsubscribe = store.subscribe(() => {
            const storeState: any = store.getState()
            const reducerState = storeState[reducerId]

            if (lastReducerState !== reducerState) {
                setState(reducerState)
            }

            lastReducerState = reducerState
        })

        return () => {
            unsubscribe()
            teardown()
        }
    }, [])

    return [localState, dispatch]
}

export function useReducer<S, A extends Action<any> = Action<any>>(
    reducer: Reducer<S, A>,
    initialState: S,
    id: string | number
): [S, Dispatch<A>] {
    const [store, reducerId] = useMemo<[EnhancedStore, string | number]>(
        () => [useContext(StateInspectorContext), id],
        []
    )

    return store || !reducerId
        ? useHookedReducer(reducer, initialState, store, reducerId)
        : useReactReducer<S, A>(reducer, initialState)
}
