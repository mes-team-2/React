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
import MaterialLot from "./pages/production/MaterialLot";
import Bom from "./pages/master/BOM";
import DefectLog from "./pages/quality/DefectLog";
import Inventory from "./pages/inventory/Inventory";
import Machine from "./pages/master/Machine";
import Material from "./pages/master/Material";
import ProcessLog from "./pages/production/ProcessLog";
import Product from "./pages/master/Product";
import Traceability from "./pages/report/Traceability";
import ProductionReport from "./pages/report/ProductionReport";
import Test from "./pages/Test";
import Worker from "./pages/master/Worker";
import Process from "./pages/master/Process";
import Barcode from "./pages/production/Barcode";
import { AuthProvider } from "./context/AuthContext";
import TestLog from "./pages/quality/TestLog";
import MaterialLog from "./pages/master/MaterialLog";
import Shipment from "./pages/production/Shipment";

/* 아직 안 만든 페이지는 임시 */
const Empty = ({ title }) => <div>{title}</div>;

function App() {
  return (
    <Router>
      <GlobalStyle />
      <AuthProvider>

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
            <Route path="product" element={<Product />} />
            <Route path="inventory" element={<Inventory />} />

            {/* ================= 리포트 ================= */}
            <Route path="report">
              <Route path="product-report" element={<ProductionReport />} />
              <Route path="trace" element={<Traceability />} />
            </Route>

            {/* ================= 공정 로그 ================= */}
            <Route path="process-log" element={<ProcessLog />} />

            {/* 하린이의 TEST 링크 */}
            <Route path="test" element={<Test />} />
          </Route>

          {/* 루트 접근 */}
          <Route path="/" element={<Navigate to="/mes/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
