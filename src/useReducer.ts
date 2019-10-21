import {
    useReducer as useReactReducer,
    Reducer,
    useMemo,
    Dispatch,
    useState,
    useEffect,
    useContext,
    ReducerState,
    ReducerAction
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
        const dispatch = (action: A) => {
            const actionWithType = !!(
                action && typeof action.type !== "undefined"
            )

            return store.dispatch({
                type: actionWithType
                    ? `${reducerId}/${action.type}`
                    : reducerId,
                payload: action
            })
        }

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

export function useReducer<R extends Reducer<any, any>>(
    reducer: R,
    initialState: ReducerState<R>,
    id?: string | number
): [ReducerState<R>, Dispatch<ReducerAction<R>>]
export function useReducer<R extends Reducer<any, any>, I>(
    reducer: R,
    initialState: I,
    initializer: (arg: I) => ReducerState<R>,
    id?: string | number
): [ReducerState<R>, Dispatch<ReducerAction<R>>]
export function useReducer<R extends Reducer<any, any>, I>(
    reducer: R,
    initialState: I & ReducerState<R>,
    initializer: (arg: I & ReducerState<R>) => ReducerState<R>,
    id?: string | number
): [ReducerState<R>, Dispatch<ReducerAction<R>>]
export function useReducer<R extends Reducer<any, any>, I>(
    reducer,
    initialState,
    ...args
) {
    let id: string | number
    let initializer: (arg: I | I & ReducerState<R>) => ReducerState<R>

    if (args.length === 2) {
        initializer = args[0]
        id = args[1]
    } else if (typeof args[0] === "string" || typeof args[0] === "number") {
        id = args[0]
    } else {
        initializer = args[0]
    }

    const store = useContext(StateInspectorContext)

    const initializedState = initializer
        ? initializer(initialState)
        : initialState

    return store || !id
        ? useHookedReducer(reducer, initializedState, store, id)
        : useReactReducer(reducer, initialState, initializer)
}
