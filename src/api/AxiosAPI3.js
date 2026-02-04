import axios from "axios";

const BASE_URL = "http://localhost:8088";

const DefectLogAPI = {
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

export default DefectLogAPI;
