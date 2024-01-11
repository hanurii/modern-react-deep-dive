# 2.4 렌더링은 어떻게 일어나는가?

**학습 목표**

-   리액트 렌더링의 개념을 알 수 있다
-   리액트 렌더링의 작동 원리를 알 수 있다
    -   리액트 렌더링이 언제 트리거되는지 알 수 있다
-   렌더 단계와 커밋 단계에 대해 알 수 있다

## 리액트 렌더링을 쉽게 설명한 자료

https://ko.react.dev/learn/render-and-commit

**React 공식문서 - render and commit**

-   React 의 모든 화면 업데이트는 세 단계로 이뤄짐
    1. 트리거
        - **초기 렌더링인 경우** : ReactDOM.createRoot(rootElement).render(App)
        - **state가 업데이트된 경우**
    2. 렌더링 - **React에서 컴포넌트를 호출하는 것**
        - 초기 렌더링 : 루트 컴포넌트 호출
        - 리렌더링 : 렌더링을 트리거한 컴포넌트 호출
            - 재귀 단계 : 컴포넌트가 다른 컴포넌트를 반환하면 해당 컴포넌트를 렌더링하고, 해당 컴포넌트도 다른 컴포넌트를 반환하면 반환된 컴포넌트를 다음에 렌더링하는 방식으로 이뤄짐. 중첩된 컴포넌트가 더 이상 없고 React가 화면에 표시되어야 하는 내용을 정확히 알 때까지 이 단계를 지속
            - 리렌더링하는 동안 리액트는 이전 렌더링과 비교해서 달라진 점을 찾아내고, 계산함. 다음 커밋 단계까지는 이 정보로 아무 작업도 수행하지 않음
        - 렌더링은 항상 순수한(pure) 계산이어야 함
            1. **동일한 입력에는 동일한 출력을 해야 함**
            2. **이전 state를 변경하면 안됨**
            - 이를 지키지 않을 시 혼잡스러운 버그와 예측할 수 없는 동작이 발생할 수 있음
            - 리액트는 Strict Mode에서 개발할 때, 컴포넌트 함수를 두 번 호출하여 순수하지 않은 함수로 인해 생기는 실수를 방지할 수 있도록 도와줌
    3. 커밋 - DOM 업데이트
        - 초기 렌더링 : appendChild() DOM API를 이용해 생성된 모든 DOM 노드를 화면에 배치
        - 리렌더링 : 렌더링 과정 중에 계산된 최소한의 작업들을 가지고 DOM 업데이트
            - **리액트는 렌더링 간에 차이가 있는 경우에만 DOM 노드를 변경함**
    4. 에필로그 : 브라우저 페인트
        - 렌더링이 완료되고 React가 DOM을 업데이트한 후 브라우저는 화면을 다시 그린다
        - 이 단계를 “브라우저 렌더링” 이라고 하지만 공식 문서에선 혼동을 피하고자 페인팅이라고 부를겠음

https://www.youtube.com/watch?v=N7qlk_GQRJU

**React.js의 렌더링 방식 살펴보기 - 이정환**

1. 웹 브라우저의 렌더링
    - CRP (Critical Rendering Path)
    - 업데이트 시 Reflow, Repaint 가 발생
    - Reflow, Repaint는 매우 비용이 비싼 연산
    - 3000번 innerHTML을 바꾸는 예제 vs 결과값을 모아 1번 innerHTML 바꾸는 예제
        - 4500ms vs 250ms (22배 개선)
    - 결과값을 모아 1번 innerHTML 바꾸는 예제 → 최소한의 CRP 를 돌리는데 중점
        - 서비스 규모가 커지고 복잡해질수록 최적화 작업에 한계가 있음
        - 이 모든 것을 자동화하여 지원해주고 있는 것이 리액트 렌더링 프로세스

<img width="704" alt="2024-01-06_08-19-02" src="https://github.com/hanurii/modern-react-deep-dive/assets/38041572/a5f7d4ce-40f7-4f93-af2c-88ac9c255804">

1. 리액트의 렌더링
    - Render Phase와 Commit Phase
        - 초기 렌더링
            - Render Phase
                - Component(JSX) → React Element
                - React Elements → Virtual DOM
                - Virtual DOM
                    - React Element 객체 값의 모임
                    - 실제 DOM 아님 (복제판)
                    - 값으로 표현된 UI(Value UI)라고 이해하는 게 더 정확함
            - Commit Phase
                - Virtual DOM → Actual DOM → CRP
            - 이런 복잡한 과정을 거치는 이유가 뭘까? DOM 수정을 최소화하기 위해서
        - 리렌더링
            - Render Phase
                - Component(JSX) → React Element
                - React Elements → Virtual DOM
                - 재조정 (reconciliation)
                    - (diffing algorithm) 이전에 만든 VDOM과 현재 만든 VDOM을 비교
                    - (update) 여기서 알아낸 변경 사항을 Actual DOM에 갱신
                    - 리액트 엘리먼트 트리를 재귀적으로 순회하면서 이전 트리와 현재 트리의 변경사항을 비교한다음 변경된 부분만 실제 DOM에 반영하는 작업
            - Commit Phase
                - Virtual DOM → Actual DOM → CRP
        
<img width="743" alt="2024-01-06_08-19-27" src="https://github.com/hanurii/modern-react-deep-dive/assets/38041572/ebff8596-09f6-4402-b893-6c77940fcb2c">

### 리액트 렌더링의 개념을 알 수 있다

-   브라우저의 렌더링 : HTML과 CSS 리소스를 기반으로 웹페이지에 필요한 UI를 그리는 과정
-   리액트의 렌더링 : 브라우저 렌더링에 필요한 DOM 트리를 만드는 과정
    -   리액트 애플리케이션 트리 안에 있는 모든 컴포넌트들이 현재 자신들이 가지고 있는 props와 state의 값을 기반으로 어떻게 UI를 구성하고 이를 바탕으로 어떤 DOM 결과를 브라우저에 제공할 것인지 계산하는 일련의 과정

### 리액트 렌더링의 작동 원리를 알 수 있다

**리액트 렌더링은 언제 발생할까?**

1. 최초 렌더링: 사용자가 처음 애플리케이션에 진입했을 때 하는 렌더링
2. 리렌더링: 최초 렌더링 이후 발생하는 모든 렌더링
    - 클래스형 컴포넌트의 setState가 실행되는 경우
    - 클래스형 컴포넌트의 forceUpdate가 실행되는 경우
    - 함수형 컴포넌트의 useState()의 두 번째 배열 요소인 setter가 실행되는 경우
    - 함수형 컴포넌트의 useReducer()의 두 번째 배열 요소인 dispatch가 실행되는 경우
    - 컴포넌트의 key props가 변경되는 경우
    - props가 변경되는 경우
    - 부모 컴포넌트가 렌더링되는 경우: 부모 컴포넌트가 리렌더링되면 자식 컴포넌트도 무조건 리렌더링 된다

**배열에 key가 반드시 필요한 이유**

-   리액트에서 key는 리렌더링 시 형제 요소들 사이 동일 요소를 식별하는 값임
-   리렌더링이 발생하면 current 트리와 workInProgress 트리 사이에 어떤 컴포넌트 변경이 있었는지 구별해야 하는데, 이 두 트리 사이에서 같은 컴포넌트인지를 구별하는 값이 바로 key다.
-   key가 없다면 단순히 파이버 노드 내부의 sibling 인덱스만을 기준으로 판단하게 된다
-   key 값이 렌더링 할때마다 바뀐다면? 리렌더링이 일어날 때마다 sibling 컴포넌트를 구분할 수 없어 리렌더링 대상이 된다. 즉, key의 변화는 리렌더링을 야기한다.
-   이러한 특징을 이용하면 key를 활용해 강제로 리렌더링을 일으키는 것도 가능하다

**리액트 렌더링은 어떤 순서로 발생할까?**

-   렌더링 프로세스가 시작되면 리액트는 컴포넌트의 루트에서부터 차근차근 아래쪽으로 내려가면서 업데이트가 필요하다고 지정돼 있는 모든 컴포넌트를 찾는다
-   만약 여기서 업데이트가 필요하다고 지정돼 있는 컴포넌트를 발견하면 클래스형 컴포넌트의 경우에는 클래스 내부의 render() 함수를 실행하게 되고, 함수형 컴포넌트의 경우에는 FunctionComponent() 그 자체를 호출한 뒤에, 그 결과물을 저장한다
-   일반적으로 렌더링 결과물은 JSX 문법으로 구성돼 있고, 이것이 자바스크립트로 컴파일되면서 React.createElement()를 호출하는 구문으로 변환된다.
-   여기서 createElement는 브라우저의 UI 구조를 설명할 수 있는 일반적인 자바스크립트 객체를 반환한다

```jsx
function Hello() {
	return (
		<TestComponent a={35} b="yceffort">
			안녕하세요
		</TestComponent>
	)
}

function Hello() {
	return React.createElement(
		TestComponent,
		{ a: 35, b: 'yceffort' },
		'안녕하세요',
	)
}

{type: TestComponent, props: {a: 35, b: "yceffort", children: "안녕하세요"}}
```

-   렌더링 프로세스가 실행되면서 이런 과정을 거쳐 각 컴포넌트의 렌더링 결과물을 수집한 다음, 리액트의 새로운 트리인 가상 DOM과 비교해 실제 DOM에 반영하기 위한 모든 변경 사항을 차례차례 수집한다
-   이렇게 계산하는 과정을 리액트의 재조정(reconciliation)이라고 한다. 이런 재조정 과정이 모두 끝나면 모든 변경 사항을 하나의 동기 시퀀스로 DOM에 적용해 변경된 결과물이 보이게 된다
-   여기서 주목할 것은 리액트의 렌더링은 렌더 단계와 커밋 단계라는 총 두 단계로 분리되어 실행된다는 것이다.

### 렌더 단계와 커밋 단계에 대해 알 수 있다

**렌더 단계**

-   컴포넌트를 렌더링하고 변경 사항을 계산하는 모든 작업을 말함
-   즉, 렌더링 프로세스에서 컴포넌트를 실행해(render() 또는 return) 이 결과와 이전 가상 DOM을 비교하는 과정을 거쳐 변경이 필요한 컴포넌트를 체크하는 단계
-   여기서 비교하는 것은 type, props, key 다. 이 세 가지 중 하나라도 변경된 것이 있으면 변경이 필요한 컴포넌트로 체크해 둔다.

**커밋 단계**

-   렌더 단계의 변경 사항을 실제 DOM에 적용해 사용자에게 보여주는 과정을 말함
-   이 단계가 끝나야 비로소 브라우저의 렌더링이 발생한다
-   리액트가 먼저 DOM을 커밋 단계에서 업데이트한다면 이렇게 만들어진 모든 DOM 노드 및 인스턴스를 가리키도록 리액트 내부의 참조를 업데이트한다
-   그 다음, 생명주기 개념이 있는 클래스형 컴포넌트에서는 componentDidMount, componentDidUpdate 메서드를 호출하고, 함수형 컴포넌트에서는 useLayoutEffect 훅을 호출한다

-   여기서 알 수 있는 **중요한 사실은 리액트의 렌더링이 일어난다고 해서 무조건 DOM 업데이트가 일어나는 것은 아니라는 것**이다
-   렌더링은 수행했으나 커밋 단계까지 갈 필요가 없다면, 커밋 단계는 생략될 수 있다

-   이 두 가지 과정으로 이뤄진 리액트의 렌더링은 항상 동기식으로 작동한다
-   따라서 렌더링 과정이 길어질수록 애플리케이션의 성능 저하로 이어지고, 결과적으로 그 시간만큼 브라우저의 다른 작업을 지연시킬 가능성이 있다
-   이는 사실 렌더링 프로세스의 특징을 생각해 보면 당연한 것이다
    -   렌더링이 순차적인 동기 방식이 아니라 순서가 보장되지 않는 비동기 방식으로 이뤄질 경우 사용자는 하나의 상태에 대해 여러 가지 다른 UI를 보게 될 것이다.
    -   A라는 상태가 변겨오디면 B와 C가 각각 B1, C1이 되어야 하는데, A가 변경됐음에도 하나의 컴포넌트가 뒤늦게 변경되어 B, C1 상태로 남아있다고 가정해보자. 이는 사용자에게 혼란을 줄 수 있다
-   그럼에도 이러한 비동기 렌더링 시나리오는 몇 가지 상황에서 유효할 수 있다.
    -   B의 컴포넌트 렌더링 작업이 무거워 상대적으로 빠르게 렌더링할 수 있는 C라도 변경해서 보여줄 수 있다면?
    -   의도된 우선순위로 컴포넌트를 렌더링해 최적화할 수 있는 비동기 렌더링, 이른바 동시성 렌더링이 리액트 18에서 도입됐다.
    -   이 동시성 렌더링은 렌더링 중 렌더 단계가 비동기로 작동해 특정 렌더링의 우선순위를 낮추거나, 필요하다면 중단하거나 재시작하거나, 경우에 따라서는 포기할 수도 있다.
    -   이를 통해 브라우저의 동기 작업을 차단하지 않고 백그라운드에서 새로운 리액트 트리를 준비할 수도 있으므로 사용자는 더욱 매끄러운 사용자 경험을 누릴 수 있다.

### 리액트 렌더링이 어떤 순서로 이뤄지는지 예제 코드로 알아보기

```jsx
import { useState } from "react";

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

function D() {
    return <>리액트 재밌다!</>;
}
```

1. B 컴포넌트의 setState가 호출된다
2. B 컴포넌트의 리렌더링 작업이 렌더링 큐에 들어간다
3. 리액트는 트리 최상단에서부터 렌더링 경로를 검사한다
4. A 컴포넌트는 리렌더링이 필요한 컴포넌트로 표시돼 있지 않으므로 별다른 작업을 하지 않는다
5. 그 다음 하위 컴포넌트인 B 컴포넌트는 업데이트가 필요하다고 체크돼 있으므로 B를 리렌더링한다
6. 5번 과정에서 B는 C를 반환했다
7. C는 props인 number가 업데이트됐다. 그러므로 업데이트가 필요한 컴포넌트로 체크돼 있고 업데이트한다
8. 7번 과정에서 C는 D를 반환했다
9. D도 업데이트가 필요한 컴포넌트로 체크되지 않았지만 C가 렌더링 됐으므로 그 자식인 D도 렌더링된다.

## 참고 자료

### 리액트 렌더링의 규칙

-   https://gist.github.com/sebmarkbage/75f0838967cd003cd7f9ab938eb1958f

### Why react Re-Renders

-   https://www.joshwcomeau.com/react/why-react-re-renders/
-   큰 오해 1 - state 변수가 변경될 때마다 앱 전체가 리렌더링된다
-   큰 오해 2 - 컴포넌트의 props가 변경되면 리렌더링이 발생한다
-   중요한 포인트
    -   리액트의 모든 리렌더링은 state 변경으로부터 시작된다. 이는 컴포넌트가 리렌더링 할 수 있는 유일한 트리거임
    -   컴포넌트가 리렌더링되면 모든 하위 컴포넌트도 리렌더링된다
    -   컴포넌트는 함수다. 컴포넌트를 렌더링할 때 함수를 호출한다. 즉, 리액트 컴포넌트 내부에 정의된 모든 것들이 렌더링 할때마다 다시 생성된다.
    -   리액트 데브툴즈에 있는 프로파일링을 사용해라
        -   Record why each component rendered while profiling 옵션 활성화 (프로파일링하는 동안 각 컴포넌트가 렌더링된 이유에 대해 기록하는 옵션)
        -   Highlight updates when components render 옵션 활성화

### \***\*(번역) 블로그 답변: React 렌더링 동작에 대한 (거의) 완벽한 가이드\*\***

**컴포넌트 메타데이터와 파이버(Fibers)**

-   리액트는 모든 컴포넌트 인스턴스를 추적하는 내부 데이터 구조인 파이버를 사용함
-   컴포넌트와 파이버는 1:1 구조고, 파이버라고 불리는 객체는 다음 메타 데이터 필드를 포함함
    -   컴포넌트 트리의 해당 지점에서 렌더링되어야 할 컴포넌트 type
    -   컴포넌트와 관련된 props, state
    -   부모, 형제, 자식 컴포넌트에 대한 포인터
    -   렌더링 프로세스를 추적하는데 사용하는 기타 내부 메타데이터
-   리액트 16버전부터 채택된 아키텍처 (이전엔 stack 아키텍처를 사용)
-   Fiber 타입을 간단히 나타내면 다음과 같음

```jsx
export type Fiber = {
    tag: WorkTag, // Fiber 타입을 식별하기 위한 태그
    key: null | string, // 해당 엘리먼트의 고유 식별자
    type: any, // Fiber와 관련된 것으로 확인된 함수/클래스

    // 단일 연결리스트 트리 구조
    child: Fiber | null,
    sibling: Fiber | null,
    index: number,

    // Fiber로 입력된 데이터 (arguments/props)
    pendingProps: any,
    memoizedProps: any,
    // 상태 업데이트 및 콜백 큐
    updateQueue: Array<State | StateUpdaters>,
    // 출력을 만드는데 사용되는 state
    memoizedState: any,
    // Fiber에 대한 종속성(컨텍스트, 이벤트) (존재하는 경우)
    dependencies: Dependencies | null,
};
// 참고 https://github.com/facebook/react/blob/v18.0.0/packages/react-reconciler/src/ReactInternalTypes.js#L64-L193
```

-   렌더링 패스 동안 리액트는 이 파이버 객체 트리를 순회
-   기억해야할 점은 **파이버 객체는 실제 컴포넌트의 props와 state 를 저장함**
    -   컴포넌트에서 props와 state를 사용할 때, 리액트는 사실 Fiber 객체에 저장된 값에 대한 접근을 제공하는 형태임
        -   실제로 클래스 컴포넌트의 경우 렌더링 직전 `componentInstance.props = newProps` 를 통해 명시적으로 값을 컴포넌트에 복사함
            -   this.props가 존재하는 건 리액트 Fiber에서 참조값을 복사했기 때문에 존재하는 거라고 보면 됨
            -   그런 의미에서 컴포넌트는 Fiber 객체에 대한 외관이라고 봐도 됨
        -   마찬가지로 컴포넌트의 모든 훅을 해당 컴포넌트의 Fiber 객체에 연결리스트로 저장하기 때문에 훅이 동작함
        -   함수 컴포넌트를 렌더링할 때, Fiber에서 연결된 hook description entries의 연결 리스트를 가져오고, 훅을 호출할 때마다 hook description 객체에 저장된 적절한 값(예를 들면, useReducer의 state 및 dispatch 값 등)을 반환함
-   부모 컴포넌트가 주어진 자식 컴포넌트를 처음으로 렌더링할 때, 리액트는 컴포넌트의 인스턴스를 추적하기 위해 Fiber 객체를 만듦
    -   클래스 컴포넌트의 경우 `const instance = new YourComponentType(props)` 를 호출해 실제 컴포넌트 인스턴스를 Fiber 객체에 저장함
    -   함수 컴포넌트의 경우 `YourComponentType(props)`를 함수로 호출

**컴포넌트 타입(Component Types)과 재조정(Reconciliation)**

-   재조정 공식문서 페이지를 보면 리액트는 기존 컴포넌트 트리와 DOM 구조를 가능한 한 많이 재활용하여 효율적으로 리렌더링하려고 노력함
-   리액트는 변경점을 어떤 시점에 어떤 방법으로 알 수 있을까?
    -   리액트 렌더링 로직은 먼저 엘리먼트의 type 필드를 === 로 참조 비교함
    -   type 필드가 변경된 경우(div에서 span, CompoA에서 CompoB) 리액트는 전체 트리가 변경되었다고 가정함
    -   결과적으로 리액트는 해당 컴포넌트 트리의 전체를 삭제하고 새 컴포넌트 엘리먼트 인스턴스로 처음부터 다시 만듦
    -   이렇기 때문에 렌더링 동안엔 새 컴포넌트 타입을 생성해선 안됨. 새 컴포넌트 타입을 생성할 때마다 이 타입은 다른 참조값이 되어 하위 컴포넌트 트리를 반복적으로 삭제 및 재생성함
