# useState

**학습 목표**

-   useState의 개념을 알 수 있다
-   useState의 사용 방법을 알 수 있다
-   useState의 작동원리를 알 수 있다
-   리렌더링 시 useState의 state 값이 초기화되지 않는 이유를 알 수 있다
-   setState 에 값을 넣을 때랑 함수를 넣을 때랑의 차이를 알 수 있다

### useState의 개념을 알 수 있다

-   함수형 컴포넌트 내부에서 상태를 정의하고, 이 상태를 관리할 수 있게 해주는 훅

### useState의 사용 방법을 알 수 있다

```jsx
import { useState } from "react";

const [state, setState] = useState(initialState);
```

-   initialState : state의 초깃값. 아무것도 넘겨주지 않으면 undefined. 초기 렌더링 이후엔 무시됨.
    -   원시값이 아닌 함수를 넣게되면 게으른 초기화 (lazy initialization) 를 하게 된다.
    -   이 함수를 초기화 함수라 부르고, 순수해야하고 인수를 받지 않아야 하고 반드시 어떤 값을 반환해야함
    -   게으른 초기화는 initialState가 복잡하거나 무거운 연산을 포함하고 있을 때 사용한다
    -   게으른 초기화 함수는 state가 처음 만들어질 때만 사용한다 (이후 리렌더링 시엔 이 함수 실행은 무시됨)
-   useState 훅의 반환 값은 배열
-   state : 값 자체
-   setState : 이 함수를 사용해 해당 state 값을 변경할 수 있다

### useState의 초기값과 게으른 초기화

-   함수형 컴포넌트는 렌더링 시마다 함수를 호출한다
-   당연하게도 useState 함수도 호출한다
-   만약 useState 초기값으로 비용이 큰 작업이 들어간다면 리렌더링이 될때마다 큰 비용이 발생하게 된다
-   게으른 초기화 함수를 넣어 최초 렌더링 이후엔 실행되지 않도록 하자

### useState의 작동원리를 알 수 있다

**컴포넌트 내 선언한 변수로 화면 상태값이 변하지 않는 이유**

-   다음 코드가 동작하지 않는 이유는? 리렌더링을 발생시키기 위한 조건을 전혀 충족시키지 못해서일까?

```jsx
function Component() {
    let state = "hello";

    function handleButtonClick() {
        state = "hi";
    }

    return (
        <>
            <h1>{state}</h1>
            <button onClick={handleButtonClick}>h1</button>
        </>
    );
}
```

-   리액트의 렌더링 : 함수형 컴포넌트의 return과 클래스형 컴포넌트의 render 함수를 실행하고, 이 실행 결과를 이전 리액트 트리와 비교해 리렌더링이 필요한 부분만 업데이트한다

```jsx
function Component() {
    const [, triggerRender] = useState();
    let state = "hello";

    function handleButtonClick() {
        state = "hi";
        triggerRender();
    }

    return (
        <>
            <h1>{state}</h1>
            <button onClick={handleButtonClick}>h1</button>
        </>
    );
}
```

-   여전히 state 값이 변경되지 않고 있다. state가 업데이트되고 있지만 렌더링 되지 않는 이유는? → 그 이유는 리액트의 렌더링은 함수형 컴포넌트에서 반환한 결과물인 return 값을 비교해 실행되기 때문이다.
-   즉, 매번 렌더링이 발생될 때마다 함수는 다시 새롭게 실행되고, 새롭게 실행되는 함수에서 state는 매번 hello로 초기화되므로 아무리 state를 변경해도 다시 hello로 초기화되는 것이다

**리렌더링 시 useState의 state 값이 초기화되지 않는 이유**

-   아직 useState 내부 구현을 모른다고 가정하고 useState를 구현해보자

```jsx
function useState(initialValue) {
    let internalState = initialValue;

    function setState(newValue) {
        internalState = newValue;
    }

    return [internalState, setState];
}

const [value, setValue] = useState(0);
setValue(1);
console.log(value); // 0 원하는대로 동작하지 않음
```

-   원하는대로 동작하지 않는 이유는?
    -   이미 구조 분해 할당으로 value를 상수로 선언해놓은 상태라서 훅 내부의 setState를 호출하더라도 value 값이 고정되어 새로운 값을 출력하지 못함
-   이를 해결하기 위해 state를 함수로 바꿔 state 값을 호출할 때마다 현재 state를 반환하게 해보자

```jsx
function useState(initialValue) {
    let internalState = initialValue;

    function state() {
        return internalState;
    }

    function setState(newValue) {
        internalState = newValue;
    }

    return [state, setState];
}

const [value, setValue] = useState();
setValue(1);
console.log(value()); // 1
```

-   해결했지만 우리가 사용하는 useState 훅의 모습과는 많이 동떨어져 있다. 우리는 state를 함수가 아닌 상수처럼 사용하고 있기 때문이다. 이를 해결하기 위해 리액트는 클로저를 이용했다.
-   여기서 클로저는 어떤 함수(useState) 내부에 선언된 함수(setState)가 함수의 실행이 종료된 이후에도(useState가 호출된 이후에도) 지역변수인 state를 계속 참조할 수 있다는 것을 의미한다
-   다음은 useState의 실제 구현 코드가 아닌 작동 방식을 흉내낸 코드다 (Preact 구현을 참고)

```jsx
const MyReact = function () {
    const global = {};
    let index = 0;

    function useState(initialState) {
        if (!global.states) {
            // 애플리케이션 전체의 states 배열을 초기화한다.
            // 최초 접근이라면 빈 배열로 초기화한다.
            global.states = [];
        }
    }

    // states 정보를 조회해서 현재 상태값이 있는지 확인하고,
    // 없다면 초깃값으로 설정한다.
    const currentState = global.states[index] || intialState;
    // states의 값을 위에서 조회한 현재 값으로 업데이트한다
    global.states[index] = currentState;

    // 즉시 실행 함수로 setter를 만든다
    const setState = (function () {
        // 현재 index를 클로저로 가둬놔서 이후에도 계속해서 동일한 index에
        // 접근할 수 있도록 한다.
        let currentIndex = index;
        return function (value) {
            global.states[currentIndex] = value;
            // 컴포넌트를 렌더링한다. 실제로 컴포넌트를 렌더링하는 코드를 생략했다.
        };
    })();

    // useState를 쓸 때마다 index를 하나씩 추가한다. 이 index는 setState에서 사용된다.
    // 즉, 하나의 state마다 index가 할당돼 있어 그 index가 배열의 값(global.states)을
    // 가리키고 필요할 때마다 그 값을 가져오게 한다.
    index = index + 1;

    return [currentState, setState];
};

// 실제 useState를 사용하는 컴포넌트
function Component() {
    const [value, setValue] = useState(0);
    // ...
}
```

-   매번 실행되는 함수형 컴포넌트 환경에서 state 값을 유지하고 사용하기 위해서 리액트는 클로저를 활용하고 있다
-   정리
    -   리액트 렌더링을 통해 함수형 컴포넌트가 호출되게 되면 useState 함수가 호출된다
    -   state 값은 `const currentState = global.states[index] || initialState;` 가 되고
    -   setState 값은 `(value) ⇒ global.states[currentIndex] = value;` 가 된다
    -   setState가 원하는 시점에 원하는 state 값을 바꿀 수 있는 이유는, 클로저를 통해 setState는 state가 위치한 index(currentIndex)를 기억하고 있기 때문에, 원하는 state 값에 접근하여 값을 변경할 수 있게 된다.
    -   리액트가 주기적으로 리렌더링해도 state 값이 초기화되지 않는 이유는 useState 함수 밖에서 global.states와 index 값이 관리되는데 이 값을 통해 가장 최근의 state 값에 바로 접근할 수 있기 때문이다.

### setState 에 값을 넣을 때랑 함수를 넣을 때랑의 차이를 알 수 있다

-   setState(nextState): void
    -   nextState : 값은 모든 데이터 타입이 허용되지만, 함수에 대해서는 특별한 동작이 있음
    -   함수를 넘기면 업데이터 함수로 취급한다.
        -   이 함수는 순수해야 하고, 대기중인(pending) state를 유일한 인수로 사용해야 하며, 다음(next) state를 반환해야 한다.
        -   리액트는 업데이터 함수를 큐에 넣고 컴포넌트를 리렌더링한다.
        -   (다음 렌더링 중에) 큐에 있는 모든 업데이터는 대기중인 state를 가져와서 다음 state를 계산한다
-   주의사항
    -   setState는 **다음** 렌더링에 대한 state 변수만 업데이트합니다.
    -   setState를 호출한 후에도 state 변수에는 여전히 호출 전 화면에 있던 이전 값이 담겨 있습니다.
    ```jsx
    function handleClick() {
        setName("Robin");
        console.log(name); // 아직 "Taylor" 입니다!
    }
    ```
    -   setState는 **다음** 렌더링에서 반환하는 useState에만 영향을 줍니다

**항상 업데이터를 사용하는 게 더 좋을까요?**

-   No. 항상 그래야만 하는 건 아님
-   nextState로 값을 넣든 함수를 넣든 차이는 없음
-   다만, 동일한 이벤트 핸들러 안에서 여러 업데이트를 수행하는 경우 업데이터 함수가 도움이 될 수 있음
-   또, state 변수 자체에 접근이 어려운 경우에도 유용 (리렌더링 최적화 시 이 문제가 발생할 수 있음)
-   친절한 문법보단 일관성을 더 선호한다면 항상 업데이터를 작성하는 게 좋을 순 있음
-   만약 A 상태가 B 상태의 이전 상태로부터 계산되는 경우라면, 이를 하나의 객체로 결합하고 reducer를 사용하는 게 좋음

**객체 및 배열 state 업데이트하기**

-   state는 읽기 전용이므로, **기존 객체를 변경하지 않고 교체해야 합니다.**
