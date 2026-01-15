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
import Text from "./pages/Text";

function App() {
  return (
    <Router>
      <GlobalStyle />
      <ScrollToTop />

      <Routes>
        {/* 로그인 (레이아웃 없음) */}
        <Route path="/login" element={<Login />} />

        {/* MES 레이아웃 */}
        <Route path="/mes" element={<SideBar />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashBoard />} />
          <Route path="workorders" element={<WorkOrders />} />
          <Route path="lot" element={<Lot />} />
          <Route path="machine" element={<Machine />} />
          <Route path="process-log" element={<ProcessLog />} />
          <Route path="material" element={<Material />} />
          <Route path="inventory" element={<Inventory />} />
          {/* 품질/불량 */}
          <Route path="quality" element={<QualityDefectLog />} />
          <Route path="bom" element={<BOM />} />
          <Route path="text" element={<Text />} />
        </Route>

        {/* 루트 접근 시 MES로 */}
        <Route path="/" element={<Navigate to="/mes/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
