import { Reducer, Dispatch, ReducerState, ReducerAction } from "react";
import { Action } from "redux";
import { EnhancedStore } from "./context";
export declare function useHookedReducer<S, A extends Action<any>>(reducer: Reducer<S, A>, initialState: S, store: EnhancedStore, reducerId: string | number): [S, Dispatch<A>];
export declare function useReducer<R extends Reducer<any, any>, I>(reducer: R, initialState: I, initializer: (arg: I) => ReducerState<R>, id: string | number): [ReducerState<R>, Dispatch<ReducerAction<R>>];
