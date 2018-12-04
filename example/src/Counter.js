import React from "react"
import { useState, useReducer } from "./reinspect"

export function CounterWithUseState({ id }) {
    const [count, setCount] = useState(
        0,
        id
    )

    return (
        <div>
            <button onClick={() => setCount(count - 1)}>-</button> {count}{" "}
            <button onClick={() => setCount(count + 1)}>+</button>
        </div>
    )
}


export function CounterWithUseReducer({ id }) {
    const [count, dispatch] = useReducer(
        (state, action) => {
            if (action.type === "+") {
                return state + 1
            }
            if (action.type === "-") {
                return state - 1
            }
            return state
        },
        0,
        id
    )

    return (
        <div>
            <button onClick={() => dispatch({ type: "-" })}>-</button> {count}{" "}
            <button onClick={() => dispatch({ type: "+" })}>+</button>
        </div>
    )
}
