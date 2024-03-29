import logo from "./logo.svg";
import { useState, memo } from "react";
import "./App.css";

export default function A() {
    return (
        <div className="App">
            <h1>Hello React!</h1>
            <B />
        </div>
    );
}

function B() {
    const [counter, setCounter] = useState(0);

    function handleButtonClick() {
        setCounter((previous) => previous + 1);
    }

    return (
        <>
            <label>
                <C number={counter} />
            </label>
            <button onClick={handleButtonClick}>+</button>
        </>
    );
}

function C({ number }) {
    return (
        <div>
            {number} <D />
        </div>
    );
}

const D = memo(() => {
    return <>리액트 재밌다!</>;
});
