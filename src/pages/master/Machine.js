import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import { AlertTriangle, PlayCircle, PauseCircle, Power } from "lucide-react";
import SummaryCard from "../../components/SummaryCard";
import { MachineAPI } from "../../api/AxiosAPI"; // [New] API Import

export default function Machine() {
  const [machines, setMachines] = useState([]); // 실데이터
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // 1. 데이터 조회
  const fetchMachines = async () => {
    try {
      const res = await MachineAPI.getList();
      setMachines(res.data);
    } catch (err) {
      console.error("설비 목록 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchMachines();
    // 5초마다 갱신 (실시간 모니터링 효과)
    const interval = setInterval(fetchMachines, 5000);
    return () => clearInterval(interval);
  }, []);

  /* =========================
     상태 요약 (자동 계산)
  ========================= */
  const summaryData = useMemo(() => {
    const counts = { WAITING: 0, RUN: 0, ERROR: 0, STOP: 0 };

    machines.forEach((m) => {
      // 백엔드 Enum은 "WAIT", "RUN", "ERROR", "STOP"
      // 프론트 매핑 (WAIT -> WAITING 등 필요 시 변환)
      const status = m.status === "WAIT" ? "WAITING" : m.status;
      if (counts[status] !== undefined) counts[status]++;
      else if (status === "STOP") counts.STOP++; // 예외 처리
    });

    return [
      {
        label: "WAITING",
        value: counts.WAITING,
        color: "#facc15",
        icon: <PauseCircle />,
      },
      {
        label: "RUN",
        value: counts.RUN,
        color: "#22c55e",
        icon: <PlayCircle />,
      },
      {
        label: "ERROR",
        value: counts.ERROR,
        color: "#ef4444",
        icon: <AlertTriangle />,
      },
      {
        label: "STOP",
        value: counts.STOP,
        color: "#9ca3af",
        icon: <Power />,
      },
    ];
  }, [machines]);

  /* =========================
     에러 로그 (자동 추출)
  ========================= */
  const errorLogs = useMemo(() => {
    return machines
      .filter((m) => m.status === "ERROR")
      .map((m) => ({
        code: `ERROR - ${m.machineCode}`,
        message: `${m.machineName}에서 ${m.errorLog} 발생`,
      }));
  }, [machines]);

  /* =========================
     테이블 컬럼
  ========================= */
  const columns = [
    { key: "machineId", label: "ID", width: 60 },
    { key: "machineCode", label: "설비 코드", width: 120 },
    { key: "machineName", label: "설비명", width: 180 },
    { key: "processCode", label: "공정 코드", width: 120 },
    { key: "status", label: "상태", width: 100 },
    { key: "active", label: "사용", width: 80 },
    { key: "errorLog", label: "메시지", width: 220 },
  ];

  /* =========================
     정렬 데이터
  ========================= */
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return machines;

    return [...machines].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }
      return 0;
    });
  }, [machines, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <Wrapper>
      <Header>
        <h2>설비 모니터링</h2>
      </Header>

      {/* ===== 상태 요약 ===== */}
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

      {/* ===== 에러 로그 (있을 때만 표시) ===== */}
      {errorLogs.length > 0 && (
        <ErrorSection>
          {errorLogs.map((log, idx) => (
            <ErrorBox key={idx}>
              <strong>{log.code}</strong>
              <p>{log.message}</p>
            </ErrorBox>
          ))}
        </ErrorSection>
      )}

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
