import { createGlobalStyle } from "styled-components";
import reset from "styled-reset"; 

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
