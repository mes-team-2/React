import styled from "styled-components";

const PROCESS = ["극판 적층", "COS 용접", "전해액 주입/화성", "최종 성능 검사"];

export default function TraceabilityDetail({ row }) {
  if (!row) return <Empty>항목을 선택하세요.</Empty>;

  const steps = PROCESS.map((p, idx) => ({
    process: p,
    at: `2026-01-${String(10 + idx).padStart(2, "0")} ${String(9 + idx).padStart(2, "0")}:1${idx}`,
    status: idx <= PROCESS.indexOf(row.lastProcess) ? "DONE" : "WAIT",
  }));

  return (
    <Wrap>
      <Header>
        <h3>Trace 상세</h3>
        <Badge $ok={row.testResult === "OK"}>{row.testResult}</Badge>
      </Header>

      <Sub>{row.producedAt}</Sub>

      <Grid>
        <Item>
          <label>제품</label>
          <strong>{row.productName}</strong>
          <small>{row.productCode}</small>
        </Item>
        <Item>
          <label>제품 LOT</label>
          <strong>{row.lotNo}</strong>
          <small>작업지시: {row.workOrderNo}</small>
        </Item>
        <Item>
          <label>시리얼</label>
          <strong>{row.serialNo}</strong>
          <small>최종 공정: {row.lastProcess}</small>
        </Item>
        <Item>
          <label>불량</label>
          <strong>{row.defectCode || "-"}</strong>
          <small>검사: {row.testResult}</small>
        </Item>
      </Grid>

      <Section>
        <h4>공정 타임라인</h4>
        <Timeline>
          {steps.map((s) => (
            <Step key={s.process} $done={s.status === "DONE"}>
              <div className="dot" />
              <div className="body">
                <div className="top">
                  <b>{s.process}</b>
                  <span>{s.status === "DONE" ? "완료" : "대기"}</span>
                </div>
                <small>{s.at}</small>
              </div>
            </Step>
          ))}
        </Timeline>
      </Section>

      <Section>
        <h4>연결 자재 LOT</h4>
        <ChipRow>
          {row.materialLots?.map((m) => (
            <Chip key={m}>{m}</Chip>
          ))}
        </ChipRow>
      </Section>

      <Tip>
        ※ 실제 연동 시: 각 공정 로그/검사 로그(TestLog)/자재LOT 상세로 링크 가능
      </Tip>
    </Wrap>
  );
}

const Wrap = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Empty = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: var(--font2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 900;
  }
`;

const Badge = styled.div`
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  background: ${(p) =>
    p.$ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"};
  color: ${(p) => (p.$ok ? "var(--run)" : "var(--error)")};
`;

const Sub = styled.div`
  font-size: 12px;
  color: var(--font2);
  margin-top: -6px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const Item = styled.div`
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);

  label {
    font-size: 11px;
    color: var(--font2);
  }
  strong {
    display: block;
    margin-top: 6px;
    font-size: 14px;
    font-weight: 900;
  }
  small {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: var(--font2);
  }
`;

const Section = styled.div`
  h4 {
    font-size: 13px;
    font-weight: 900;
    margin: 10px 0 8px 0;
  }
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Step = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;

  .dot {
    width: 10px;
    height: 10px;
    margin-top: 6px;
    border-radius: 50%;
    background: ${(p) => (p.$done ? "var(--run)" : "rgba(0,0,0,0.15)")};
  }

  .body {
    background: white;
    border-radius: 14px;
    padding: 12px;
    flex: 1;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  }

  .top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  b {
    font-size: 13px;
  }

  span {
    font-size: 12px;
    color: ${(p) => (p.$done ? "var(--run)" : "var(--font2)")};
    font-weight: 900;
  }

  small {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: var(--font2);
  }
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.div`
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 12px;
  font-weight: 900;
`;

const Tip = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: var(--font2);
  line-height: 1.4;
`;
