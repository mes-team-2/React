import axios from "axios";

const BASE_URL = "http://localhost:8088";

export const DefectLogAPI = {
  /**
   * 불량 로그 테이블 조회
   * @param {string} date yyyy-MM-dd
   */
  getList: (date) =>
    axios.get(`${BASE_URL}/api/defect-logs`, {
      params: { date },
      withCredentials: true, // 네 프로젝트에서 쓰고 있으면 유지
    }),
};

export const ShipmentAPI = {
  /**
   * 출하 / 입고 이력 조회
   * @param {Object} params { start, end }
   */
  getList: (params) =>
    axios.get(`${BASE_URL}/api/shipments`, {
      params,
      withCredentials: true,
    }),

  /**
   * 출하 등록
   */
  create: (data) =>
    axios.post(`${BASE_URL}/api/shipments`, data, {
      withCredentials: true,
    }),
};
