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

      map.set(r.machineCode, {
        value: r.machineCode,
        label: r.machineName,
      });
    });

    return [{ value: "ALL", label: "전체 설비" }, ...Array.from(map.values())];
  }, [rows]);

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
     LOT × 공정 × 설비 집계
  ========================= */
  const processRows = useMemo(() => {
    const map = {};

    rows.forEach((r) => {
      if (machineFilter !== "ALL" && r.machineCode !== machineFilter) return;

      const processKey = r.processCode ?? r.processName ?? "-";
      const key = `${r.lotNo}_${processKey}_${r.machineCode}`;
      const rawTime = r.occurredAt ?? r.createdAt;

      if (!map[key]) {
        map[key] = {
          lotNo: r.lotNo,
          processCode: r.processCode,
          processName: r.processName ?? r.processCode ?? "-",
          machineCode: r.machineCode,
          machineName: r.machineName ?? r.machineCode ?? "-",
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
     ✅ 정렬된 데이터 (추가)
  ========================= */
  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return processRows;

    const sorted = [...processRows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // 숫자 정렬
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      // 날짜 정렬 (Raw 기준)
      if (sortConfig.key === "occurredAtText") {
        const aTime = new Date(a.occurredAtRaw).getTime();
        const bTime = new Date(b.occurredAtRaw).getTime();
        return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime;
      }

      // 문자열 정렬
      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return sorted;
  }, [processRows, sortConfig]);

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
    { key: "occurredAtText", label: "최근 발생 시각", width: 180 },
  ];

  /* =========================
     정렬 핸들러
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
        data={sortedRows}
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
