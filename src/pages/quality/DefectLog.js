import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import DefectLogDetail from "./DefectLogDetail";
import SelectBar from "../../components/SelectBar";

export default function QualityDefectLog() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [machineFilter, setMachineFilter] = useState("ALL");

  const machineOptions = useMemo(() => {
    const map = new Map();

    rows.forEach((r) => {
      if (!r.machineCode || !r.machineName) return;

      // code 기준으로 중복 제거
      map.set(r.machineCode, {
        value: r.machineCode,
        label: r.machineName,
      });
    });

    return [{ value: "ALL", label: "전체 설비" }, ...Array.from(map.values())];
  }, [rows]);

  // ✅ [수정] useMemo보다 위에 둬야 함 (Cannot access before initialization 방지)
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

  // ✅ [수정] 공정명/설비명 못 받을 때 fallback
  const pickProcessName = (r) => r.processName ?? r.processCode ?? "-";
  const pickMachineName = (r) => r.machineName ?? r.machineCode ?? "-";

  // ✅ LOT × 공정 단위 로그 (메인 테이블)
  const processRows = useMemo(() => {
    const map = {};

    rows.forEach((r) => {
      // 🔥 설비 필터
      if (machineFilter !== "ALL" && r.machineCode !== machineFilter) {
        return;
      }

      const processKey = r.processCode ?? r.processName ?? "-";
      const key = `${r.lotNo}_${processKey}_${r.machineCode}`;
      const rawTime = r.occurredAt ?? r.createdAt;

      if (!map[key]) {
        map[key] = {
          lotNo: r.lotNo,
          processCode: r.processCode,
          processName: r.processName ?? r.processCode ?? "-",
          machineCode: r.machineCode,
          machineName: r.machineName,
          defectQty: 0,
          occurredAtRaw: rawTime,
          occurredAtText: formatDateTime(rawTime),
          defects: [],
        };
      }

      map[key].defectQty += Number(r.defectQty ?? 0);

      map[key].defects.push({
        defectType: r.defectType,
        defectQty: Number(r.defectQty ?? 0),
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
  }, [rows, machineFilter]);

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
     테이블 컬럼
  ========================= */
  const columns = [
    { key: "lotNo", label: "LOT 번호", width: 180 },
    { key: "processName", label: "공정명", width: 180 },
    { key: "machineName", label: "설비명", width: 180 },
    { key: "defectQty", label: "불량", width: 100 },
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
      <SelectBar
        width="260px"
        type="single"
        value={machineFilter}
        options={machineOptions}
        onChange={(val) => {
          const next = typeof val === "string" ? val : val?.target?.value;
          setMachineFilter(next);
        }}
      />

      <Table
        columns={columns}
        data={processRows}
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
