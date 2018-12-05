import React from "react";
import { Store, Action, Reducer } from "redux";
declare type UnsubscribeFn = () => void;
export declare type EnhancedStore = Store & {
    registerHookedReducer: <S, A extends Action = Action<any>>(reducer: Reducer<S, A>, initialState: S, reducerId: string | number) => UnsubscribeFn;
};
export declare const StateInspectorContext: React.Context<EnhancedStore>;
export {};
