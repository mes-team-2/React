import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import DefectLogDetail from "./DefectLogDetail";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function QualityDefectLog() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* =========================
     불량 유형별 차트 데이터
  ========================= */
  const defectChartData = [
    { type: "전압 불량", qty: 45 },
    { type: "외관 불량", qty: 30 },
    { type: "누액", qty: 15 },
    { type: "단락", qty: 8 },
  ];

  /* =========================
     테이블 컬럼
  ========================= */
  const columns = [
    { key: "lotNo", label: "LOT No", width: 160 },
    { key: "workOrderNo", label: "작업지시", width: 160 },
    { key: "process", label: "공정", width: 140 },
    { key: "machine", label: "설비", width: 160 },
    { key: "defectType", label: "불량 유형", width: 160 },
    { key: "defectQty", label: "불량 수량", width: 120 },
    { key: "occurredAt", label: "발생 시각", width: 180 },
  ];

  /* =========================
     더미 데이터
  ========================= */
  const tableData = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i + 1,
        lotNo: `LOT-202601-${String(i + 1).padStart(3, "0")}`,
        workOrderNo: `WO-202601-${String(Math.floor(i / 2) + 1).padStart(
          3,
          "0"
        )}`,
        process: i % 3 === 0 ? "조립" : i % 3 === 1 ? "활성화" : "검사",
        machine: `설비-${(i % 4) + 1}`,
        defectType: i % 2 === 0 ? "전압 불량" : "외관 불량",
        defectQty: 1 + (i % 4),
        occurredAt: "2026-01-06 14:30",
      })),
    []
  );

  /* =========================
     정렬
  ========================= */
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return tableData;

    return [...tableData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }

      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [tableData, sortConfig]);

  /* =========================
     Row 클릭 → 상세 Drawer
  ========================= */
  const handleRowClick = (row) => {
    setSelectedLog(row);
    setOpen(true);
  };

  return (
    <Wrapper>
      <Header>
        <h2>불량 / 품질 로그</h2>
      </Header>

      {/* ===== 차트 ===== */}
      <Card>
        <CardTitle>불량 유형별 발생 현황</CardTitle>
        <ChartBox>
          <ResponsiveContainer>
            <BarChart data={defectChartData}>
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </Card>

      {/* ===== 테이블 ===== */}
      <Table
        columns={columns}
        data={sortedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onRowClick={handleRowClick}
      />

      <Hint>※ 행을 클릭하면 불량 상세 정보를 확인할 수 있습니다.</Hint>

      <SideDrawer open={open} onClose={() => setOpen(false)}>
        <DefectLogDetail log={selectedLog} />
      </SideDrawer>
    </Wrapper>
  );
}

/* =========================
   styled
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const Header = styled.div`
  h2 {
    font-size: 22px;
    font-weight: 700;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
`;

const CardTitle = styled.h4`
  font-size: 14px;
  margin-bottom: 12px;
`;

const ChartBox = styled.div`
  height: 260px;

  svg:focus,
  svg *:focus {
    outline: none;
  }
`;

const Hint = styled.div`
  font-size: 12px;
  opacity: 0.6;
`;
