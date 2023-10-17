/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-04 16:57:41
 * @Description: 
 */
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'

const ele = (
    <h1 className='container'>
        hello
        <span style={{ color: 'red' }}>world</span>
    </h1>
)

function reducer (state, action) {
    switch (action.type) {
        case 'add':
            return state + 1
        default:
            return state
    }
}

function App () {
    // const [number, setNumber] = React.useReducer(reducer, 0)
    const [number, setNumber] = React.useState(0)
    console.log(number);
    // debugger
    // return <button onClick={() => setNumber({ type: 'add' })}>{number}</button>
    return <button onClick={() => setNumber(number+1)}>{number}</button>
    // return (
    //     <h1
    //         className='container'
    //         onClick={() => console.log('onClick h1')}
    //         onClickCapture={() => console.log('onClickCapture h1')}
    //     >
    //         hello
    //         <span
    //             style={{ color: 'red' }}
    //             onClick={() => console.log('onClick span')}
    //             onClickCapture={() => console.log('onClickCapture span')}
    //         >world</span>
    //     </h1>
    // )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)