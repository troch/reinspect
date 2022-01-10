/* eslint-disable react-hooks/rules-of-hooks */
import {
  useReducer as useReactReducer,
  Reducer,
  Dispatch,
  useState,
  useEffect,
  useContext,
  ReducerState,
  ReducerAction
} from "react"
import { StateInspectorContext, EnhancedStore } from "./context"

export function useHookedReducer<S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  store: EnhancedStore,
  reducerId: string | number
): [S, Dispatch<A>] {
  const [initialReducerState] = useState(() => {
    const initialStateInStore = store.getState()[reducerId]
    return initialStateInStore === undefined
      ? initialState
      : initialStateInStore
  })

  const [localState, setState] = useState<S>(initialReducerState)

  const [dispatch] = useState<Dispatch<A>>(() => {
    return (action: any) => {
      if (
        action &&
        typeof action === "object" &&
        typeof action.type === "string"
      ) {
        store.dispatch({
          type: `${reducerId}/${action.type}`,
          payload: action
        })
      } else {
        store.dispatch({
          type: reducerId,
          payload: action
        })
      }
    }
  })

  const [cleanup] = useState(() => {
    const teardown = store.registerHookedReducer(
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
      teardown()
      unsubscribe()
    }
  })

  useEffect(() => {
    return cleanup
  }, [cleanup])

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
  reducer: R,
  initialState: I & ReducerState<R>,
  ...args: any[]
) {
  let id: string | number | undefined
  let initializer:
    | ((arg: I | (I & ReducerState<R>)) => ReducerState<R>)
    | undefined

  if (args.length === 2) {
    initializer = args[0]
    id = args[1]
  } else if (typeof args[0] === "string" || typeof args[0] === "number") {
    id = args[0]
  } else {
    initializer = args[0]
    id = args[1]
  }

  const store = useContext(StateInspectorContext)

  const initializedState = initializer
    ? initializer(initialState)
    : initialState

  return store && id
    ? useHookedReducer(reducer, initializedState, store, id)
    : initializer
    ? useReactReducer(reducer, initialState, initializer)
    : useReactReducer(reducer, initialState)
}
