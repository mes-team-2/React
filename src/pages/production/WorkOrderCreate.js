// src/pages/production/WorkOrderCreate.js
import { useState } from "react";
import styled from "styled-components";
import Button from "../../components/Button";

export default function WorkOrderCreate({ onSubmit }) {
  const [form, setForm] = useState({
    product: "",
    plannedQty: "",
    startDate: "",
    dueDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.product || !form.plannedQty) {
      alert("필수 항목을 입력하세요.");
      return;
    }

    // 실제로는 API 호출
    onSubmit?.(form);
  };

  return (
    <Wrapper>
      <Title>작업지시 등록</Title>

      <Form>
        <label>제품</label>
        <select name="product" value={form.product} onChange={handleChange}>
          <option value="">선택</option>
          <option value="12V 배터리 (소형)">12V 배터리 (소형)</option>
          <option value="12V 배터리 (중형)">12V 배터리 (중형)</option>
          <option value="12V 배터리 (대형)">12V 배터리 (대형)</option>
        </select>

        <label>계획 수량</label>
        <input
          type="number"
          name="plannedQty"
          value={form.plannedQty}
          onChange={handleChange}
          placeholder="예: 1000"
        />

        <CreateBtn onClick={handleSubmit}>작업지시 등록</CreateBtn>
      </Form>
    </Wrapper>
  );
}

/* =========================
   styled
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  label {
    font-size: 12px;
    opacity: 0.7;
  }

  input,
  select {
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #ddd;
    font-size: 14px;
  }
`;

const CreateBtn = styled.button`
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  background: #004dfc;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #003ad6;
  }
`;
