import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../components/TableStyle";

export default function QualityDefectLogDetail({ log }) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* =========================
     LOT 내 불량 이력 데이터
  ========================= */
  const lotDefectHistory = useMemo(() => {
    if (!log) return [];
    return [
      {
        id: 1,
        defectType: "전압 불량",
        qty: 3,
        time: "2026-01-06 10:20",
      },
      {
        id: 2,
        defectType: "외관 불량",
        qty: 1,
        time: "2026-01-06 11:40",
      },
      {
        id: 3,
        defectType: "전압 불량",
        qty: 2,
        time: "2026-01-06 13:10",
      },
    ];
  }, [log]);

  /* =========================
     정렬 처리
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

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return lotDefectHistory;

    return [...lotDefectHistory].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }

      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [lotDefectHistory, sortConfig]);

  /* =========================
     컬럼 정의
  ========================= */
  const columns = [
    { key: "defectType", label: "불량 유형", width: 180 },
    { key: "qty", label: "불량 수량", width: 120 },
    { key: "time", label: "발생 시각", width: 180 },
  ];

  if (!log) {
    return <Empty>불량 항목을 선택하세요.</Empty>;
  }

  return (
    <Wrapper>
      {/* ===== 헤더 ===== */}
      <Header>
        <div>
          <h3>불량 상세</h3>
          <span>{log.lotNo}</span>
        </div>
        <Badge>{log.defectType}</Badge>
      </Header>

      {/* ===== 요약 정보 ===== */}
      <InfoGrid>
        <InfoItem>
          <label>작업지시</label>
          <strong>{log.workOrderNo}</strong>
        </InfoItem>
        <InfoItem>
          <label>공정</label>
          <strong>{log.process}</strong>
        </InfoItem>
        <InfoItem>
          <label>설비</label>
          <strong>{log.machine}</strong>
        </InfoItem>
        <InfoItem>
          <label>불량 수량</label>
          <strong>{log.defectQty}</strong>
        </InfoItem>
      </InfoGrid>

      {/* ===== LOT 내 불량 이력 ===== */}
      <Section>
        <SectionTitle>LOT 내 불량 이력</SectionTitle>
        <Table
          columns={columns}
          data={sortedData}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable={false}
        />
      </Section>
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
    font-size: 18px;
    font-weight: 700;
    margin: 0;
  }

  span {
    font-size: 12px;
    opacity: 0.6;
  }
`;

const Badge = styled.div`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
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
