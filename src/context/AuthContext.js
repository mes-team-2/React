import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Context 생성
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [workerCode, setWorkerCode] = useState("");

  // 앱 실행 시(새로고침 시) 토큰 체크
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedWorkerCode = localStorage.getItem("workerCode");

    if (token) {
      setIsLoggedIn(true);
      setWorkerCode(storedWorkerCode || "");
    }
  }, []);

  // 로그인 성공 시 호출할 함수
  const login = (token, code) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("workerCode", code);
    setIsLoggedIn(true);
    setWorkerCode(code);
    navigate("/");
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("workerCode");
    setIsLoggedIn(false);
    setWorkerCode("");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, workerCode, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
