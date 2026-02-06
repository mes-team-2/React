import { useState } from "react";
import styled from "styled-components";
import SideDrawer from "../../components/SideDrawer";
import Button from "../../components/Button";
import { ShipmentAPI } from "../../api/AxiosAPI3";

export default function ShipmentDrawer({ open, onClose, onSuccess, baseItem }) {
  const [form, setForm] = useState({
    qty: "",
    location: "",
    note: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async () => {
    try {
      await ShipmentAPI.create({
        txType: "SHIPMENT_OUT",
        qty: Math.abs(Number(form.qty)),
        unit: baseItem.unit,
        location: form.location,
        note: form.note,
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
        note: form.note,
      });
    } catch (e) {
      alert("출하 처리 중 오류가 발생했습니다.");
      console.error(e);
    }
  };

  if (!baseItem) return null;

  return (
    <SideDrawer open={open} onClose={onClose} title="출하 등록">
      <Container>
        {/* ===== 제품 정보 ===== */}
        <Section>
          <SectionTitle>출하 대상 제품</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <label>제품코드</label>
              <span>{baseItem.productCode}</span>
            </InfoItem>
            <InfoItem>
              <label>제품명</label>
              <span>{baseItem.productName}</span>
            </InfoItem>
            <InfoItem>
              <label>현재 재고</label>
              <Stock $low={baseItem.qty <= 0}>
                {(baseItem?.qty ?? 0).toLocaleString()} {baseItem?.unit ?? ""}
              </Stock>
            </InfoItem>
          </InfoGrid>
        </Section>

        {/* ===== 출하 입력 ===== */}
        <Section>
          <SectionTitle>출하 정보 입력</SectionTitle>

          <Field>
            <label>출하 수량</label>
            <input
              type="number"
              name="qty"
              value={form.qty}
              onChange={onChange}
              placeholder="출하할 수량 입력"
            />
          </Field>

          <Field>
            <label>출고처</label>
            <input
              name="location"
              value={form.location}
              onChange={onChange}
              placeholder="예: 현대모비스"
            />
          </Field>

          <Field>
            <label>비고</label>
            <input
              name="note"
              value={form.note}
              onChange={onChange}
              placeholder="출하번호 / 메모"
            />
          </Field>
        </Section>

        {/* ===== 버튼 ===== */}
        <ActionBar>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" onClick={submit}>
            출하 등록
          </Button>
        </ActionBar>
      </Container>
    </SideDrawer>
  );
}

/* =========================
   styled-components
   ========================= */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  background: var(--bgSub);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: var(--fontLg);
  font-weight: var(--bold);
  color: var(--font);
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: var(--fontSm);
    color: var(--fontSub);
  }

  span {
    font-size: var(--fontMd);
    font-weight: var(--bold);
  }
`;

const Stock = styled.span`
  color: ${(props) => (props.$low ? "var(--error)" : "var(--run)")};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: var(--fontSm);
    color: var(--fontSub);
  }

  input {
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 0 10px;
    font-size: var(--fontMd);
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
