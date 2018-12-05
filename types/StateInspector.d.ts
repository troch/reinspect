import React from "react";
declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__?: any;
    }
}
interface StateInspectorProps {
    name?: string;
    initialState?: any;
}
export declare const StateInspector: React.SFC<StateInspectorProps>;
export {};
