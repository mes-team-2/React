import styled from "styled-components";
import { useState } from "react";
import { InventoryAPI } from "../../api/AxiosAPI";

export default function MaterialInbound({ material, onClose, onSuccess }) {
  const [qty, setQty] = useState("");

  const handleSubmit = async () => {
    if (!qty || qty <= 0) {
      alert("유효한 수량을 입력해주세요.");
      return;
    }

    try {
      // API 호출 (자재 ID와 수량 전달)
      const response = await InventoryAPI.inboundMaterial({
        materialId: material.materialId,
        quantity: Number(qty),
      });

      if (response.status === 200) {
        alert(`[${material.materialName}] ${qty}${material.unit} 입고 완료!`);
        onSuccess(); // 부모 컴포넌트(MaterialDetail) 새로고침 트리거
        onClose(); // 모달 닫기
      }
    } catch (e) {
      console.error("입고 처리 실패:", e);
      alert("입고 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Overlay>
      <Container>
        <Title>자재 입고 처리</Title>
        <InfoBox>
          <p>
            자재명: <span>{material.materialName}</span>
          </p>
          <p>
            현재고:{" "}
            <span>
              {material.stockQty} {material.unit}
            </span>
          </p>
        </InfoBox>

        <InputLabel>입고 수량 입력</InputLabel>
        <Input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="수량을 입력하세요"
          autoFocus
        />

        <ButtonGroup>
          <CancelBtn onClick={onClose}>취소</CancelBtn>
          <ConfirmBtn onClick={handleSubmit}>입고 확정</ConfirmBtn>
        </ButtonGroup>
      </Container>
    </Overlay>
  );
}

/* 스타일 컴포넌트 */
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const Container = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 320px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const InfoBox = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #555;
  p {
    margin: 4px 0;
    display: flex;
    justify-content: space-between;
  }
  span {
    font-weight: 600;
    color: #333;
  }
`;

const InputLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: -8px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  text-align: right;
  &:focus {
    outline: 2px solid var(--main);
    border-color: transparent;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const CancelBtn = styled(Button)`
  background: #f1f3f5;
  color: #495057;
`;

const ConfirmBtn = styled(Button)`
  background: var(--main); // 테마 메인 컬러 사용
  color: white;
`;
