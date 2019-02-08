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
        const dispatch = (action: A) =>
            store.dispatch({
                type: action.type ? `${reducerId}/${action.type}` : reducerId,
                payload: action
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

export function useReducer<R extends Reducer<any, any>, I>(
    reducer: R,
    initialState: I,
    initializer: (arg: I) => ReducerState<R>,
    id: string | number
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
    const store = useContext(StateInspectorContext)

    const initializedState = initializer
        ? initializer(initialState)
        : initialState

    return store || !id
        ? useHookedReducer(reducer, initializedState, store, id)
        : useReactReducer(reducer, initialState, initializer)
}
