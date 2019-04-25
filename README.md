# reinspect

> Under development

Connect React state hooks (`useState` and `useReducer`) to redux dev tools.

[See it live](https://7ypv9qw6j0.codesandbox.io/)

![useState with Redux dev tools](https://user-images.githubusercontent.com/1777517/49508706-4b223900-f87b-11e8-9c64-534e3dc51047.gif)

## Why?

Hooks are great, they are a joy to use to create state in components. On the other hand, with something global and centralised like Redux, we have [great dev tools](https://github.com/zalmoxisus/redux-devtools-extension).

Why not both? That's exactly what this package offers: connecting `useState` and `useReducer` to redux dev tools, so you can do the following:

-   Inspect actions and state for each hook
-   Time travel through state changes in your app
-   Hot reloading: save your current state and re-inject it when re-rendering

## API

You need [redux devtools](https://github.com/zalmoxisus/redux-devtools-extension) installed. This package provides:

-   `StateInspector`: a provider which will be used by `useState` and `useReducer` to connect them to a store and redux dev tools.

    -   It accepts optionally a `name` (name of the store in dev tools) and `initialState` (if you want to start with a given state)
    -   You can have more than one `StateInspector` in your application, hooks will report to the nearest one
    -   Without a `StateInspector`, `useState` and `useReducer` behave normally

    ```js
    import React from "react"
    import { StateInspector } from "reinspect"
    import App from "./App"

    function AppWrapper() {
        return (
            <StateInspector name="App">
                <App />
            </StateInspector>
        )
    }

    export default AppWrapper
    ```

-   `useState(initialState, id?)`: like [useState](https://reactjs.org/docs/hooks-reference.html#usestate) but with a 2nd argument `id` (a unique ID to identify it in dev tools). If no `id` is supplied, the hook won't be connected to dev tools.

    ```js
    import React from "react"
    import { useState } from "reinspect"

    export function CounterWithUseState({ id }) {
        const [count, setCount] = useState(0, id)

        return (
            <div>
                <button onClick={() => setCount(count - 1)}>-</button>
                {count} <button onClick={() => setCount(count + 1)}>+</button>
            </div>
        )
    }
    ```

-   `useReducer(reducer, initialState, initializer?, id?)`: like [useReducer](https://reactjs.org/docs/hooks-reference.html#usereducer) but with a 4th argument `id` (a unique ID to identify it in dev tools). If no `id` is supplied, the hook won't be connected to dev tools. You can use identity function (`state => state`) as 3rd parameter to mock lazy initialization.
