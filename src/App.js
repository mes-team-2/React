import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import GlobalStyle from "./components/GlobalStyle";
import SideBar from "./components/SideBar";
import AuthGuard from "./context/AuthGuard";

import Login from "./pages/Login";
import DashBoard from "./pages/dashboard/DashBoard";

import WorkOrders from "./pages/production/WorkOrder";
import Lot from "./pages/production/Lot";
import MaterialLot from "./pages/production/MaterialLot";
import Shipment from "./pages/production/Shipment";
import Barcode from "./pages/production/Barcode";

import Bom from "./pages/master/BOM";
import Machine from "./pages/master/Machine";
import Material from "./pages/master/Material";
import Product from "./pages/master/Product";
import Worker from "./pages/master/Worker";
import Process from "./pages/master/Process";

import TestLog from "./pages/quality/TestLog";
import DefectLog from "./pages/quality/DefectLog";

import Inventory from "./pages/inventory/Inventory";
import MaterialLog from "./pages/master/MaterialLog";

import Traceability from "./pages/report/Traceability";
import ProductionReport from "./pages/report/ProductionReport";

import ProcessLog from "./pages/production/ProcessLog";
import Test from "./pages/Test";

import { AuthProvider } from "./context/AuthContext";

/* 아직 안 만든 페이지는 임시 */
const Empty = ({ title }) => <div>{title}</div>;

function App() {
  return (
    <Router>
      <GlobalStyle />
      <AuthProvider>
        <ScrollToTop />

        <Routes>
          {/* ================= 로그인 (유일한 공개 페이지) ================= */}
          <Route path="/login" element={<Login />} />

          {/* ================= 인증 보호 영역 ================= */}
          <Route element={<AuthGuard />}>
            {/* 루트 접근 시 */}
            <Route
              path="/"
              element={<Navigate to="/mes/dashboard" replace />}
            />

            {/* ================= MES 레이아웃 ================= */}
            <Route path="/mes" element={<SideBar />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashBoard />} />

              {/* ================= 기준정보 (Master) ================= */}
              <Route path="master">
                <Route path="process" element={<Process />} />
                <Route path="worker" element={<Worker />} />
                <Route path="machine" element={<Machine />} />
                <Route path="bom" element={<Bom />} />
                <Route path="material" element={<Material />} />
                <Route path="product" element={<Product />} />
              </Route>

              {/* ================= 생산 관리 ================= */}
              <Route path="workorders" element={<WorkOrders />} />
              <Route path="material-lot" element={<MaterialLot />} />
              <Route path="lot" element={<Lot />} />
              <Route path="shipment" element={<Shipment />} />
              <Route path="barcode" element={<Barcode />} />

              {/* ================= 품질 관리 ================= */}
              <Route path="quality">
                <Route path="test-log" element={<TestLog />} />
                <Route path="defect" element={<DefectLog />} />
              </Route>

              {/* ================= 자재 / 재고 ================= */}
              <Route path="material" element={<Material />} />
              <Route path="material-tx" element={<MaterialLog />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="product" element={<Product />} />

              {/* ================= 리포트 ================= */}
              <Route path="report">
                <Route path="product-report" element={<ProductionReport />} />
                <Route path="trace" element={<Traceability />} />
              </Route>

              {/* ================= 공정 로그 ================= */}
              <Route path="process-log" element={<ProcessLog />} />

              {/* 테스트 */}
              <Route path="test" element={<Test />} />
            </Route>
          </Route>

          {/* ================= 나머지 모든 경로 ================= */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
