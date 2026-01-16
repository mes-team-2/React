import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../components/TableStyle";

export default function LotDetail({ lot }) {
  /* =========================
     정렬 상태
  ========================= */
  const [processSort, setProcessSort] = useState({
    key: null,
    direction: "asc",
  });
  const [qualitySort, setQualitySort] = useState({
    key: null,
    direction: "asc",
  });

  /* =========================
     데이터
  ========================= */
  const processLogs = useMemo(() => {
    if (!lot) return [];
    return [
      {
        id: 1,
        step: "조립",
        machine: "설비-2",
        status: "DONE",
        startedAt: "09:00",
        endedAt: "10:20",
      },
      {
        id: 2,
        step: "충전",
        machine: "설비-10",
        status: "IN_PROCESS",
        startedAt: "10:30",
        endedAt: "-",
      },
    ];
  }, [lot]);

  const qualityLogs = useMemo(() => {
    if (!lot) return [];
    return [
      {
        id: 1,
        type: "전압 검사",
        result: "PASS",
        checkedAt: "11:40",
      },
      {
        id: 2,
        type: "내부 저항",
        result: "PASS",
        checkedAt: "11:45",
      },
    ];
  }, [lot]);

  /* =========================
     정렬 유틸
  ========================= */
  const sortData = (data, sortConfig) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
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
  };

  const sortedProcessLogs = useMemo(
    () => sortData(processLogs, processSort),
    [processLogs, processSort]
  );

  const sortedQualityLogs = useMemo(
    () => sortData(qualityLogs, qualitySort),
    [qualityLogs, qualitySort]
  );

  if (!lot) {
    return <Empty>LOT를 선택하세요.</Empty>;
  }

  /* =========================
     컬럼
  ========================= */
  const processColumns = [
    { key: "step", label: "공정", width: 140 },
    { key: "machine", label: "설비", width: 140 },
    { key: "status", label: "상태", width: 120 },
    { key: "startedAt", label: "시작", width: 120 },
    { key: "endedAt", label: "종료", width: 120 },
  ];

  const qualityColumns = [
    { key: "type", label: "검사 항목", width: 160 },
    { key: "result", label: "결과", width: 100 },
    { key: "checkedAt", label: "검사 시각", width: 140 },
  ];

  return (
    <Wrapper>
      {/* ===== Header ===== */}
      <Header>
        <h3>LOT 상세</h3>
        <StatusBadge status={lot.status}>{lot.status}</StatusBadge>
      </Header>

      {/* ===== Summary ===== */}
      <Summary>
        <Item>
          <label>LOT No</label>
          <strong>{lot.lotNo}</strong>
        </Item>
        <Item>
          <label>제품</label>
          <strong>{lot.product}</strong>
        </Item>
        <Item>
          <label>수량</label>
          <strong>{lot.qty}</strong>
        </Item>
        <Item>
          <label>작업지시</label>
          <strong>{lot.workOrderNo}</strong>
        </Item>
      </Summary>

      {/* ===== 공정 ===== */}
      <Section>
        <h4>공정 이력</h4>
        <Table
          columns={processColumns}
          data={sortedProcessLogs}
          sortConfig={processSort}
          onSort={(key) =>
            setProcessSort((p) => ({
              key,
              direction:
                p.key === key && p.direction === "asc" ? "desc" : "asc",
            }))
          }
          selectable={false}
        />
      </Section>

      {/* ===== 품질 ===== */}
      <Section>
        <h4>품질 검사</h4>
        <Table
          columns={qualityColumns}
          data={sortedQualityLogs}
          sortConfig={qualitySort}
          onSort={(key) =>
            setQualitySort((p) => ({
              key,
              direction:
                p.key === key && p.direction === "asc" ? "desc" : "asc",
            }))
          }
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
  gap: 18px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-size: 20px;
    font-weight: 700;
  }
`;

const StatusBadge = styled.div`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ status }) =>
    status === "DONE"
      ? "#dcfce7"
      : status === "IN_PROCESS"
      ? "#dbeafe"
      : "#fef3c7"};
  color: ${({ status }) =>
    status === "DONE"
      ? "#15803d"
      : status === "IN_PROCESS"
      ? "#1d4ed8"
      : "#b45309"};
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const Item = styled.div`
  background: white;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);

  label {
    font-size: 11px;
    opacity: 0.6;
  }

  strong {
    display: block;
    margin-top: 4px;
    font-size: 14px;
  }
`;

const Section = styled.div`
  h4 {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
  }
`;

const Empty = styled.div`
  padding: 60px 20px;
  text-align: center;
  opacity: 0.6;
`;
