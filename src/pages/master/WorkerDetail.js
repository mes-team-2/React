import styled from "styled-components";
import Table from "../../components/TableStyle";

export default function WorkerDetail({ worker, onClose }) {
  if (!worker) return null;

  /* =========================
     최근 작업 이력 (더미)
  ========================= */
  const workHistoryColumns = [
    { key: "process", label: "공정", width: 160 },
    { key: "startTime", label: "시작 시각", width: 160 },
    { key: "endTime", label: "종료 시각", width: 160 },
    { key: "defect", label: "불량 여부", width: 120 },
  ];

  const workHistoryData = [
    {
      id: 1,
      process: "극판 적층",
      startTime: "2026/01/10 09:00",
      endTime: "2026/01/10 11:30",
      defect: "없음",
    },
    {
      id: 2,
      process: "COS 용접",
      startTime: "2026/01/10 13:00",
      endTime: "2026/01/10 15:20",
      defect: "전압 미달",
    },
    {
      id: 3,
      process: "화성",
      startTime: "2026/01/11 08:40",
      endTime: "2026/01/11 12:10",
      defect: "없음",
    },
  ];

  return (
    <Wrapper>
      {/* ===== Header ===== */}
      <Header>
        <h3>작업자 상세</h3>
      </Header>

      {/* ===== 기본 정보 ===== */}
      <InfoGrid>
        <InfoItem>
          <label>작업자 번호</label>
          <strong>{worker.workerNo}</strong>
        </InfoItem>
        <InfoItem>
          <label>이름</label>
          <strong>{worker.name}</strong>
        </InfoItem>

        <InfoItem>
          <label>직급</label>
          <strong>{worker.position}</strong>
        </InfoItem>
        <InfoItem>
          <label>근무 여부</label>
          <StatusBadge status={worker.status}>{worker.status}</StatusBadge>
        </InfoItem>
        <InfoItem>
          <label>입사일</label>
          <strong>{worker.joinedAt}</strong>
        </InfoItem>
      </InfoGrid>

      {/* ===== 최근 작업 이력 ===== */}
      <Section>
        <SectionTitle>최근 작업 이력</SectionTitle>
        <Table
          columns={workHistoryColumns}
          data={workHistoryData}
          selectable={false}
        />
      </Section>

      {/* ===== 버튼 ===== */}
      <ButtonArea>
        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ButtonArea>
    </Wrapper>
  );
}

/* =========================
   styled-components
========================= */

const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
`;

const Header = styled.div`
  h3 {
    font-size: 18px;
    font-weight: 700;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const InfoItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);

  label {
    font-size: 11px;
    opacity: 0.6;
  }

  strong {
    display: block;
    margin-top: 6px;
    font-size: 14px;
  }
`;

const StatusBadge = styled.div`
  margin-top: 6px;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;

  background: ${({ status }) =>
    status === "근무중"
      ? "#e0f2fe"
      : status === "휴식"
        ? "#fff7ed"
        : "#fee2e2"};

  color: ${({ status }) =>
    status === "근무중"
      ? "#0284c7"
      : status === "휴식"
        ? "#c2410c"
        : "#dc2626"};
`;

const Section = styled.div``;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ButtonArea = styled.div`
  margin-top: auto;
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 20px;
  background: #f1f1f1;
  font-size: 14px;
`;
