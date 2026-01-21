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
    color: #000;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;

  input {
    width: 100%;
    padding: 15px;
    border-radius: 12px;
    border: 1px solid #ddd;
    font-size: 15px;
    outline: none;

    &:focus {
      border-color: #000;
      background-color: #fcfcfc;
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

  &:hover {
    background-color: #333;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Login = () => {
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");

  const isDisabled = !id || !pwd;

  const handleLogin = (e) => {
    e.preventDefault(); // 🔑 엔터/버튼 공통 처리
    if (isDisabled) return;

    console.log("로그인 시도:", { id, pwd });
    // TODO: 로그인 API 연동
  };

  return (
    <LoginWrapper>
      <LoginCard>
        <h2>LOGIN</h2>

        {/* ✅ form 사용 → Enter 키 자동 로그인 */}
        <form onSubmit={handleLogin}>
          <InputGroup>
            <input
              type="text"
              placeholder="사원번호"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />

            <input
              type="password"
              placeholder="비밀번호"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
          </InputGroup>

          <LoginButton type="submit" disabled={isDisabled}>
            로그인
          </LoginButton>
        </form>
      </LoginCard>
    </LoginWrapper>
  );
};

export default Login;
