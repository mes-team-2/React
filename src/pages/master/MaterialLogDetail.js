import styled from "styled-components";

export default function MaterialLogDetail({ row }) {
  if (!row) return <Empty>이력을 선택하세요.</Empty>;

  return (
    <Wrap>
      <Header>
        <h3>자재 이력 상세</h3>
        <TypeBadge $type={row.type}>{row.typeName}</TypeBadge>
      </Header>

      <Sub>{row.occurredAt}</Sub>

      <Grid>
        <Item>
          <label>자재</label>
          <strong>{row.materialName}</strong>
          <small>{row.materialCode}</small>
        </Item>

        <Item>
          <label>LOT</label>
          <strong>{row.lotNo}</strong>
          <small>잔량: {row.remainQty}</small>
        </Item>

        <Item>
          <label>수량</label>
          <strong>{row.qty}</strong>
          <small>단위: EA</small>
        </Item>

        <Item>
          <label>공정 / 작업지시</label>
          <strong>{row.process}</strong>
          <small>{row.workOrderNo}</small>
        </Item>

        <Item>
          <label>작업자</label>
          <strong>{row.operator}</strong>
        </Item>
      </Grid>

      <Section>
        <h4>비고</h4>
        <Box>{row.note || "-"}</Box>
      </Section>
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
  padding: 40px;
  text-align: center;
  color: var(--font2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-size: 18px;
    font-weight: 800;
    margin: 0;
  }
`;

const Sub = styled.div`
  font-size: 12px;
  color: var(--font2);
`;

const TypeBadge = styled.div`
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  background: ${(p) =>
    p.$type === "IN"
      ? "rgba(37,99,235,0.12)"
      : p.$type === "USE"
        ? "rgba(22,163,74,0.12)"
        : p.$type === "OUT"
          ? "rgba(124,58,237,0.12)"
          : "rgba(245,158,11,0.12)"};
  color: ${(p) =>
    p.$type === "IN"
      ? "#2563eb"
      : p.$type === "USE"
        ? "#16a34a"
        : p.$type === "OUT"
          ? "#7c3aed"
          : "#f59e0b"};
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
  }
  small {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: var(--font2);
  }
`;

const Section = styled.div`
  margin-top: 6px;

  h4 {
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 8px;
  }
`;

const Box = styled.div`
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
`;
