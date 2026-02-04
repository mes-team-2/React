import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";

export default function QualityDefectLogDetail({ log }) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* =========================
     세부 테이블 데이터
  ========================= */
  const detailRows = useMemo(() => {
    return log.defects ?? [];
  }, [log]);
  if (!log) {
    return <Empty>불량 항목을 선택하세요.</Empty>;
  }

  const columns = [
    { key: "defectType", label: "불량 유형", width: 180 },
    { key: "defectQty", label: "불량 수량", width: 120 },
    {
      key: "occurredAtText",
      label: "발생 시각",
      width: 180,
    },
  ];

  return (
    <Wrapper>
      <Header>
        <div>
          <h3>불량 상세</h3>
          <span>{log.lotNo}</span>
        </div>
      </Header>

      <InfoGrid>
        <InfoItem>
          <label>공정</label>
          <strong>{log.defects[0]?.processCode ?? "-"}</strong>
        </InfoItem>
        <InfoItem>
          <label>설비</label>
          <strong>{log.defects[0]?.machineCode ?? "-"}</strong>
        </InfoItem>
        <InfoItem>
          <label>총 불량 수량</label>
          <strong>{log.totalDefectQty}</strong>
        </InfoItem>
      </InfoGrid>

      <Section>
        <SectionTitle>LOT 내 불량 이력</SectionTitle>
        <Table
          columns={columns}
          data={detailRows}
          sortConfig={sortConfig}
          onSort={(key) =>
            setSortConfig((prev) => ({
              key,
              direction:
                prev.key === key && prev.direction === "asc" ? "desc" : "asc",
            }))
          }
          selectable={false}
        />
      </Section>
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
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  h3 {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
  }

  span {
    font-size: 12px;
    opacity: 0.6;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
`;

const InfoItem = styled.div`
  background: white;
  border-radius: 12px;
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

const Section = styled.section``;

const SectionTitle = styled.h4`
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 600;
`;

const Empty = styled.div`
  padding: 40px 20px;
  text-align: center;
  opacity: 0.6;
`;
