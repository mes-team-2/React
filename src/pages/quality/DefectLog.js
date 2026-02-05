import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import DefectLogDetail from "./DefectLogDetail";
import SelectBar from "../../components/SelectBar";
import SearchBar from "../../components/SearchBar";
import SearchDate from "../../components/SearchDate";
import Pagination from "../../components/Pagination";

export default function DefectLog() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [machineFilter, setMachineFilter] = useState("ALL"); // 설비 필터
  const [processFilter, setProcessFilter] = useState("ALL"); // 공정 필터
  const [keyword, setKeyword] = useState(""); // 검색어 (LOT 번호)
  const [date, setDate] = useState(new Date()); // 날짜

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const getLocalDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes(),
    ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  };

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

  // 공정 옵션
  const processOptions = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      if (!r.processCode || !r.processName) return;
      map.set(r.processCode, {
        value: r.processCode,
        label: r.processName,
      });
    });
    return [{ value: "ALL", label: "전체 공정" }, ...Array.from(map.values())];
  }, [rows]);

  const processRows = useMemo(() => {
    const map = {};

    rows.forEach((r) => {
      if (machineFilter !== "ALL" && r.machineCode !== machineFilter) return;
      if (keyword && !r.lotNo?.includes(keyword)) return;

      const rawTime = r.occurredAt ?? r.createdAt;

      if (date) {
        if (getLocalDate(rawTime) !== getLocalDate(date)) return;
      }

      const key = `${r.lotNo}_${r.processCode}_${r.machineCode}`;

      if (!map[key]) {
        map[key] = {
          lotNo: r.lotNo,
          processCode: r.processCode,
          processName: r.processName ?? r.processCode ?? "-",
          machineName: r.machineName ?? r.machineCode ?? "-",
          machineCode: r.machineCode,
          defectQty: 0,
          occurredAtRaw: rawTime,
          occurredAtText: formatDateTime(rawTime),
          defects: [],
        };
      }

      map[key].defectQty += Number(r.defectQty ?? 0);

      if (rawTime > map[key].occurredAtRaw) {
        map[key].occurredAtRaw = rawTime;
        map[key].occurredAtText = formatDateTime(rawTime);
      }

      map[key].defects.push({
        defectType: r.defectType,
        defectQty: r.defectQty,
        occurredAtRaw: rawTime,
        occurredAtText: formatDateTime(rawTime),
      });
    });

    return Object.values(map);
  }, [rows, machineFilter, keyword, date]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return processRows;

    return [...processRows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (sortConfig.key === "occurredAtText") {
        return sortConfig.direction === "asc"
          ? new Date(a.occurredAtRaw) - new Date(b.occurredAtRaw)
          : new Date(b.occurredAtRaw) - new Date(a.occurredAtRaw);
      }

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [processRows, sortConfig]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedRows.slice(start, start + PAGE_SIZE);
  }, [sortedRows, page]);

  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);

  useEffect(() => {
    const fetchLogs = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const res = await axios.get("http://localhost:8088/api/defect-logs", {
        params: { date: today },
        withCredentials: true,
      });
      setRows(res.data);
    };
    fetchLogs();
  }, []);

  const columns = [
    { key: "lotNo", label: "LOT 번호", width: 180 },
    { key: "processName", label: "공정명", width: 180 },
    { key: "machineName", label: "설비명", width: 180 },
    { key: "defectQty", label: "불량", width: 100 },
    { key: "occurredAtText", label: "최근 발생 시각", width: 180 },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>불량 이력 조회</h2>
      </Header>

      <ControlRow>
        <SearchDate
          onChange={(d) => {
            setDate(d);
            setPage(1);
          }}
        />
        <SelectBar
          width="m"
          value={machineFilter}
          options={machineOptions}
          onChange={(val) => {
            const next =
              typeof val === "string"
                ? val
                : (val?.target?.value ?? val?.value ?? "ALL");

            setMachineFilter(next);
            setPage(1);
          }}
        />
        <SearchBar
          width="l"
          placeholder="LOT 번호 검색"
          onSearch={(v) => {
            setKeyword(v);
            setPage(1);
          }}
        />
      </ControlRow>

      <Table
        columns={columns}
        data={pagedRows}
        sortConfig={sortConfig}
        onSort={(key) => {
          setSortConfig((prev) => ({
            key,
            direction:
              prev.key === key && prev.direction === "asc" ? "desc" : "asc",
          }));
          setPage(1);
        }}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onRowClick={(row) => {
          setSelectedLog(row);
          setOpen(true);
        }}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <SideDrawer open={open} onClose={() => setOpen(false)}>
        <DefectLogDetail log={selectedLog} />
      </SideDrawer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
`;

const Header = styled.div`
  h2 {
    font-size: var(--fontXl);
    font-weight: var(--bold);
    color: var(--font);
  }
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
