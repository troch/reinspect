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
import { StateInspectorContext, EnhancedStore } from "./StateInspector"

export function useHookedReducer<S, A extends Action<any>>(
    reducer: Reducer<S, A>,
    initialState: S,
    store: EnhancedStore,
    reducerId: string
): [S, Dispatch<A>] {
    const initialReducerState = useMemo(() => {
        const initialStateInStore = store.getState().hookedState[reducerId]
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

        let lastHookedState = localState
        const unsubscribe = store.subscribe(() => {
            const storeState: any = store.getState()
            const hookedState = storeState.hookedState[reducerId]

            if (lastHookedState !== hookedState) {
                setState(hookedState)
            }

            lastHookedState = hookedState
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
    containerId: string
): [S, Dispatch<A>] {
    const store = useMemo<EnhancedStore>(
        () => useContext(StateInspectorContext),
        []
    )

    return store
        ? useHookedReducer(reducer, initialState, store, containerId)
        : useReactReducer<S, A>(reducer, initialState)
}
