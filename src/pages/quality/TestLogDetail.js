import styled from "styled-components";
import { useMemo } from "react";

export default function TestLogDetail({ row, defectMap = [] }) {
  const defectName = useMemo(() => {
    if (!row?.defectCode) return "-";
    const found = defectMap.find((d) => d.code === row.defectCode);
    return found ? `${found.name} (${row.defectCode})` : row.defectCode;
  }, [row, defectMap]);

  if (!row) {
    return <Empty>검사 항목을 선택하세요.</Empty>;
  }

  return (
    <Wrap>
      <Header>
        <h3>검사 상세</h3>
        <Badge $result={row.result}>{row.result}</Badge>
      </Header>

      <Sub>{row.inspectedAt}</Sub>

      <Grid>
        <Item>
          <label>제품</label>
          <strong>{row.productName}</strong>
          <small>{row.productCode}</small>
        </Item>

        <Item>
          <label>작업지시</label>
          <strong>{row.workOrderNo}</strong>
          <small>LOT: {row.lotNo}</small>
        </Item>

        <Item>
          <label>공정 / 설비</label>
          <strong>{row.processStep}</strong>
          <small>{row.machine}</small>
        </Item>

        <Item>
          <label>검사자</label>
          <strong>{row.inspector}</strong>
          <small>-</small>
        </Item>
      </Grid>

      <Section>
        <h4>측정값</h4>
        <MeasureGrid>
          <Measure>
            <span>OCV</span>
            <b>{row.ocv}</b>
            <small>Spec: ≥ 12.0</small>
          </Measure>
          <Measure>
            <span>내압</span>
            <b>{row.pressure}</b>
            <small>Spec: ≥ 1.5</small>
          </Measure>
          <Measure>
            <span>누액</span>
            <b>{row.leak ? "Yes" : "No"}</b>
            <small>Spec: No</small>
          </Measure>
        </MeasureGrid>
      </Section>

      <Section>
        <h4>불량 정보</h4>
        <DefectBox>
          <Row>
            <label>불량코드</label>
            <span>{row.result === "NG" ? defectName : "-"}</span>
          </Row>
          <Row>
            <label>메모</label>
            <span>{row.note || "-"}</span>
          </Row>
        </DefectBox>
      </Section>

      <Tip>
        ※ 실제 연동 시: 검사 설비 데이터(전압/전류/온도 로그)와 이 검사건을
        연결해 “검사 트레이스”까지 확장 가능.
      </Tip>
    </Wrap>
  );
}

/* =========================
   styled
========================= */

const Wrap = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Empty = styled.div`
  padding: 40px 20px;
  color: var(--font2);
  text-align: center;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  h3 {
    font-size: 18px;
    font-weight: 800;
    margin: 0;
  }
`;

const Sub = styled.div`
  font-size: 12px;
  color: var(--font2);
  margin-top: -4px;
`;

const Badge = styled.div`
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
  background: ${(p) =>
    p.$result === "OK" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"};
  color: ${(p) => (p.$result === "OK" ? "#16a34a" : "#dc2626")};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 6px;
`;

const Item = styled.div`
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);

  label {
    font-size: 11px;
    opacity: 0.6;
  }
  strong {
    display: block;
    margin-top: 6px;
    font-size: 14px;
  }
  small {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: var(--font2);
  }
`;

const Section = styled.div`
  margin-top: 4px;

  h4 {
    font-size: 13px;
    font-weight: 900;
    margin: 10px 0 8px 0;
  }
`;

const MeasureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const Measure = styled.div`
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  text-align: center;

  span {
    font-size: 12px;
    color: var(--font2);
  }
  b {
    display: block;
    font-size: 18px;
    margin: 6px 0;
  }
  small {
    font-size: 11px;
    color: var(--font2);
  }
`;

const DefectBox = styled.div`
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);

  &:last-child {
    border-bottom: none;
  }

  label {
    font-size: 12px;
    color: var(--font2);
    min-width: 70px;
  }

  span {
    font-size: 13px;
    font-weight: 700;
    text-align: right;
  }
`;

const Tip = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: var(--font2);
  line-height: 1.4;
`;
