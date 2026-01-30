import styled from "styled-components";
import { useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import Status from "../../components/Status";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

export default function LotDetail({ lot }) {
  const [processSort, setProcessSort] = useState({ key: null, direction: "asc" });
  const [materialSort, setMaterialSort] = useState({ key: null, direction: "asc" });
  const [qualitySort, setQualitySort] = useState({ key: null, direction: "asc" });

  // 공정 정보 데이터 (Process Log)

  const processLogs = useMemo(() => {
    if (!lot) return [];
    return [
      { id: 1, date: "2026-01-20", process: "극판 적층", machine: "STACK-02", start: "09:00:00", end: "09:35:00", status: "COMPLETE" },
      { id: 2, date: "2026-01-20", process: "COS 용접", machine: "COS-01", start: "09:40:00", end: "10:10:00", status: "COMPLETE" },
      { id: 3, date: "2026-01-20", process: "화성(충전)", machine: "FORM-10", start: "10:20:00", end: "11:40:00", status: "COMPLETE" },
      { id: 4, date: "2026-01-20", process: "최종 성능 검사", machine: "TEST-03", start: "11:50:00", end: "12:10:00", status: "COMPLETE" },
    ];
  }, [lot]);

  // 생산 정보 (투입 자재) 데이터 (Material Input)
  const materialLogs = useMemo(() => {
    if (!lot) return [];
    return [
      { id: 1, materialCode: "MAT-CASE-01", materialName: "배터리 케이스 (L3)", lotNo: "MATLOT-2512-001", qty: 100 },
      { id: 2, materialCode: "MAT-LEAD-A", materialName: "납판 (음극)", lotNo: "MATLOT-2512-055", qty: 600 },
      { id: 3, materialCode: "MAT-LEAD-C", materialName: "납판 (양극)", lotNo: "MATLOT-2512-056", qty: 600 },
      { id: 4, materialCode: "MAT-ELEC-S", materialName: "전해액 (황산)", lotNo: "MATLOT-2601-002", qty: 50 },
    ];
  }, [lot]);

  // 품질 검사 데이터 (Quality Check)

  const qualityLogs = useMemo(() => {
    if (!lot) return [];
    return [
      { id: 1, item: "OCV(개방회로전압)", ok: 490, ng: 10 },
      { id: 2, item: "내압 테스트", ok: 495, ng: 5 },
      { id: 3, item: "누액 검사", ok: 498, ng: 2 },
      { id: 4, item: "외관 검사", ok: 500, ng: 0 },
    ];
  }, [lot]);

  // 정렬 유틸
  const sortData = (data, config) => {
    if (!config.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a?.[config.key];
      const bVal = b?.[config.key];
      if (typeof aVal === "string") {
        return config.direction === "asc"
          ? aVal.localeCompare(bVal, "ko", { numeric: true })
          : bVal.localeCompare(aVal, "ko", { numeric: true });
      }
      return config.direction === "asc" ? aVal - bVal : bVal - aVal;
    });
  };

  const sortedProcess = useMemo(() => sortData(processLogs, processSort), [processLogs, processSort]);
  const sortedMaterial = useMemo(() => sortData(materialLogs, materialSort), [materialLogs, materialSort]);
  const sortedQuality = useMemo(() => sortData(qualityLogs, qualitySort), [qualityLogs, qualitySort]);


  // 공정 정보 컬럼
  const processColumns = [
    { key: "date", label: "일자", width: 100 },
    { key: "process", label: "공정", width: 140 },
    { key: "machine", label: "설비", width: 120 },
    { key: "start", label: "시작", width: 100 },
    { key: "end", label: "종료", width: 100 },
    { key: "status", label: "상태", width: 150, render: (val) => <Status status={val} type="basic" /> },
  ];

  // 생산 정보(투입자재) 컬럼
  const materialColumns = [
    { key: "materialCode", label: "자재코드", width: 140 },
    { key: "materialName", label: "자재명", width: 180 },
    { key: "lotNo", label: "자재 LOT", width: 160 },
    { key: "qty", label: "수량", width: 80, render: (val) => val.toLocaleString() },
  ];

  // 품질 검사 컬럼
  const qualityColumns = [
    { key: "item", label: "검사 항목", width: 180 },
    {
      key: "ok",
      label: "OK",
      width: 80,
    },
    {
      key: "ng",
      label: "NG",
      width: 80,
    },
    {
      key: "passRate",
      label: "양품률",
      width: 100,
      render: (_, row) => {
        const total = row.ok + row.ng;
        return total === 0 ? "-" : (
          <ResultText $type="ok">
            {((row.ok / total) * 100).toFixed(1)}%
          </ResultText>
        );
      }
    },
    {
      key: "failRate",
      label: "불량률",
      width: 100,
      render: (_, row) => {
        const total = row.ok + row.ng;
        return total === 0 ? "-" : (
          <ResultText $type="ng">
            {((row.ng / total) * 100).toFixed(1)}%
          </ResultText>
        );
      }
    },
  ];

  if (!lot) return <Empty>LOT를 선택하세요.</Empty>;

  return (
    <Wrapper>
      <Header>
        <h3>제품 LOT 상세 조회</h3>
      </Header>
      <Content>

        <Section>
          <SectionTitle>제품정보</SectionTitle>
          <Grid>
            <FullItem>
              <label>제품코드</label>
              <Value>{lot.productCode}</Value>
            </FullItem>
            <FullItem>
              <label>제품명</label>
              <Value>{lot.productName}</Value>
            </FullItem>
            <Item>
              <label>현재 수량</label>
              <Value>{Number(lot.currentQty ?? 0).toLocaleString()}</Value>
            </Item>
            <Item>
              <label>작업지시</label>
              <Value>{lot.workOrderNo}</Value>
            </Item>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>공정 이력</SectionTitle>
          <Table
            columns={processColumns}
            data={sortedProcess}
            sortConfig={processSort}
            onSort={(key) => setProcessSort((p) => ({ key, direction: p.key === key && p.direction === "asc" ? "desc" : "asc" }))}
            selectable={false}
          />
        </Section>

        <Section>
          <SectionTitle>투입 자재 정보</SectionTitle>
          <Table
            columns={materialColumns}
            data={sortedMaterial}
            sortConfig={materialSort}
            onSort={(key) => setMaterialSort((p) => ({ key, direction: p.key === key && p.direction === "asc" ? "desc" : "asc" }))}
            selectable={false}
          />
        </Section>

        <Section>
          <SectionTitle>품질 검사 결과</SectionTitle>
          <Table
            columns={qualityColumns}
            data={sortedQuality}
            sortConfig={qualitySort}
            onSort={(key) => setQualitySort((p) => ({ key, direction: p.key === key && p.direction === "asc" ? "desc" : "asc" }))}
            selectable={false}
          />
        </Section>

        <Section>
          <SectionTitle>항목별 불량률 분석</SectionTitle>
          <ChartCard>
            <ChartBox>
              <ResponsiveContainer>
                <BarChart data={qualityLogs} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
                  <XAxis type="number" unit="%" />
                  <YAxis type="category" dataKey="item" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ng" name="불량 수량" fill="var(--error)" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
          </ChartCard>
        </Section>
      </Content>
    </Wrapper>
  );
}


const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    font-size: var(--fontHd);
    font-weight: var(--bold);
    margin-bottom: 20px;
  }
`;

const Empty = styled.div`
  padding: 40px 20px;
  color: var(--font2);
  text-align: center;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--background2);
    border-radius: 3px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h4`
  font-size: var(--fontMd);
  font-weight: var(--bold);
  color: var(--font);
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 12px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background-color: var(--main); 
    border-radius: 2px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    font-size: var(--fontXs);
    font-weight: var(--medium);
    color: var(--font2);
    padding: 2px;
  }
`;

const FullItem = styled(Item)`
  grid-column: 1 / -1;
`;

const Value = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--background);
  height: 38px;
  font-size: var(--fontSm);
  color: var(--font);
`;

const ChartCard = styled.div`
  border-radius: 16px;
  padding: 14px;
  border: 1px solid var(--border);
`;

const ChartBox = styled.div`
  height: 200px;
  font-size: 12px;
`;

const ResultText = styled.span`
  font-weight: var(--bold);
  color: ${(props) => (props.$type === "ok" ? "var(--main)" : "var(--error)")};
`;