import axios from "axios";

const AxiosAPI = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ==============================================
   인터셉터 설정 (기존과 동일)
============================================== */
AxiosAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

AxiosAPI.interceptors.response.use(
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

// 작업자 관리 API
export const WorkerAPI = {
  // 목록 조회
  getList: async () => {
    return await AxiosAPI.get("/api/master/workers");
  },

  // 등록
  create: async (data) => {
    return await AxiosAPI.post("/api/master/workers", data);
  },

  // 수정
  update: async (workerId, data) => {
    return await AxiosAPI.put(`/api/master/workers/${workerId}`, data);
  },

  getDetail: async (workerId) => {
    return await AxiosAPI.get(`/api/master/workers/${workerId}/detail`);
  },
};

// 설비 관리 API
export const MachineAPI = {
  // 목록 조회
  getList: async () => {
    return await AxiosAPI.get("/api/machines");
  },
};

export const InventoryAPI = {
  // 1. 자재 전체 목록 조회
  getMaterialList: async () => {
    return await AxiosAPI.get("/api/inventory/materials");
  },

  // 자재 상세(Lot) 목록
  getMaterialLots: async (materialId) => {
    return await AxiosAPI.get(`/api/inventory/materials/${materialId}/lots`);
  },

  // 자재 등록
  registerMaterial: async (data) => {
    return await AxiosAPI.post("/api/inventory/material", data);
  },

  // 자재 입고
  inboundMaterial: async (data) => {
    return await AxiosAPI.post("/api/inventory/material/inbound", data);
  },
};

export const AuthAPI = {
  login: async (workerCode, password) => {
    return await AxiosAPI.post("/auth/login", { workerCode, password });
  },
};

export const WorkOrderAPI = {
  getProductList: async () => {
    return await AxiosAPI.get("/api/master/products");
  },

  // 제품 등록
  createProduct: async (data) => {
    return await AxiosAPI.post("/api/master/products", data);
  },

  // 제품 수정
  updateProduct: async (productId, data) => {
    return await AxiosAPI.put(`/api/master/products/${productId}`, data);
  },

  // 작업지시 생성
  createWorkOrder: async (data) => {
    return await AxiosAPI.post("/api/workorder", data);
  },

  // 작업지시 목록 조회
  getList: async () => {
    return await AxiosAPI.get("/api/workorder");
  },

  getDetail: async (workOrderNo) => {
    return await AxiosAPI.get(`/api/workorder/${workOrderNo}`);
  },
};

export const BomAPI = {
  // 제품 코드로 BOM 목록 조회
  getList: async (productCode) => {
    return await AxiosAPI.get(`/api/bom/${productCode}`);
  },

  // BOM 신규 등록
  create: async (data) => {
    return await AxiosAPI.post("/api/bom", data);
  },

  // BOM 정보 수정
  update: async (bomId, data) => {
    return await AxiosAPI.put(`/api/bom/${bomId}`, data);
  },
};

// 공정 관리 API
export const ProcessAPI = {
  // 목록 조회
  getList: async () => {
    return await AxiosAPI.get("/api/master/processes");
  },

  // 등록
  create: async (data) => {
    return await AxiosAPI.post("/api/master/processes", data);
  },

  // 수정
  update: async (processId, data) => {
    return await AxiosAPI.put(`/api/master/processes/${processId}`, data);
  },
};

export default AxiosAPI;
