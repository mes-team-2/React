import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import GlobalStyle from "./components/GlobalStyle";

import Login from "./pages/Login";
import DashBoard from "./pages/dashboard/DashBoard";
import SideBar from "./components/SideBar";

import WorkOrders from "./pages/production/WorkOrder";
import Lot from "./pages/production/Lot";
import Bom from "./pages/master/BOM";
import DefectLog from "./pages/quality/DefectLog";
import Inventory from "./pages/inventory/Inventory";
import Machine from "./pages/master/Machine";
import Material from "./pages/master/Material";
import ProcessLog from "./pages/production/ProcessLog";
import Product from "./pages/master/Product";
import Trace from "./pages/report/Trace";
import ProductReport from "./pages/report/ProductReport";
import Test from "./pages/Test";
import Worker from "./pages/master/Worker";
import Process from "./pages/master/Process";
import Barcode from "./pages/production/Barcode";

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
            <Route path="product" element={<Product />} />
            <Route path="process" element={<Process />} />
            <Route path="worker" element={<Worker />} />
            <Route path="machine" element={<Machine />} />
            <Route path="bom" element={<Bom />} />
          </Route>

          {/* ================= 생산 관리 ================= */}
          <Route path="workorders" element={<WorkOrders />} />
          <Route path="lot" element={<Lot />} />
          <Route path="shipment" element={<Empty title="출하 관리" />} />
          <Route path="barcode" element={<Barcode />} />

          {/* ================= 품질 관리 ================= */}
          <Route path="quality">
            <Route path="test" element={<Empty title="검사 이력" />} />
            <Route path="defect" element={<DefectLog />} />
          </Route>

          {/* ================= 자재 / 재고 ================= */}
          <Route path="material" element={<Material />} />
          <Route path="material-tx" element={<Empty title="자재 이력" />} />
          <Route path="product" element={<Product />} />
          <Route path="inventory" element={<Inventory />} />

          {/* ================= 리포트 ================= */}
          <Route path="report">
            <Route path="product-report" element={<ProductReport />} />
            <Route path="trace" element={<Trace />} />
          </Route>

          {/* ================= 공정 로그 ================= */}
          <Route path="process-log" element={<ProcessLog />} />

          {/* 하린이의 TEST 링크 */}
          <Route path="test" element={<Test />} />
        </Route>

        {/* 루트 접근 */}
        <Route path="/" element={<Navigate to="/mes/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
