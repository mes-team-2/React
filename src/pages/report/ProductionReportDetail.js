import styled from "styled-components";

export default function ProductionReportDetail({ date, processRows = [] }) {
  if (!date) return <Empty>리포트 날짜를 선택하세요.</Empty>;

  return (
    <Wrap>
      <Header>
        <h3>리포트 상세</h3>
        <Badge>{date}</Badge>
      </Header>

      <Section>
        <h4>공정별 현황(예시)</h4>
        <Grid>
          {processRows.map((r) => (
            <Card key={r.process}>
              <label>{r.process}</label>
              <strong>Output: {r.output}</strong>
              <small>
                Input: {r.input} / NG: {r.ng}
              </small>
              <small>FPY: {r.fpY}%</small>
            </Card>
          ))}
        </Grid>
      </Section>

      <Tip>
        ※ 실제 연동 시: 작업지시/라인/설비별로 Drill-down + PDF/엑셀 출력까지
        확장 가능
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
  background: rgba(0, 0, 0, 0.06);
  font-size: 12px;
  font-weight: 900;
`;

const Section = styled.div`
  h4 {
    font-size: 13px;
    font-weight: 900;
    margin: 10px 0 8px 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
`;

const Card = styled.div`
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);

  label {
    font-size: 12px;
    color: var(--font2);
    font-weight: 900;
  }
  strong {
    display: block;
    margin-top: 6px;
    font-size: 14px;
    font-weight: 900;
  }
  small {
    display: block;
    margin-top: 4px;
    color: var(--font2);
    font-size: 12px;
  }
`;

const Tip = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: var(--font2);
  line-height: 1.4;
`;
