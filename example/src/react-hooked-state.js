import { createStore } from 'redux';
import React, { useMemo, useReducer, useState, useEffect, useContext } from 'react';

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
        if (!window.__REDUX_DEVTOOLS_EXTENSION__) {
            return null;
        }
        var registeredReducers = {};
        var storeReducer = function (state, action) {
            var isInitAction = /\/init$/.test(action.type);
            var isTeardownAction = /\/teardown$/.test(action.type);
            var currentState = isTeardownAction
                ? omit(state, action.payload.reducerId)
                : __assign({}, state);
            return Object.keys(registeredReducers).reduce(function (acc, reducerId) {
                var reducer = registeredReducers[reducerId];
                var reducerState = state[reducerId];
                var reducerAction = action.payload.action;
                var isForCurrentReducer = action.payload && action.payload.reducerId === reducerId;
                if (isForCurrentReducer) {
                    acc[reducerId] = isInitAction
                        ? action.payload.initialState
                        : reducer(reducerState, reducerAction);
                }
                else {
                    acc[reducerId] = reducerState;
                }
                return acc;
            }, currentState);
        };
        var store = createStore(storeReducer, initialState, window.__REDUX_DEVTOOLS_EXTENSION__({
            name: name || "React state"
        }));
        store.registerHookedReducer = function (reducer, initialState, reducerId) {
            registeredReducers[reducerId] = reducer;
            store.dispatch({
                type: reducerId + "/init",
                payload: {
                    reducerId: reducerId,
                    initialState: initialState
                }
            });
            return function () {
                delete registeredReducers[reducerId];
                store.dispatch({
                    type: reducerId + "/teardown",
                    payload: {
                        reducerId: reducerId
                    }
                });
            };
        };
        return store;
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
    var _a = useState(initialReducerState), localState = _a[0], setState = _a[1];
    var dispatch = useMemo(function () {
        var dispatch = function (action) {
            return store.dispatch({
                type: reducerId,
                payload: {
                    reducerId: reducerId,
                    action: action
                }
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
function useReducer$1(reducer, initialState, id) {
    var store = useMemo(function () { return useContext(StateInspectorContext); }, []);
    return store
        ? useHookedReducer(reducer, initialState, store, id)
        : useReducer(reducer, initialState);
}

function stateReducer(state, action) {
    return typeof action === "function" ? action(state) : action;
}
var useState$1 = function (initialState, id) {
    var store = useMemo(function () { return useContext(StateInspectorContext); }, []);
    if (!store) {
        return useState(initialState);
    }
    var finalInitialState = useMemo(function () {
        return typeof initialState === "function" ? initialState() : initialState;
    }, []);
    return useHookedReducer(stateReducer, finalInitialState, store, id);
};

export { StateInspector, useReducer$1 as useReducer, useState$1 as useState };
