import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../components/TableStyle";
import { AlertTriangle, PlayCircle, PauseCircle, Power } from "lucide-react";
import SummaryCard from "../components/SummaryCard";

/* =========================
   상태 카드 데이터
========================= */
const summaryData = [
  {
    label: "WAITING",
    value: 178,
    color: "#facc15",
    icon: <PauseCircle />,
  },
  {
    label: "RUN",
    value: 300,
    color: "#22c55e",
    icon: <PlayCircle />,
  },
  {
    label: "ERROR",
    value: 3,
    color: "#ef4444",
    icon: <AlertTriangle />,
  },
  {
    label: "STOP",
    value: 30,
    color: "#9ca3af",
    icon: <Power />,
  },
];

export default function Machine() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* =========================
     에러 로그
  ========================= */
  const errorLogs = [
    {
      code: "ERROR CODE - 101",
      message: "설비번호 asdf-1234 에서 IO 오류 발생",
    },
    {
      code: "ERROR CODE - 404",
      message: "설비번호 qwer-5678 에서 통신 오류 발생",
    },
  ];

  /* =========================
     테이블 컬럼
  ========================= */
  const columns = [
    { key: "machineId", label: "Machine ID", width: 90 },
    { key: "machineCode", label: "Machine Code", width: 140 },
    { key: "machineName", label: "Machine Name", width: 180 },
    { key: "processCode", label: "Process Code", width: 140 },
    { key: "status", label: "설비 상태", width: 120 },
    { key: "active", label: "사용 여부", width: 100 },
    { key: "errorLog", label: "ERROR Log", width: 220 },
  ];

  /* =========================
     테이블 데이터
  ========================= */
  const tableData = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, i) => ({
        id: i + 1,
        machineId: i + 1,
        machineCode: `MC-${100 + i}`,
        machineName: `설비 ${i + 1}`,
        processCode: `PROC-${(i % 5) + 1}`,
        status: i % 3 === 0 ? "RUN" : i % 3 === 1 ? "WAIT" : "ERROR",
        active: i % 4 === 0 ? "NO" : "YES",
        errorLog: i % 3 === 2 ? "센서 응답 없음" : "-",
      })),
    []
  );

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

  /* =========================
     정렬 데이터 (자연 정렬)
  ========================= */
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return tableData;

    return [...tableData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }

      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      return 0;
    });
  }, [tableData, sortConfig]);

  return (
    <Wrapper>
      <Header>
        <h2>설비관리</h2>
      </Header>

      {/* ===== 상태 요약 카드 ===== */}
      <SummaryGrid>
        {summaryData.map((item) => (
          <SummaryCard
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value}
            color={item.color}
          />
        ))}
      </SummaryGrid>

      {/* ===== 에러 로그 ===== */}
      <ErrorSection>
        {errorLogs.map((log, idx) => (
          <ErrorBox key={idx}>
            <strong>{log.code}</strong>
            <p>{log.message}</p>
          </ErrorBox>
        ))}
      </ErrorSection>

      {/* ===== 테이블 ===== */}
      <SectionTitle>실시간 설비 상태</SectionTitle>

      <Table
        columns={columns}
        data={sortedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
      />
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

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ErrorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ErrorBox = styled.div`
  background: #fee2e2;
  border-radius: 10px;
  padding: 12px 16px;

  strong {
    font-size: 13px;
    color: #b91c1c;
  }

  p {
    font-size: 12px;
    margin-top: 4px;
    color: #7f1d1d;
  }
`;

const SectionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
`;
