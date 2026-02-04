import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import DefectLogDetail from "./DefectLogDetail";

export default function QualityDefectLog() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const formatDateTime = (value) => {
    if (!value) return "-";

    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  /* =========================
     LOT 기준 그룹핑
  ========================= */
  const lotGroupedRows = useMemo(() => {
    const map = {};

    rows.forEach((r) => {
      const key = r.lotNo;
      const rawTime = r.occurredAt ?? r.createdAt;

      if (!map[key]) {
        map[key] = {
          lotNo: r.lotNo,
          totalDefectQty: 0,
          occurredAtRaw: rawTime,
          occurredAtText: formatDateTime(rawTime),
          defects: [],
        };
      }

      map[key].totalDefectQty += r.defectQty;

      map[key].defects.push({
        defectType: r.defectType,
        defectQty: r.defectQty,
        processCode: r.processCode,
        machineCode: r.machineCode,
        occurredAtRaw: rawTime,
        occurredAtText: formatDateTime(rawTime),
      });

      if (
        rawTime &&
        (!map[key].occurredAtRaw || rawTime > map[key].occurredAtRaw)
      ) {
        map[key].occurredAtRaw = rawTime;
        map[key].occurredAtText = formatDateTime(rawTime);
      }
    });

    return Object.values(map);
  }, [rows]);

  /* =========================
     서버 데이터 조회
  ========================= */
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const res = await axios.get("http://localhost:8088/api/defect-logs", {
          params: { date: today },
          withCredentials: true,
        });
        setRows(res.data);
      } catch (e) {
        console.error("불량 로그 조회 실패", e);
      }
    };

    fetchLogs();
  }, []);

  /* =========================
     테이블 컬럼 (LOT 요약)
  ========================= */
  const columns = [
    { key: "lotNo", label: "LOT No", width: 160 },
    { key: "totalDefectQty", label: "총 불량 수량", width: 120 },
    {
      key: "occurredAtText",
      label: "최근 발생 시각",
      width: 180,
    },
  ];

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

      <Table
        columns={columns}
        data={lotGroupedRows}
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
   styled (변경 없음)
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

const Hint = styled.div`
  font-size: 12px;
  opacity: 0.6;
`;
