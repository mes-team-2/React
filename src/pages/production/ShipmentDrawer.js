import { useState } from "react";
import styled from "styled-components";
import SideDrawer from "../../components/SideDrawer";
import Button from "../../components/Button";
import TableStyle from "../../components/TableStyle";

import { ShipmentAPI } from "../../api/AxiosAPI3";

export default function ShipmentDrawer({
  open,
  onClose,
  onSuccess,
  baseItem,
  shipmentHistory = [],
}) {
  const [form, setForm] = useState({
    qty: "",
    location: "",
  });

  const formatDateTime = (value) => {
    if (!value) return "-";

    // "YYYY-MM-DD HH:mm:ss" → ISO 변환
    const normalized =
      typeof value === "string" && value.includes(" ")
        ? value.replace(" ", "T")
        : value;

    const date = new Date(normalized);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleString();
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async () => {
    try {
      await ShipmentAPI.create({
        txType: "SHIPMENT_OUT",
        qty: Math.abs(Number(form.qty)),
        unit: baseItem.unit,
        location: form.location,
        productCode: baseItem.productCode,
        productName: baseItem.productName,
      });

      alert("출하가 성공적으로 완료되었습니다.");

      onSuccess({
        tx_time: new Date().toISOString(),
        tx_type: "SHIPMENT_OUT",
        status_key: "out",
        productCode: baseItem.productCode,
        productName: baseItem.productName,
        qty: -Math.abs(Number(form.qty)),
        unit: baseItem.unit,
        location: form.location,
      });
    } catch (e) {
      alert("출하 처리 중 오류가 발생했습니다.");
      console.error(e);
    }
  };

  if (!baseItem) return null;

  return (
    <SideDrawer open={open} onClose={onClose} title="출하 등록">
      <Wrapper>
        <Header>
          <h3>출하 등록</h3>
        </Header>

        <Content>
          {/* 제품 정보 */}
          <Section>
            <SectionTitle>제품 정보</SectionTitle>
            <Grid>
              <Item>
                <label>제품코드</label>
                <Value>{baseItem.productCode}</Value>
              </Item>
              <Item>
                <label>제품명</label>
                <Value>{baseItem.productName}</Value>
              </Item>
              <Item>
                <label>최초 입고 수량</label>
                <Value>
                  {baseItem.initialQty.toLocaleString()} {baseItem.unit}
                </Value>
              </Item>
              <Item>
                <label>현재 재고</label>
                <Value>
                  {baseItem.qty.toLocaleString()} {baseItem.unit}
                </Value>
              </Item>
            </Grid>
          </Section>

          {/* 출하 입력 */}
          <Section>
            <SectionTitle>출하 정보 입력</SectionTitle>
            <Grid>
              <Item>
                <label>출하 수량</label>
                <Input
                  type="number"
                  min={1}
                  max={baseItem.qty}
                  value={form.qty}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      qty: e.target.value,
                    }))
                  }
                  placeholder={`최대 ${baseItem.qty.toLocaleString()}`}
                />
              </Item>
              <Item>
                <label>출고처</label>
                <Input
                  value={form.location}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="출고처 입력"
                />
              </Item>
            </Grid>
          </Section>

          <Section>
            <SectionTitle>출고 이력</SectionTitle>
            <TableStyle
              data={shipmentHistory.map((item, idx) => ({
                id: item.shipmentNo ?? idx,
                tx_time: formatDateTime(item.tx_time),
                location: item.location,
                qty: item.qty,
              }))}
              columns={[
                {
                  key: "tx_time",
                  label: "일시",
                  width: 160,
                },
                {
                  key: "location",
                  label: "출고처",
                  width: 120,
                },
                {
                  key: "qty",
                  label: "수량",
                  width: 80,
                  render: (val) => (
                    <span style={{ color: "var(--error)", fontWeight: "bold" }}>
                      -{Math.abs(val).toLocaleString()}
                    </span>
                  ),
                },
              ]}
              selectable={false}
            />
          </Section>
        </Content>

        <Footer>
          <Button variant="cancel" size="m" onClick={onClose}>
            취소
          </Button>
          <Button variant="ok" size="m" onClick={onSubmit}>
            출하 등록
          </Button>
        </Footer>
      </Wrapper>
    </SideDrawer>
  );
}

/* =========================
   styled-components
   ========================= */

const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
`;

const Header = styled.div`
  h3 {
    font-size: var(--fontHd);
    font-weight: var(--bold);
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
  padding-right: 10px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h4`
  font-size: var(--fontMd);
  font-weight: var(--bold);
  padding-left: 12px;
  position: relative;
  &::before {
    content: "";
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
  }
`;

const Value = styled.div`
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--background);
  font-size: var(--fontSm);
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--background);
  font-size: var(--fontSm);
  outline: none;

  &:focus {
    border-color: var(--main);
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HistoryRow = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 0.8fr;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--background2);
  font-size: var(--fontSm);
`;

const HistoryDate = styled.div`
  color: var(--font2);
`;

const HistoryLocation = styled.div`
  color: var(--font);
`;

const HistoryQty = styled.div`
  text-align: right;
  font-weight: var(--bold);
  color: var(--error);
`;

const EmptyText = styled.div`
  font-size: var(--fontSm);
  color: var(--font2);
  padding: 12px;
`;
