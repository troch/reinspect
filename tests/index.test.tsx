import React, { useReducer as useReactReducer } from "react"
import { StateInspector, useReducer as useReinspectReducer } from "../src"
import { shallow, mount } from "enzyme"

const Wrapper: React.FC = ({ children }) => {
  return (
    <StateInspector name="Test">
      <div className="hello" />
      {children}
    </StateInspector>
  )
}

const initArg = {
  start: 3
}

const init = (arg: typeof initArg) => ({
  count: arg.start
})

type State = ReturnType<typeof init>

const INCREMENT = "INCREMENT"

type Actions = {
  type: typeof INCREMENT
}

const myReducer = (state: State, action: Actions) => {
  switch (action.type) {
    case INCREMENT:
      return { ...state, count: state.count + 1 }
    default:
      return state
  }
}

describe("reinspect", () => {
  it("render StateInspector", () => {
    const result = shallow(<Wrapper />)
      .find({ name: "Test" })
      .exists()

    expect(result).toBeTruthy()
  })

  it("react useReducer", () => {
    const Counter: React.FC = () => {
      const [state, dispatch] = useReactReducer(myReducer, initArg, init)

      const handleClick = () => {
        dispatch({ type: INCREMENT })
      }

      return (
        <div>
          <span className="display">Count: {state.count}</span>
          <button className="increment" onClick={handleClick} type="button">
            Increment
          </button>
        </div>
      )
    }

    const counter = mount(
      <Wrapper>
        <Counter />
      </Wrapper>
    )

    expect(counter.find(".display").text()).toBe("Count: 3")
    counter.find(".increment").simulate("click")
    expect(counter.find(".display").text()).toBe("Count: 4")
  })

  it("reinspect useReducer", () => {
    const Counter: React.FC = () => {
      const [state, dispatch] = useReinspectReducer(
        myReducer,
        initArg,
        init,
        "NAME"
      )

      const handleClick = () => {
        dispatch({ type: INCREMENT })
      }

      return (
        <div>
          <span className="display">Count: {state.count}</span>
          <button className="increment" onClick={handleClick} type="button">
            Increment
          </button>
        </div>
      )
    }

    const counter = mount(
      <Wrapper>
        <Counter />
      </Wrapper>
    )

    expect(counter.find(".display").text()).toBe("Count: 3")
    counter.find(".increment").simulate("click")
    expect(counter.find(".display").text()).toBe("Count: 4")
  })

  it("reinspect useReducer type overloads", () => {
    const Counter: React.FC = () => {
      type MyState = {
        start: number
        count: number
      }

      const initArg: Partial<MyState> = { start: 2 }

      const inti = ({ start }: typeof initArg) => ({
        start,
        count: start ? start : 0 + 1
      })

      // inital arg as partial of state
      const [state, dispatch] = useReinspectReducer(
        myReducer,
        initArg,
        inti,
        "NAME"
      )

      // any init arg
      const [state2, dispatch2] = useReinspectReducer(
        myReducer,
        {
          color: "black"
        },
        ({ color }) => ({ count: 123 }),
        "NAME"
      )

      // inital state only
      const [state3, dispatch3] = useReinspectReducer(
        myReducer,
        { count: 2 },
        "NAME"
      )

      return (
        <div>
          <p>Hello</p>
        </div>
      )
    }

    const counter = shallow(
      <Wrapper>
        <Counter />
      </Wrapper>
    )

    expect(counter.exists()).toBeTruthy()
  })
})
