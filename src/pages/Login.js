import styled from "styled-components";
import { useState } from "react";

const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 100px;
  min-height: 100vh;
  background-color: #fcfcfc;
  font-family: "Noto Sans KR", sans-serif;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 40px;
  border-radius: 30px;
  border: 1px solid #eee;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;

  h2 {
    font-family: "dnf bitbit v2", sans-serif;
    font-size: 26px;
    margin-bottom: 30px;
    text-align: left;
    color: #000;
  }
`;
const InputGroup = styled.div`
  margin-bottom: 12px;
  input {
    width: 100%;
    padding: 15px;
    border-radius: 12px;
    border: 1px solid #ddd;
    box-sizing: border-box;
    font-size: 15px;
    outline: none;
    transition: all 0.2s ease-in-out;
    &:focus {
      border-color: #000;
      background-color: #fcfcfc;
    }
    &::placeholder {
      color: #bbb;
    }
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: #888;
  color: white;
  border: none;
  border-radius: 30px;
  font-family: "dnf bitbit v2", sans-serif;
  font-size: 18px;
  cursor: pointer;
  margin-top: 15px;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #333;
  }
`;

const Login = () => {
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");

  return (
    <LoginWrapper>
      <LoginCard>
        <InputGroup>
          <input
            type="text"
            placeholder="사원번호"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
            }}
          />
          <InputGroup>
            <input
              type="password"
              placeholder="비밀번호"
              value={pwd}
              onChange={(e) => {
                setPwd(e.target.value);
              }}
            />
          </InputGroup>
        </InputGroup>
      </LoginCard>
    </LoginWrapper>
  );
};

export default Login;
