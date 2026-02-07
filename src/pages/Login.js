import styled, { keyframes, css } from "styled-components";
import { useState, useContext, useMemo } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AxiosAPI from "../api/AxiosAPI";
import { AuthContext } from "../context/AuthContext";
import logo from "../images/logo.png";

const Login = () => {
  const { isLoggedIn, login } = useContext(AuthContext); // 로그인 상태 및 함수 가져옴
  const location = useLocation(); // 현재 위치 정보
  const navigate = useNavigate(); // 페이지 이동 함수

  const [id, setId] = useState(""); // 사원번호 상태
  const [pwd, setPwd] = useState(""); // 비밀번호 상태

  /* [Memo] 로그인 후 이동할 경로 계산 */
  const fromPath = useMemo(() => {
    const p = location.state?.from?.pathname;
    if (!p || p === "/login") return "/mes/dashboard";
    return p;
  }, [location.state]);

  /* 이미 로그인된 상태라면 목적지로 바로 이동 */
  if (isLoggedIn) {
    return <Navigate to={fromPath} replace />;
  }

  /* [Handler] 로그인 버튼 클릭 시 실행되는 함수 */
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
        navigate(fromPath, { replace: true });
      }
    } catch (err) {
      alert("사원번호 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <LoginWrapper>
      <LoginCard>
        <Header>
          <Logo src={logo} alt="logo" />
        </Header>

        <form onSubmit={handleLogin}>
          <InputGroup>
            <input
              type="text"
              placeholder="사원번호를 입력하세요"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoFocus
            />
          </InputGroup>

          {id.length > 0 && (
            <InputGroup>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
              />
            </InputGroup>
          )}

          {/* 비밀번호 입력 시 로그인 버튼 노출 */}
          {id.length > 0 && pwd.length > 0 && (
            <LoginButton type="submit">로그인</LoginButton>
          )}
        </form>
      </LoginCard>
    </LoginWrapper>
  );
};

export default Login;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--background2);
`;

const LoginCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  padding: 50px 40px;
  border-radius: 40px;
  box-shadow: 20px 20px 25px rgba(0, 0, 0, 0.4);
  box-sizing: border-box;
  text-align: center;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.5s ease-out forwards;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 50px;
`;

const Logo = styled.img`
  width: 100px;
  height: auto;
  object-fit: contain;
`;

const LoginTitle = styled.h1`
  font-size: 20px;
  color: var(--font);
  font-weight: 700;
  letter-spacing: 1px;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
  width: 100%;
  animation: ${fadeInUp} 0.5s ease-out forwards;

  input {
    width: 100%;
    padding: 10px 16px;
    border-radius: 30px;
    border: 2px solid transparent;
    background-color: var(--background2);
    box-shadow: var(--shadow);
    box-sizing: border-box;
    font-size: var(--fontXl);
    outline: none;
    transition: all 0.3s ease;
    color: var(--font);

    &:focus {
      border-color: #8e9eab;
      background-color: var(--background);
      box-shadow: var(--shadow);
    }

    &::placeholder {
      color: var(--font2);
    }
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 10px 18px;
  background: var(--main);
  color: var(--font3);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  animation: ${fadeInUp} 0.5s ease-out forwards;

  &:hover {
    box-shadow: var(--shadow);
    transform: translateY(-4px);
  }

  &:active {
    transform: translateY(0);
  }
`;
