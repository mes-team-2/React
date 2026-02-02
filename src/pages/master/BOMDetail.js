import styled from "styled-components";
import { useState, useEffect } from "react";
import SideDrawer from "../../components/SideDrawer";
import Button from "../../components/Button";
import { BomAPI } from "../../api/AxiosAPI";

export default function BOMDetail({ data, onClose, onSave }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    setForm(data);
  }, [data]);

  const handleSave = async () => {
    if (!form) return;
    try {
      // API 호출 (수량, 공정 수정)
      await BomAPI.update(form.id, {
        qty: form.qty,
        process: form.process,
      });
      alert("수정되었습니다.");
      onSave?.(); // 부모에게 알림
    } catch (err) {
      console.error(err);
      alert("수정 실패");
    }
  };

  if (!form) return null;

  return (
    <SideDrawer open={!!data} onClose={onClose}>
      <Wrapper>
        <h3>BOM 수정</h3>

        <Field>
          <label>자재코드</label>
          <input value={form.materialCode} disabled />
        </Field>

        <Field>
          <label>자재명</label>
          <input value={form.materialName} disabled />
        </Field>

        <Field>
          <label>소요량</label>
          <input
            type="number"
            value={form.qty}
            onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
          />
        </Field>

        <Field>
          <label>단위</label>
          <input value={form.unit} disabled />
        </Field>

        <Field>
          <label>투입 공정</label>
          <select
            value={form.process}
            onChange={(e) => setForm({ ...form, process: e.target.value })}
          >
            <option value="전극공정">전극공정</option>
            <option value="조립공정">조립공정</option>
            <option value="팩공정">팩공정</option>
            <option value="충전공정">충전공정</option>
            <option value="검사공정">검사공정</option>
          </select>
        </Field>

        <BtnRow>
          <Button variant="cancel" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSave}>
            저장
          </Button>
        </BtnRow>
      </Wrapper>
    </SideDrawer>
  );
}

/* =========================
   styled
========================= */

const Wrapper = styled.div`
  padding: 20px;
`;

const Field = styled.div`
  margin-bottom: 14px;

  label {
    display: block;
    font-size: 12px;
    margin-bottom: 6px;
    opacity: 0.7;
  }

  input,
  select {
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid #ddd;
  }
`;

const BtnRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;
