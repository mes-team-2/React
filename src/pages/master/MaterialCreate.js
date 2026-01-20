import styled from "styled-components";
import { useState } from "react";

export default function MaterialCreate({ onClose }) {
  /* =========================
     form state
  ========================= */
  const [form, setForm] = useState({
    materialName: "",
    stockQty: "",
    unit: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // TODO: API 연동
    console.log("신규 자재 등록:", form);
  };

  return (
    <Wrapper>
      {/* ===== Header ===== */}
      <Header>
        <h3>신규 자재 등록</h3>
      </Header>

      {/* ===== Form ===== */}
      <Form>
        <Field>
          <label>no (자재번호)</label>
          <input placeholder="자동 생성" disabled />
        </Field>

        <Field>
          <label>자재 코드</label>
          <input placeholder="자동 생성" disabled />
        </Field>

        <Field>
          <label>자재명 *</label>
          <input
            name="materialName"
            value={form.materialName}
            onChange={handleChange}
            placeholder="자재 이름을 입력하세요"
          />
        </Field>

        <Field>
          <label>재고 *</label>
          <input
            name="stockQty"
            type="number"
            value={form.stockQty}
            onChange={handleChange}
            placeholder="재고 수량을 입력하세요"
          />
        </Field>

        <Field>
          <label>단위 *</label>
          <select name="unit" value={form.unit} onChange={handleChange}>
            <option value="">자재 단위를 선택하세요</option>
            <option value="EA">EA</option>
            <option value="KG">KG</option>
            <option value="L">L</option>
          </select>
        </Field>
      </Form>

      {/* ===== Buttons ===== */}
      <ButtonArea>
        <CancelButton onClick={onClose}>취소</CancelButton>
        <SubmitButton onClick={handleSubmit}>등록</SubmitButton>
      </ButtonArea>
    </Wrapper>
  );
}

/* =========================
   styled-components
========================= */

const Wrapper = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;
`;

const Header = styled.div`
  h3 {
    font-size: 18px;
    font-weight: 700;
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    opacity: 0.7;
  }

  input,
  select {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid var(--border);
    font-size: 14px;
    background: #fafafa;
  }

  input:disabled {
    background: #f1f1f1;
    color: #999;
  }
`;

const ButtonArea = styled.div`
  margin-top: auto;
  display: flex;
  gap: 10px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 20px;
  background: #f1f1f1;
  font-size: 14px;
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 20px;
  background: var(--main);
  color: white;
  font-size: 14px;
`;
