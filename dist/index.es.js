import React, { useMemo, useEffect, useContext, useReducer as useReducer$1, useState as useState$1 } from 'react';
import { createStore } from 'redux';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var StateInspectorContext = React.createContext(null);

var omit = function (obj, keyToRemove) {
    return Object.keys(obj)
        .filter(function (key) { return key !== keyToRemove; })
        .reduce(function (acc, key) {
        acc[key] = obj[key];
        return acc;
    }, {});
};
var StateInspector = function (_a) {
    var name = _a.name, _b = _a.initialState, initialState = _b === void 0 ? {} : _b, children = _a.children;
    var store = useMemo(function () {
        if (typeof window === "undefined" ||
            !window.__REDUX_DEVTOOLS_EXTENSION__) {
            return null;
        }
        var registeredReducers = {};
        var storeReducer = function (state, action) {
            var actionReducerId = action.type.split("/")[0];
            var isInitAction = /\/_init$/.test(action.type);
            var isTeardownAction = /\/_teardown$/.test(action.type);
            var currentState = isTeardownAction
                ? omit(state, actionReducerId)
                : __assign({}, state);
            return Object.keys(registeredReducers).reduce(function (acc, reducerId) {
                var reducer = registeredReducers[reducerId];
                var reducerState = state[reducerId];
                var reducerAction = action.payload;
                var isForCurrentReducer = actionReducerId === reducerId;
                if (isForCurrentReducer) {
                    acc[reducerId] = isInitAction
                        ? action.payload
                        : reducer(reducerState, reducerAction);
                }
                else {
                    acc[reducerId] = reducerState;
                }
                return acc;
            }, currentState);
        };
        var store = createStore(storeReducer, initialState, window.__REDUX_DEVTOOLS_EXTENSION__({
            name: name || "React state",
            actionsBlacklist: ["/_init", "/_teardown"]
        }));
        store.registerHookedReducer = function (reducer, initialState, reducerId) {
            registeredReducers[reducerId] = reducer;
            store.dispatch({
                type: reducerId + "/_init",
                payload: initialState
            });
            return function () {
                delete registeredReducers[reducerId];
                store.dispatch({
                    type: reducerId + "/_teardown"
                });
            };
        };
        return store;
    }, []);
    useEffect(function () {
        store && store.dispatch({ type: "REINSPECT/@@INIT", payload: {} });
    }, []);
    return (React.createElement(StateInspectorContext.Provider, { value: store }, children));
};

function useHookedReducer(reducer, initialState, store, reducerId) {
    var initialReducerState = useMemo(function () {
        var initialStateInStore = store.getState()[reducerId];
        return initialStateInStore === undefined
            ? initialState
            : initialStateInStore;
    }, []);
    var _a = useState$1(initialReducerState), localState = _a[0], setState = _a[1];
    var dispatch = useMemo(function () {
        var dispatch = function (action) {
            var actionWithType = action && typeof action.type !== "undefined";
            return store.dispatch({
                type: actionWithType
                    ? reducerId + "/" + action.type
                    : reducerId,
                payload: action
            });
        };
        return dispatch;
    }, []);
    useEffect(function () {
        var teardown = store.registerHookedReducer(reducer, initialReducerState, reducerId);
        var lastReducerState = localState;
        var unsubscribe = store.subscribe(function () {
            var storeState = store.getState();
            var reducerState = storeState[reducerId];
            if (lastReducerState !== reducerState) {
                setState(reducerState);
            }
            lastReducerState = reducerState;
        });
        return function () {
            unsubscribe();
            teardown();
        };
    }, []);
    return [localState, dispatch];
}
function useReducer(reducer, initialState) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var id;
    var initializer;
    if (args.length === 2) {
        initializer = args[0];
        id = args[1];
    }
    else if (typeof args[0] === "string" || typeof args[0] === "number") {
        id = args[0];
    }
    else {
        initializer = args[0];
    }
    var store = useContext(StateInspectorContext);
    var initializedState = initializer
        ? initializer(initialState)
        : initialState;
    return store || !id
        ? useHookedReducer(reducer, initializedState, store, id)
        : useReducer$1(reducer, initialState, initializer);
}

function stateReducer(state, action) {
    return typeof action === "function"
        ? action(state)
        : action;
}
var useState = function (initialState, id) {
    var inspectorStore = useContext(StateInspectorContext);
    var _a = useMemo(function () { return [inspectorStore, id]; }, []), store = _a[0], reducerId = _a[1];
    if (!store || !reducerId) {
        return useState$1(initialState);
    }
    var finalInitialState = useMemo(function () {
        return typeof initialState === "function"
            ? initialState()
            : initialState;
    }, []);
    return useHookedReducer(stateReducer, finalInitialState, store, reducerId);
};

export { StateInspector, useReducer, useState };
