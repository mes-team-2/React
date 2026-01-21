import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";

const GlobalStyle = createGlobalStyle`
  ${reset}
  * {
    box-sizing: border-box;
  }
  body {
    font-family: 'Noto Sans KR', sans-serif;
    font-size: var(--text-base);
    color: var(--font);
  }
  :root {
    /* 색상 정의 */
    --main : #004dfc;
    --main2 : #AED6F2;
    --background : #FFFFFF;
    --background2 : #E9EEF1;
    --border : #E9E9E9;
    --font : #000000;
    --font2 : #828282;
    --font3 : #ffffff;
    --run : #22c55e; 
    --stop : #64748b; 
    --waiting : #f59e0b; 
    --error : #ef4444; 
    --complete : #004dfc;
    --bgWaiting : #FEF6E7;
    --bgRun : #E9FAEF;
    --bgComplete : #E6EEFF;
    --bgError : #FEEDED;
    --bgStop : #D1D6DD;

    /* 폰트 사이즈 정의 */
    --fontXs : 12px;  /* 아주 작은 텍스트 (캡션, 라벨) */
    --fontSm : 14px;  /* 작은 텍스트 (보조 설명) */
    --fontMd : 15px;  /* 본문 기본 텍스트 (일반적인 크기) */
    --fontLg : 16px;  /* 강조된 본문, 소제목 */
    --fontXL : 18px;  /* 카드 타이틀, 중간 제목 */
    --font2XL : 20px;  /* 대제목 */
    --font3XL : 24px;  /* 화면 타이틀 */

    /* 폰트 굵기 정의 */
    --normal : 400;
    --bold : 600;
  }
  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer; 
  }
  input, textarea {
    outline: none; 
    border: none;
    font-family: inherit; 
    font-size: inherit
  }
  a {
    text-decoration: none;
    color: inherit;   
  }
  ul, li {
    list-style: none;  
  }
  img {
    max-width: 100%;
    display: block;  
  }
  svg:focus {
  outline: none; 
  }

  svg *:focus {
  outline: none; 
  }
`;

export default GlobalStyle;
