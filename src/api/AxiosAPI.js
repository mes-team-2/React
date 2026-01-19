import axios from "axios";

const BASE_URL = "http://localhost:8111";

/* =========================
   axios 인스턴스
========================= */
const AxiosApi = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// 관리자용 헤더 설정 헬퍼 (백업본의 토큰 로직 반영)
const getAdminConfig = () => {
  const token = localStorage.getItem("accessToken");
  return { headers: { Authorization: `Bearer ${token}` } };
};

/* =========================
   Auth - 로그인 / 인증 유지
========================= */

AxiosApi.login = async (email, pwd) => {
  return await AxiosApi.post(
    "/api/members/login",
    { email, pwd },
    { withCredentials: true }
  );
};

AxiosApi.me = async () => {
  return await AxiosApi.get("/api/members/me");
};

AxiosApi.refresh = async () => {
  return await AxiosApi.get("/api/members/token/refresh", {
    withCredentials: true,
  });
};

AxiosApi.logout = async () => {
  return await AxiosApi.post("/api/members/logout", null, {
    withCredentials: true,
  });
};

/* =========================
   Email 인증 / 회원가입 / 비번찾기
========================= */

AxiosApi.sendEmailCode = async (email) => {
  return await AxiosApi.post("/api/email/send", { email });
};

AxiosApi.verifyEmailCode = async (code) => {
  const token = localStorage.getItem("signupToken");
  return await AxiosApi.post(
    "/api/email/verify",
    { code },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

AxiosApi.signup = async (email, pwd, name, nickname, code) => {
  const token = localStorage.getItem("signupToken");
  return await AxiosApi.post(
    "/api/members/signup",
    { email, pwd, name, nickname, code },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

AxiosApi.sendResetPwdCode = async (email) => {
  return await AxiosApi.post("/api/members/password-reset/request", { email });
};

AxiosApi.verifyResetPwdCode = async (email, code) => {
  return await AxiosApi.post("/api/members/password-reset/verify", {
    email,
    code,
    newPassword: "임시",
  });
};

AxiosApi.resetPassword = async (email, newPassword, code) => {
  return await AxiosApi.post("/api/members/password-reset/verify", {
    email,
    code,
    newPassword,
  });
};

AxiosApi.checkNickname = async (nickname) => {
  return await AxiosApi.get("/api/members/check-nickname", {
    params: { nickname },
  });
};

/* =========================
   Admin 관련 API (관리자용 토큰 필수)
========================= */

AxiosApi.getAllMembers = async () => {
  return await AxiosApi.get("/api/admin", getAdminConfig());
};

AxiosApi.getPendingAuctions = async () => {
  return await AxiosApi.get("/api/admin/pending", getAdminConfig());
};

AxiosApi.approveAuction = async (id, startTime) => {
  return await AxiosApi.post(
    "/api/admin/approve",
    { id, startTime },
    getAdminConfig()
  );
};

AxiosApi.suspendMember = async (id) => {
  return await AxiosApi.patch(
    `/api/admin/${id}/suspend`,
    null,
    getAdminConfig()
  );
};

AxiosApi.activateMember = async (id) => {
  return await AxiosApi.patch(
    `/api/admin/${id}/activate`,
    null,
    getAdminConfig()
  );
};

AxiosApi.deleteMember = async (id) => {
  return await AxiosApi.delete(`/api/admin/${id}`, getAdminConfig());
};

/* =========================
   회원 정보 / 리스트 조회
========================= */

AxiosApi.getUserInfo = async (id) => {
  return await AxiosApi.get(`/api/members/${id}`);
};

AxiosApi.chargeCredit = async (userId, amount) => {
  return await AxiosApi.post(`/api/members/${userId}/credit?coin=${amount}`);
};

AxiosApi.getWinList5 = async (userId) => {
  return await AxiosApi.get(`/api/auctions/${userId}/win5`);
};

AxiosApi.getSellList5 = async (userId) => {
  return await AxiosApi.get(`/api/auctions/${userId}/sell5`);
};

AxiosApi.getWinList = async (memberId) => {
  return await AxiosApi.get(`/api/auctions/${memberId}/winlist`);
};

AxiosApi.getSellList = async (memberId) => {
  return await AxiosApi.get(`/api/auctions/${memberId}/selllist`);
};

export default AxiosApi;

/* =========================
   경매 / 입찰 / 채팅 / 메시지 (Named Exports)
========================= */

AxiosApi.getAuction = async (auctionId) => {
  const res = await AxiosApi.get(`/api/auctions/${auctionId}`);
  return res;
};

export const createAuction = async (auctionFormData) => {
  const res = await AxiosApi.post(`/api/auctions`, auctionFormData);
  return res.status === 200 || res.status === 201;
};

AxiosApi.createBid = async (auctionId, bidCreateDto) => {
  const res = await AxiosApi.post(
    `/api/auctions/${auctionId}/bids`,
    bidCreateDto
  );
  return res.status === 200 || res.status === 201;
};

export const loadBidHistories = async (auctionId, page, size = 20) => {
  const res = await AxiosApi.get(`/api/bid-histories`, {
    params: { auctionId, page, size },
  });
  return res.data;
};

export const getMessages = async (chatId) => {
  const res = await AxiosApi.get(`/api/chats${chatId}/messages`);
  return res.data;
};

export const sendMessage = async (chatId, messageData) => {
  const res = await AxiosApi.post(`/api/chats${chatId}/messages`, messageData);
  return res.status === 200 || res.status === 201;
};

export const createMessage = async (messageData) => {
  const res = await AxiosApi.post(`/api/messages`, messageData);
  return res.data;
};

export const getReceivedMessages = async () => {
  const res = await AxiosApi.get(`/api/messages/received`);
  return res.data;
};

export const getMessage = async (messageId) => {
  const res = await AxiosApi.get(`/api/messages/${messageId}`);
  return res.data;
};

export const readMessage = async (messageId) => {
  const res = await AxiosApi.post(`/api/messages/${messageId}/read`, null);
  return res.data;
};

export const deleteMessage = async (messageId) => {
  const res = await AxiosApi.post(`/api/messages/${messageId}/delete`, null);
  return res.data;
};

//회원 정보 수정
AxiosApi.updateMember = async (id, nickname, pwd) => {
  const memberDto = {
    nickname: nickname,
    pwd: pwd,
  };
  return await AxiosApi.patch(`/api/members/${id}`, memberDto);
};

// 헤더 검색 인풋 창
AxiosApi.searchAuctions = async (keyword, page = 0) => {
  const res = await AxiosApi.get("/api/auctions/search", {
    params: { keyword, page, size: 12 },
  });
  return res.data;
};
