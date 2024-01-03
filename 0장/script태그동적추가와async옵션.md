# script 태그 동적 추가와 async 옵션

다음과 같이 작성하면 async가 false로 설정되지 않는다

```jsx
<script async="false" src="1.js"></script>
```

설정되지 않는 이유는

-   script element 스펙을 보면 async, defer attributes는 boolean attributes 라고 명시되어있다
-   boolean attributes는 attributes를 명시하는 것만으로 true 가 된다
-   따라서 async=”true” 든 async=”false” 든 모두 async 를 설정하는 걸로 간주한다
-   스크립트를 추가된 순서대로 실행하려면 attributes에서 async를 생략하면 된다

다음과 같이 작성하면 async가 false로 동작한다

```jsx
// js에서 동적 로딩하는 경우
const s = document.createElement("script");
s.src = "1.js";
s.async = false; // false로 적용됨
document.body.appendChild(s);
```

-   콘솔창에 동적으로 생성된 스크립트의 async 속성을 확인해보자
-   s.async 값이 true로 나온다

### HTML5.1 script 명세

-   async 속성은 element가 병렬로 실행될지를 결정한다.
    -   병행 : 하나의 CPU가 여러 작업을 번갈아가며 수행. 마치 여러 작업이 동시에 실행되는 것처럼 보임
    -   병렬 : 여러 개의 코어에서 여러 작업을 동시에 하는 것
