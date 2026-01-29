import React, { createContext, useState, useEffect } from "react";

// Context 생성
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [workerCode, setWorkerCode] = useState("");

  // 앱 실행 시(새로고침 시) 토큰 체크
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

  // 로그인 성공 시: 저장/상태만 (이동은 Login/App에서 처리)
  const login = (token, code) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("workerCode", code);
    setIsLoggedIn(true);
    setWorkerCode(code);
  };

  // 로그아웃: 저장/상태만 (이동은 호출한 쪽에서 처리)
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("workerCode");
    setIsLoggedIn(false);
    setWorkerCode("");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, workerCode, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
