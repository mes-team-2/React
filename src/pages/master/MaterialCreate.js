import styled from "styled-components";
import { useState } from "react";
import { InventoryAPI } from "../../api/AxiosAPI"; // API import
import Button from "../../components/Button";

export default function MaterialCreate({ onClose }) {

  const [form, setForm] = useState({
    materialName: "",
    initialStock: "", // 기존 stockQty -> initialStock (기초재고)
    safeQty: "",
    unit: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!form.materialName.trim()) {
      alert("자재명을 입력해주세요.");
      return;
    }
    if (!form.unit) {
      alert("단위를 선택해주세요.");
      return;
    }

    // 데이터 포맷팅 (숫자 변환)
    const requestData = {
      materialName: form.materialName,
      unit: form.unit,
      // 빈 값일 경우 0 처리
      initialStock: form.initialStock ? Number(form.initialStock) : 0,
      safeQty: form.safeQty ? Number(form.safeQty) : 0,
    };

    // API 호출
    try {
      const response = await InventoryAPI.registerMaterial(requestData);
      if (response.status === 200) {
        alert("자재가 성공적으로 등록되었습니다.");
        onClose(); // 모달 닫기 (Material.js의 useEffect가 닫히면서 목록 갱신 트리거)
      }
    } catch (e) {
      console.error("자재 등록 실패:", e);
      alert("자재 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <Wrapper>
      <Header>
        <h3>신규 자재 등록</h3>
      </Header>

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
          <label>기초 재고</label>
          <input
            name="initialStock"
            type="number"
            value={form.initialStock}
            onChange={handleChange}
            placeholder="초기 재고 수량을 입력하세요"
          />
        </Field>

        <Field>
          <label>안전재고</label>
          <input
            name="safeQty"
            type="number"
            value={form.safeQty}
            onChange={handleChange}
            placeholder="안전재고 수량을 입력하세요"
          />
        </Field>

        <Field>
          <label>단위 *</label>
          <StyledSelect
            name="unit"
            value={form.unit}
            onChange={handleChange}
            $isPlaceholder={form.unit === ""}
          >
            <option value="" disabled hidden>
              자재 단위를 선택하세요
            </option>
            <option value="EA">EA</option>
            <option value="KG">KG</option>
            <option value="L">L</option>
            <option value="M">M</option>
          </StyledSelect>
        </Field>
      </Form>

      {/* ===== Buttons ===== */}
      <ButtonArea>
        <Button
          variant="cancel"
          size="l"
          width="100%"
          onClick={onClose}
        >
          취소
        </Button>
        <Button
          variant="ok"
          size="l"
          width="100%"
          onClick={handleSubmit}
        >
          등록
        </Button>
      </ButtonArea>
    </Wrapper>
  );
}


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
    font-size: var(--fontXs);
    font-weight: var(--normal);
    padding: 2px;
    opacity: 0.6;
  }

  input {
    padding: 10px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--background);
    font-size: var(--fontXs);
    height: 38px; 
    box-sizing: border-box;

    ::placeholder {
      color: var(--font2);
    }
  }

  input:disabled {
    background: var(--background2);
    color: var(--font2);
  }
`;

const StyledSelect = styled.select`
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--background);
  font-size: var(--fontXs);
  height: 38px;
  box-sizing: border-box;
  
  /* 값이 비어있으면($isPlaceholder) font2(회색), 값이 있으면 font(검정) */
  color: ${(props) => (props.$isPlaceholder ? "var(--font2)" : "var(--font)")};

  option {
    color: var(--font); /* 드롭다운 내 옵션들은 항상 검정색 */
  }
`;

const ButtonArea = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: center;
  gap: 50px;
`;

