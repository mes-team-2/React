import axios from "axios";

const AxiosAPI2 = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ==============================================
   인터셉터 설정 (기존과 동일)
============================================== */
AxiosAPI2.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

AxiosAPI2.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("세션이 만료되었습니다. 로그아웃 처리합니다.");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("workerCode");

      alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");

      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

/* ==============================================
   API 호출 함수 모음
============================================== */
export const InventoryAPI2 = {
  // 자재 이력 조회
  getMaterialTxList: async (params) => {
    return await AxiosAPI2.get("/api/inventory/materialtx", {
      params,
    });
  },

  // 자재 이력 상세 조회
  // getMaterialLots: async (materialId) => {
  //   return await AxiosAPI2.get(`/api/inventory/materialtx/${materialId}/lots`);
  // },
};

export default AxiosAPI2;
