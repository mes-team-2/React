// src/pages/production/WorkOrderCreate.js
import { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "../../components/Button";
import { WorkOrderAPI } from "../../api/AxiosAPI";

export default function WorkOrderCreate({ onSubmit }) {
  // 제품 목록 상태
  const [products, setProducts] = useState([]);

  // 폼 상태 (DTO 구조와 일치시킴)
  const [form, setForm] = useState({
    productCode: "", // 백엔드는 Code를 원함
    plannedQty: "",
    dueDate: "", // [New] 납기일 필수
  });

  // [New] 컴포넌트 마운트 시 제품 목록 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await WorkOrderAPI.getProductList();
        setProducts(res.data); // [{productCode: "...", productName: "..."}, ...]
      } catch (err) {
        console.error("제품 목록 로드 실패", err);
        alert("제품 목록을 불러오지 못했습니다.");
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!form.productCode || !form.plannedQty || !form.dueDate) {
      alert("제품, 계획 수량, 납기일은 필수 항목입니다.");
      return;
    }

    try {
      // 전송 데이터 구성
      const payload = {
        productCode: form.productCode,
        plannedQty: parseInt(form.plannedQty), // 숫자로 변환
        dueDate: form.dueDate, // yyyy-MM-dd
      };

      // API 호출
      const res = await WorkOrderAPI.createWorkOrder(payload);

      alert(res.data.message || "작업지시가 등록되었습니다.");

      // 폼 초기화 (선택 사항)
      setForm({ productCode: "", plannedQty: "", dueDate: "" });

      // 부모 컴포넌트에 알림 (필요한 경우)
      onSubmit?.(payload);
    } catch (err) {
      console.error(err);
      alert("등록 실패: " + (err.response?.data?.message || "서버 오류 발생"));
    }
  };

  return (
    <Wrapper>
      <Title>작업지시 등록</Title>

      <Form>
        <label>제품</label>
        {/* value를 productCode로 변경 */}
        <select
          name="productCode"
          value={form.productCode}
          onChange={handleChange}
        >
          <option value="">선택하세요</option>
          {/* DB에서 가져온 제품 목록 매핑 */}
          {products.map((p) => (
            <option key={p.productCode} value={p.productCode}>
              {p.productName} ({p.productCode})
            </option>
          ))}
        </select>

        <label>계획 수량</label>
        <input
          type="number"
          name="plannedQty"
          value={form.plannedQty}
          onChange={handleChange}
          placeholder="예: 1000"
        />

        {/* [New] 납기일 입력 추가 (디자인 스타일 유지) */}
        <label>납기일 (Due Date)</label>
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
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
