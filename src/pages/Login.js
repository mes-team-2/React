import styled from "styled-components";
import { useState, useContext, useMemo } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AxiosAPI from "../api/AxiosAPI";
import { AuthContext } from "../context/AuthContext";

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
  const { isLoggedIn, login } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");

  // AuthGuard에서 넘어온 원래 목적지
  const fromPath = useMemo(() => {
    const p = location.state?.from?.pathname;
    // 로그인 페이지로 되돌아가는 루프 방지
    if (!p || p === "/login") return "/mes/dashboard";
    return p;
  }, [location.state]);

  // 이미 로그인 상태면: from 있으면 from, 없으면 dashboard
  if (isLoggedIn) {
    return <Navigate to={fromPath} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!id || !pwd) return;

    try {
      const res = await AxiosAPI.post("/auth/login", {
        workerCode: id,
        password: pwd,
      });

      if (res.status === 200) {
        const { accessToken, refreshToken, workerName, workerCode, role } =
          res.data;
        login(accessToken, workerCode, role, workerName, refreshToken);
        // ✅ 로그인 성공 후 원래 가려던 페이지로
        navigate(fromPath, { replace: true });
      }
    } catch (err) {
      alert("사원번호 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <LoginWrapper>
      <LoginCard>
        <h2>LOGIN</h2>

        {/* form 유지 → 엔터 로그인 가능 */}
        <form onSubmit={handleLogin}>
          <InputGroup>
            <input
              type="text"
              placeholder="사원번호"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <input
              type="password"
              placeholder="비밀번호"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
          </InputGroup>

          <LoginButton type="submit">로그인</LoginButton>
        </form>
      </LoginCard>
    </LoginWrapper>
  );
};

export default Login;
