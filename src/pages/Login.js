import styled from "styled-components";
import { useState, useContext } from "react"; // useContext 추가
import AxiosAPI from "../api/AxiosAPI"; // 만들어둔 Axios 인스턴스 import
import { AuthContext } from "../context/AuthContext"; // Context import

/* =========================
   스타일 컴포넌트 (기존 동일)
========================= */
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

/* =========================
   메인 컴포넌트
========================= */
const Login = () => {
  const { login } = useContext(AuthContext); // Global 로그인 함수 가져오기
  const [id, setId] = useState(""); // UI에서는 id지만 백엔드는 workerCode
  const [pwd, setPwd] = useState("");

  const isDisabled = !id || !pwd;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isDisabled) return;

    try {
      // 1. AxiosAPI를 사용해 백엔드로 요청 (baseURL 설정 덕분에 /auth/login만 쓰면 됨)
      const response = await AxiosAPI.post("/auth/login", {
        workerCode: id, // 백엔드 DTO 필드명에 맞춤
        password: pwd,
      });

      // 2. 성공 시 처리 (200 OK)
      if (response.status === 200) {
        const { accessToken } = response.data;

        // 3. AuthContext의 login 함수 호출 -> 토큰 저장 및 페이지 이동 자동 처리
        login(accessToken, id);

        console.log("로그인 성공!");
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      // 에러 상황별 알림 (401: 비번 틀림, 그 외: 서버 오류)
      if (error.response && error.response.status === 401) {
        alert("사원번호 또는 비밀번호가 일치하지 않습니다.");
      } else {
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  return (
    <LoginWrapper>
      <LoginCard>
        <h2>LOGIN</h2>

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
