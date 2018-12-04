import React from "react"
import ReactDOM from "react-dom"
import { StateInspector, useState } from "./reinspect"
import { Counter } from "./Counter";

function App() {
    return (
        <StateInspector name="Example">
            <Counters />
        </StateInspector>
    )
}

function Counters() {
    const [count, setCount] = useState(4, "count")

    return (
        <div><p>Open redux devtools to see it in action!</p>
        <p>
            <button onClick={() => setCount(count + 1)}>
                Add counter
            </button>

            <button
                onClick={() => setCount(count - 1)}
                disabled={count === 0}
            >
                Remove counter
            </button>
        </p>

        {Array.from({ length: count }).map((_, index) => (
            <Counter
                id={`counter${index}`}
                key={`counter${index}`}
            />
        ))}
        </div>
    )
}

ReactDOM.render(<App />, document.getElementById("root"))
