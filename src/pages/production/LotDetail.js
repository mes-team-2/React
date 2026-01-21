import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function LotDetail({ lot }) {
  /* =========================
     ✅ Hook은 항상 최상단에서
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
     데이터(더미) - lot 없으면 빈 배열로
  ========================= */
  const processLogs = useMemo(() => {
    if (!lot) return [];
    return [
      {
        id: 1,
        process: "극판 적층",
        machine: "STACK-02",
        status: "DONE",
        startAt: "09:00",
        endAt: "09:35",
      },
      {
        id: 2,
        process: "COS 용접",
        machine: "COS-01",
        status: "DONE",
        startAt: "09:40",
        endAt: "10:10",
      },
      {
        id: 3,
        process: "화성(충전)",
        machine: "FORM-10",
        status: "DONE",
        startAt: "10:20",
        endAt: "11:40",
      },
      {
        id: 4,
        process: "최종 성능 검사",
        machine: "TEST-03",
        status: "DONE",
        startAt: "11:50",
        endAt: "12:10",
      },
    ];
  }, [lot]);

  const qualityLogs = useMemo(() => {
    if (!lot) return [];
    return [
      { id: 1, item: "OCV(개방회로전압)", pass: 490, fail: 10 },
      { id: 2, item: "내압", pass: 495, fail: 5 },
      { id: 3, item: "누액", pass: 498, fail: 2 },
    ];
  }, [lot]);

  /* =========================
     정렬 유틸
  ========================= */
  const sortData = (data, config) => {
    if (!config.key) return data;

    return [...data].sort((a, b) => {
      const aVal = a?.[config.key];
      const bVal = b?.[config.key];

      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return config.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }
      return config.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  };

  const sortedProcessLogs = useMemo(
    () => sortData(processLogs, processSort),
    [processLogs, processSort],
  );

  const sortedQualityLogs = useMemo(
    () => sortData(qualityLogs, qualitySort),
    [qualityLogs, qualitySort],
  );

  /* =========================
     불량률 차트
  ========================= */
  const defectRateData = useMemo(() => {
    return qualityLogs.map((q) => {
      const total = q.pass + q.fail;
      return {
        name: q.item,
        rate: total === 0 ? 0 : Number(((q.fail / total) * 100).toFixed(2)),
      };
    });
  }, [qualityLogs]);

  /* =========================
     컬럼
  ========================= */
  const processColumns = [
    { key: "process", label: "공정", width: 160 },
    { key: "machine", label: "설비", width: 140 },
    { key: "status", label: "상태", width: 100 },
    { key: "startAt", label: "시작", width: 110 },
    { key: "endAt", label: "종료", width: 110 },
  ];

  const qualityColumns = [
    { key: "item", label: "검사 항목", width: 200 },
    { key: "pass", label: "합격", width: 110 },
    { key: "fail", label: "불합격", width: 110 },
  ];

  const handleSortProcess = (key) => {
    setProcessSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const handleSortQuality = (key) => {
    setQualitySort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  /* =========================
     ✅ 여기서 조건부 렌더링
     (Hook 호출 이후)
  ========================= */
  if (!lot) {
    return <Empty>LOT를 선택하세요.</Empty>;
  }

  return (
    <Wrapper>
      <Header>
        <div>
          <h3>LOT 상세</h3>
          <LotNo>{lot.lotNo}</LotNo>
        </div>
        <Badge>{lot.status}</Badge>
      </Header>

      <Summary>
        <SumItem>
          <label>자재</label>
          <strong>
            {lot.materialName} ({lot.materialCode})
          </strong>
        </SumItem>
        <SumItem>
          <label>입고일</label>
          <strong>{lot.inboundAt}</strong>
        </SumItem>
        <SumItem>
          <label>잔량</label>
          <strong>{Number(lot.remainQty ?? 0).toLocaleString()}</strong>
        </SumItem>
        <SumItem>
          <label>작업지시</label>
          <strong>{lot.workOrderNo}</strong>
        </SumItem>
      </Summary>

      <Section>
        <SectionTitle>공정 이력</SectionTitle>
        <Table
          columns={processColumns}
          data={sortedProcessLogs}
          sortConfig={processSort}
          onSort={handleSortProcess}
          selectable={false}
        />
      </Section>

      <Section>
        <SectionTitle>검사 결과</SectionTitle>
        <Table
          columns={qualityColumns}
          data={sortedQualityLogs}
          sortConfig={qualitySort}
          onSort={handleSortQuality}
          selectable={false}
        />
      </Section>

      <Section>
        <SectionTitle>검사 항목별 불량률 (%)</SectionTitle>
        <ChartCard>
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={defectRateData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </ChartCard>
      </Section>
    </Wrapper>
  );
}

/* =========================
   styled
========================= */

const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Empty = styled.div`
  padding: 40px 20px;
  color: var(--font2);
  text-align: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  h3 {
    font-size: 18px;
    font-weight: 700;
  }
`;

const LotNo = styled.div`
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--main);
`;

const Badge = styled.div`
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: #f3f4f6;
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const SumItem = styled.div`
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

const Section = styled.div``;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
`;

const ChartBox = styled.div`
  height: 220px;

  svg:focus,
  svg *:focus {
    outline: none;
  }
`;
