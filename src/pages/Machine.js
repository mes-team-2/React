import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../components/TableStyle";
import { AlertTriangle, PlayCircle, PauseCircle, Power } from "lucide-react";

/* =========================
   상태 카드 데이터
========================= */
const summaryData = [
  { label: "WAITING", value: 178, color: "#facc15", icon: <PauseCircle /> },
  { label: "RUN", value: 300, color: "#22c55e", icon: <PlayCircle /> },
  { label: "ERROR", value: 3, color: "#ef4444", icon: <AlertTriangle /> },
  { label: "STOP", value: 30, color: "#9ca3af", icon: <Power /> },
];

export default function Machine() {
  const [selectedIds, setSelectedIds] = useState([]);

  /* =========================
     에러 로그 (상단)
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
        machineCode: "asdf-1234",
        machineName: "설비이름 12345678",
        processCode: "step-1313131",
        status: "RUN",
        active: "yes",
        errorLog: "아무거나 넣어보자 이자식!",
      })),
    []
  );

  return (
    <Wrapper>
      <Header>
        <h2>설비관리</h2>
      </Header>

      {/* ===== 상태 요약 카드 ===== */}
      <SummaryGrid>
        {summaryData.map((item) => (
          <SummaryCard key={item.label}>
            <IconBox color={item.color}>{item.icon}</IconBox>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          </SummaryCard>
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

      {/* ===== 실시간 설비 상태 ===== */}
      <SectionTitle>실시간 설비 상태</SectionTitle>

      <Table
        columns={columns}
        data={tableData}
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

const SummaryCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);

  span {
    font-size: 12px;
    opacity: 0.7;
  }

  strong {
    font-size: 20px;
    display: block;
    margin-top: 4px;
  }
`;

const IconBox = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${(props) => props.color}22;
  color: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
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
