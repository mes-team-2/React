import styled from "styled-components";
import { useMemo } from "react";
import Table from "../../components/TableStyle";
import SummaryCard from "../../components/SummaryCard";
import { FiHash, FiPackage, FiActivity, FiCalendar } from "react-icons/fi";

export default function WorkOrderDetail({ workOrder }) {
  /* =========================
     단일 LOT 데이터
  ========================= */
  const productLot = useMemo(() => {
    if (!workOrder) return null;

    return {
      lotNo: "LOT-202601-001",
      qty: workOrder.plannedQty,
      status: "IN_PROCESS",
      createdAt: "2026-01-05 09:30",
    };
  }, [workOrder]);

  const processData = useMemo(() => {
    if (!workOrder) return [];
    return [
      {
        id: 1,
        step: "극판 적층",
        machine: "설비-02",
        status: "DONE",
        startedAt: "09:30",
        endedAt: "10:40",
      },
      {
        id: 2,
        step: "COS 용접",
        machine: "설비-05",
        status: "IN_PROGRESS",
        startedAt: "10:50",
        endedAt: "-",
      },
      {
        id: 3,
        step: "화성",
        machine: "설비-09",
        status: "WAIT",
        startedAt: "-",
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
        material: "분리막",
        qty: 350,
        unit: "M",
        time: "2026-01-05 09:22",
      },
      {
        id: 3,
        material: "전해액",
        qty: 120,
        unit: "L",
        time: "2026-01-05 11:10",
      },
    ];
  }, [workOrder]);

  if (!workOrder) {
    return <Empty>작업지시를 선택하세요.</Empty>;
  }

  const processColumns = [
    { key: "step", label: "공정", width: 160 },
    { key: "machine", label: "설비", width: 140 },
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

      {/* ===== 작업지시 요약 ===== */}
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
          <label>작업 상태</label>
          <strong>{workOrder.status}</strong>
        </SummaryItem>
      </SummaryGrid>

      {/* ===== LOT 현황 (2 x 2 배치) ===== */}
      <Card>
        <SectionTitle>LOT 현황</SectionTitle>

        <LotGrid>
          <SummaryCard
            icon={<FiHash />}
            label="LOT 번호"
            value={productLot.lotNo}
            color="var(--main)"
          />
          <SummaryCard
            icon={<FiPackage />}
            label="LOT 수량"
            value={productLot.qty}
            color="var(--run)"
          />
          <SummaryCard
            icon={<FiActivity />}
            label="LOT 상태"
            value={productLot.status}
            color="var(--waiting)"
          />
          <SummaryCard
            icon={<FiCalendar />}
            label="생성일"
            value={productLot.createdAt}
            color="var(--font2)"
          />
        </LotGrid>
      </Card>

      {/* ===== 공정 진행 ===== */}
      <Card>
        <SectionTitle>공정 진행</SectionTitle>
        <Table columns={processColumns} data={processData} selectable={false} />
      </Card>

      {/* ===== 자재 투입 ===== */}
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
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
`;

/* ⭐ 여기만 핵심 변경 */
const LotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
`;

const Empty = styled.div`
  padding: 60px 20px;
  text-align: center;
  font-size: 14px;
  opacity: 0.6;
`;
