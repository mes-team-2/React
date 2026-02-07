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

  // 자재 이력 전체 조회
  getMaterialTxSummary: async (params) => {
    return await AxiosAPI2.get("/api/inventory/materialtx/summary", {
      params,
    });
  },
  // 자재 이력 상세 조회
  getMaterialTxDetail: async (materialId) => {
    return await AxiosAPI2.get(`/api/inventory/materialtx/${materialId}`);
  },

  // LOT 이력 조회
  getMaterialLotList: async (params) => {
    return await AxiosAPI2.get(`/api/lots/materialLot`, {
      params,
    });
  },
  // LOT 이력 전체 조회
  getMaterialLotSummary: async (params) => {
    return await AxiosAPI2.get(`/api/lots/materialLot/summary`, {
      params,
    });
  },
  // LOT 이력 상세 조회
  getMaterialLotDetail: async (id) => {
    return await AxiosAPI2.get(`/api/lots/materialLot/${id}`);
  },

  // 완성품 재고 조회
  getFgInventory: async (params) => {
    return await AxiosAPI2.get(`/api/inventory/fginventory`, {
      params,
    });
  },

  // 완성품 재고 상세 조회
  getFgInventoryDetail: async (productCode) => {
    return await AxiosAPI2.get(`/api/inventory/fginventory/${productCode}`);
  },
};

export const LogAPI2 = {
  // 검사 이력 조회
  getTestLogs: async (params) => {
    console.log(params);
    return await AxiosAPI2.get("/api/log/testlog", { params });
  },

  // 검사 이력 통계용
  getTestSummaryLogs: async (params) => {
    return await AxiosAPI2.get("/api/log/testlog/dashboard", { params });
  },

  // 추적용 목록 조회
  getTraceLogs: async (params) => {
    return await AxiosAPI2.get("/api/log/trace", { params });
  },

  // 추적용 합계조회
  getTraceSummaryLogs: async (params) => {
    return await AxiosAPI2.get("/api/log/trace/summary", { params });
  },
};
export default AxiosAPI2;
