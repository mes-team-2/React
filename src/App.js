import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import Login from "./pages/Login";
import DashBoard from "./pages/DashBoard";
import SideBar from "./components/SideBar";
import WorkOrders from "./pages/WorkOrders";
import LOT from "./pages/LOT";

function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* 로그인 (레이아웃 없음) */}
        <Route path="/login" element={<Login />} />

        {/* MES 레이아웃 */}
        <Route path="/mes" element={<SideBar />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashBoard />} />

          {/* 아래는 나중에 추가 */}
          <Route path="workorders" element={<WorkOrders />} />
          <Route path="lot" element={<LOT />} />
        </Route>

        {/* 루트 접근 시 MES로 */}
        <Route path="/" element={<Navigate to="/mes/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
