import styled from "styled-components";

const STATUS = {
  READY: "출하대기",
  SHIPPING: "출하중",
  DONE: "출하완료",
  HOLD: "보류",
};

export default function ShipmentDetail({ row }) {
  if (!row) return <Empty>출하 건을 선택하세요.</Empty>;

  const progress =
    row.qty === 0 ? 0 : Math.round((row.shippedQty / row.qty) * 100);

  return (
    <Wrap>
      <Header>
        <h3>출하 상세</h3>
        <Badge $st={row.status}>{STATUS[row.status]}</Badge>
      </Header>

      <Sub>{row.planDate}</Sub>

      <Grid>
        <Item>
          <label>출하번호</label>
          <strong>{row.shipmentNo}</strong>
          <small>주문: {row.orderNo}</small>
        </Item>

        <Item>
          <label>거래처</label>
          <strong>{row.customer}</strong>
          <small>운송: {row.carrier}</small>
        </Item>

        <Item>
          <label>제품</label>
          <strong>{row.productName}</strong>
          <small>{row.productCode}</small>
        </Item>

        <Item>
          <label>수량</label>
          <strong>
            {row.shippedQty}/{row.qty}
          </strong>
          <small>진행률: {progress}%</small>
        </Item>

        <Item>
          <label>운송장</label>
          <strong>{row.trackingNo}</strong>
          <small>팔레트: {row.palletCount} PLT</small>
        </Item>

        <Item>
          <label>비고</label>
          <strong>{row.note || "-"}</strong>
        </Item>
      </Grid>

      <Section>
        <h4>검수 체크(예시)</h4>
        <CheckList>
          <li>라벨/바코드 출력 및 부착 확인</li>
          <li>출하 수량 확인</li>
          <li>포장 상태 확인</li>
          <li>운송장 등록</li>
        </CheckList>
      </Section>
    </Wrap>
  );
}

const Wrap = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Empty = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: var(--font2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 900;
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
  font-weight: 900;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.06);
  color: ${(p) =>
    p.$st === "DONE"
      ? "var(--run)"
      : p.$st === "HOLD"
        ? "var(--error)"
        : p.$st === "READY"
          ? "var(--waiting)"
          : "var(--main)"};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 8px;
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
  margin-top: 8px;

  h4 {
    font-size: 13px;
    font-weight: 900;
    margin: 10px 0 8px 0;
  }
`;

const CheckList = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: var(--font2);
  line-height: 1.6;
`;
