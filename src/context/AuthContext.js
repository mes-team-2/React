import React, { createContext, useState, useEffect } from "react";

// Context 생성
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [workerCode, setWorkerCode] = useState("");

  // 앱 실행 시(새로고침 시) 토큰 및 정보 체크
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedWorkerCode = localStorage.getItem("workerCode");

    if (token) {
      setIsLoggedIn(true);
      setWorkerCode(storedWorkerCode || "");
    } else {
      setIsLoggedIn(false);
      setWorkerCode("");
    }
  }, []);

  // 로그인 성공 시
  const login = (token, code, role, name, refreshToken) => {
    // 1. 토큰 저장
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);

    // 2. 사용자 정보 저장
    localStorage.setItem("workerCode", code);
    if (role) localStorage.setItem("role", role);
    if (name) localStorage.setItem("workerName", name);

    // 3. 상태 업데이트
    setIsLoggedIn(true);
    setWorkerCode(code);
  };

  // 로그아웃: 모든 정보 삭제
  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setWorkerCode("");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, workerCode, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
