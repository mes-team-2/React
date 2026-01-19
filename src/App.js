import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import GlobalStyle from "./components/GlobalStyle";

import Login from "./pages/Login";
import DashBoard from "./pages/DashBoard";
import SideBar from "./components/SideBar";

import WorkOrders from "./pages/WorkOrder";
import Lot from "./pages/Lot";
import BOM from "./pages/BOM";
import QualityDefectLog from "./pages/QualityDefectLog";
import Inventory from "./pages/Inventory";
import Machine from "./pages/Machine";
import Material from "./pages/Material";
import ProcessLog from "./pages/ProcessLog";

/* 아직 안 만든 페이지는 임시 */
const Empty = ({ title }) => <div>{title}</div>;

function App() {
  return (
    <Router>
      <GlobalStyle />
      <ScrollToTop />

      <Routes>
        {/* 로그인 */}
        <Route path="/login" element={<Login />} />

        {/* MES 레이아웃 */}
        <Route path="/mes" element={<SideBar />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashBoard />} />

          {/* ================= 기준정보 (Master) ================= */}
          <Route path="master">
            <Route path="member" element={<Empty title="작업자 관리" />} />
            <Route path="product" element={<Empty title="제품 관리" />} />
            <Route path="process" element={<Empty title="공정 관리" />} />
            <Route path="machine" element={<Machine />} />
            <Route path="bom" element={<BOM />} />
          </Route>

          {/* ================= 생산 관리 ================= */}
          <Route path="workorders" element={<WorkOrders />} />
          <Route path="lot" element={<Lot />} />
          <Route path="shipment" element={<Empty title="출하 관리" />} />

          {/* ================= 품질 관리 ================= */}
          <Route path="quality">
            <Route path="test" element={<Empty title="검사 이력" />} />
            <Route path="defect" element={<QualityDefectLog />} />
          </Route>

          {/* ================= 자재 / 재고 ================= */}
          <Route path="material" element={<Material />} />
          <Route path="material-tx" element={<Empty title="자재 이력" />} />
          <Route path="inventory" element={<Inventory />} />

          {/* ================= 리포트 ================= */}
          <Route path="report">
            <Route path="production" element={<Empty title="생산 리포트" />} />
            <Route path="trace" element={<Empty title="Traceability 조회" />} />
          </Route>

          {/* ================= 공정 로그 ================= */}
          <Route path="process-log" element={<ProcessLog />} />
        </Route>

        {/* 루트 접근 */}
        <Route path="/" element={<Navigate to="/mes/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
