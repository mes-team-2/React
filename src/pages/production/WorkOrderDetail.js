import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SummaryCard from "../../components/SummaryCard";
import { FiHash, FiPackage, FiActivity, FiCalendar } from "react-icons/fi";
import { WorkOrderAPI } from "../../api/AxiosAPI";

export default function WorkOrderDetail({ workOrder }) {
  // 백엔드에서 받아온 상세 데이터 상태
  const [detailData, setDetailData] = useState(null);

  // workOrder(부모에서 넘겨준 요약정보)가 바뀔 때마다 상세 조회 API 호출
  useEffect(() => {
    const fetchDetail = async () => {
      if (!workOrder?.id) return;
      try {
        // workOrder.id는 "WO-2026..." 형식의 번호라고 가정
        const res = await WorkOrderAPI.getDetail(workOrder.id);
        setDetailData(res.data);
      } catch (err) {
        console.error("상세 조회 실패", err);
      }
    };
    fetchDetail();
  }, [workOrder]);

  if (!workOrder) {
    return <Empty>작업지시를 선택하세요.</Empty>;
  }

  // 데이터가 로딩 중이거나 없을 때 보여줄 기본값 (또는 로딩 스피너)
  // 여기서는 기존 workOrder 정보라도 먼저 보여주도록 처리

  const lotInfo = detailData?.lotInfo || {
    lotNo: "-",
    qty: 0,
    status: "-",
    createdAt: "-",
  };

  const processData = detailData?.processList || [];
  const materialData = detailData?.materialList || [];

  const processColumns = [
    { key: "stepName", label: "공정", width: 160 }, // key 수정 (step -> stepName)
    { key: "machineName", label: "설비", width: 140 }, // key 수정 (machine -> machineName)
    { key: "status", label: "상태", width: 120 },
    { key: "startedAt", label: "시작", width: 120 },
    { key: "endedAt", label: "종료", width: 120 },
  ];

  const materialColumns = [
    { key: "materialName", label: "자재명", width: 160 }, // key 수정
    { key: "qty", label: "수량", width: 100 },
    { key: "unit", label: "단위", width: 80 },
    { key: "time", label: "투입시각", width: 160 },
  ];

  return (
    <Wrapper>
      {/* ===== 헤더 (기존 workOrder prop 사용) ===== */}
      <Header>
        <div>
          <h3>작업지시 상세</h3>
          <span>{workOrder.id}</span>
        </div>
        <StatusBadge>{workOrder.status}</StatusBadge>
      </Header>

      {/* ===== 요약 (기존 workOrder prop 사용) ===== */}
      <SummaryGrid>
        <SummaryItem>
          <label>제품</label>
          <strong>{workOrder.product}</strong>
        </SummaryItem>
        <SummaryItem>
          <label>계획 수량</label>
          <strong>{workOrder.planQty}</strong>
        </SummaryItem>
        <SummaryItem>
          <label>작업 상태</label>
          <strong>{workOrder.status}</strong>
        </SummaryItem>
      </SummaryGrid>

      {/* ===== LOT 현황 (API 데이터 바인딩) ===== */}
      <Card>
        <SectionTitle>LOT 현황</SectionTitle>
        <LotGrid>
          <SummaryCard
            icon={<FiHash />}
            label="LOT 번호"
            value={lotInfo.lotNo}
            color="var(--main)"
          />
          <SummaryCard
            icon={<FiPackage />}
            label="LOT 수량"
            value={lotInfo.qty}
            color="var(--run)"
          />
          <SummaryCard
            icon={<FiActivity />}
            label="LOT 상태"
            value={lotInfo.status}
            color="var(--waiting)"
          />
          <SummaryCard
            icon={<FiCalendar />}
            label="생성일"
            value={lotInfo.createdAt}
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
