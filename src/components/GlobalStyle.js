import { createGlobalStyle } from "styled-components";
import reset from "styled-reset"; // 기존 브라우저 스타일 리셋함

const GlobalStyle = createGlobalStyle`
  ${reset}
  * {
    box-sizing: border-box;
  }
  body {
    font-family: 'Noto Sans KR', sans-serif;
  }
  :root {
    --main : #004dfc;
    --main2 : #AED6F2;
    --background : #FFFFFF;
    --background2 : #E9EEF1;
    --border : #E9E9E9;
    --font : #000000;
    --font2 : #828282;
    --font3 : #ffffff;
    --run : #22c55e; // 가동 (작업 지시 받고 설비/공정이 가동된 상태)
    --stop : #64748b; // 정지
    --waiting : #f59e0b; // 대기 (기본값)
    --error : #ef4444; // 에러
  }
  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer; // 모든 버튼에 포인터 적용 (누르고 싶게)
  }
  input, textarea {
    outline: none; // 클릭 시 생기는 파란 테두리 제거
    border: none;
    font-family: inherit; // 부모의 폰트를 그대로 상속
  }
  a {
    text-decoration: none; // 링크 밑줄 제거
    color: inherit;       // 부모 글자색 상속
  }
  ul, li {
    list-style: none;     // 리스트 앞의 점(dot) 제거
  }
  img {
    max-width: 100%; // 부모 너비를 넘지 않도록 설정
    display: block;  
  }
  svg:focus {
  outline: none;  // 포커스 외곽선 제거
  }

  svg *:focus {
  outline: none; // 포커스 외곽선 제거
  }
`;

export default GlobalStyle;
