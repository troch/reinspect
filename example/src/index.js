import React from "react"
import ReactDOM from "react-dom"
import { StateInspector } from "./reinspect"
import { CounterWithUseReducer, CounterWithUseState } from "./Counter";

function App() {
    return (
        <StateInspector name="Example">
            <Counters />
        </StateInspector>
    )
}

function Counters() {
    return (
        <div>
            <p>Counters</p>

            <CounterWithUseReducer id="counter1" />
            <CounterWithUseState id="counter2" />
        </div>
    )
}

ReactDOM.render(<App />, document.getElementById("root"))
