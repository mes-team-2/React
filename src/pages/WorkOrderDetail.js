import styled from "styled-components";
import { useMemo } from "react";
import Table from "../components/TableStyle";

export default function WorkOrderDetail({ workOrder }) {
  const lotData = useMemo(() => {
    if (!workOrder) return [];
    return [
      {
        id: 1,
        lotNo: "LOT-202601-001",
        qty: 500,
        status: "IN_PROCESS",
        createdAt: "2026-01-05 09:30",
      },
      {
        id: 2,
        lotNo: "LOT-202601-002",
        qty: 500,
        status: "IN_PROCESS",
        createdAt: "2026-01-05 13:00",
      },
    ];
  }, [workOrder]);

  const processData = useMemo(() => {
    if (!workOrder) return [];
    return [
      {
        id: 1,
        step: "조립",
        machine: "설비-A",
        status: "DONE",
        startedAt: "09:30",
        endedAt: "11:00",
      },
      {
        id: 2,
        step: "충전",
        machine: "설비-B",
        status: "IN_PROGRESS",
        startedAt: "11:10",
        endedAt: "-",
      },
    ];
  }, [workOrder]);

  const materialData = useMemo(() => {
    if (!workOrder) return [];
    return [
      {
        id: 1,
        material: "납판",
        qty: 1000,
        unit: "EA",
        time: "2026-01-05 09:20",
      },
      {
        id: 2,
        material: "전해액",
        qty: 1000,
        unit: "EA",
        time: "2026-01-05 09:25",
      },
    ];
  }, [workOrder]);

  /* =========================
     선택 안 됐을 때
  ========================= */
  if (!workOrder) {
    return <Empty>작업지시를 선택하세요.</Empty>;
  }

  /* =========================
     컬럼 정의
  ========================= */
  const lotColumns = [
    { key: "lotNo", label: "LOT No", width: 140 },
    { key: "qty", label: "LOT 수량", width: 100 },
    { key: "status", label: "상태", width: 120 },
    { key: "createdAt", label: "생성일", width: 160 },
  ];

  const processColumns = [
    { key: "step", label: "공정", width: 160 },
    { key: "machine", label: "설비", width: 160 },
    { key: "status", label: "상태", width: 120 },
    { key: "startedAt", label: "시작", width: 120 },
    { key: "endedAt", label: "종료", width: 120 },
  ];

  const materialColumns = [
    { key: "material", label: "자재명", width: 160 },
    { key: "qty", label: "수량", width: 100 },
    { key: "unit", label: "단위", width: 80 },
    { key: "time", label: "투입시각", width: 160 },
  ];

  return (
    <Wrapper>
      {/* ===== 헤더 ===== */}
      <Header>
        <div>
          <h3>작업지시 상세</h3>
          <span>{workOrder.workOrderNo}</span>
        </div>
        <StatusBadge>{workOrder.status}</StatusBadge>
      </Header>

      {/* ===== 요약 카드 ===== */}
      <SummaryGrid>
        <SummaryItem>
          <label>제품</label>
          <strong>{workOrder.productName}</strong>
        </SummaryItem>
        <SummaryItem>
          <label>계획 수량</label>
          <strong>{workOrder.plannedQty}</strong>
        </SummaryItem>
        <SummaryItem>
          <label>상태</label>
          <strong>{workOrder.status}</strong>
        </SummaryItem>
      </SummaryGrid>

      {/* ===== LOT ===== */}
      <Card>
        <SectionTitle>LOT 현황</SectionTitle>
        <Table columns={lotColumns} data={lotData} selectable={false} />
      </Card>

      {/* ===== 공정 ===== */}
      <Card>
        <SectionTitle>공정 진행</SectionTitle>
        <Table columns={processColumns} data={processData} selectable={false} />
      </Card>

      {/* ===== 자재 ===== */}
      <Card>
        <SectionTitle>자재 투입</SectionTitle>
        <Table
          columns={materialColumns}
          data={materialData}
          selectable={false}
        />
      </Card>
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
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  h3 {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }

  span {
    font-size: 12px;
    opacity: 0.6;
  }
`;

const StatusBadge = styled.div`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.15);
  color: var(--main);
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
`;

const SummaryItem = styled.div`
  background: white;
  border-radius: 14px;
  padding: 14px 16px;
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

const Card = styled.section`
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h4`
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 600;
`;

const Empty = styled.div`
  padding: 60px 20px;
  text-align: center;
  font-size: 14px;
  opacity: 0.6;
`;
