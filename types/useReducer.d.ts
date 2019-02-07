import { Reducer, Dispatch } from "react";
import { Action } from "redux";
import { EnhancedStore } from "./context";
export declare function useHookedReducer<S, A extends Action<any>>(reducer: Reducer<S, A>, initialState: S, store: EnhancedStore, reducerId: string | number): [S, Dispatch<A>];
export declare function useReducer<S, A extends Action<any> = Action<any>>(reducer: Reducer<S, A>, initialState: S, init: (state: S) => S, id: string | number): [S, Dispatch<A>];
