import React from "react";
import styled from "styled-components";
import Barcode from "react-barcode";

/**
 * LOT 번호를 받아 바코드를 생성하는 컴포넌트
 * @param {string} value - 바코드로 변환할 값 (예: LOT 번호)
 * @param {string} width - 컴포넌트 가로 사이즈
 */
const BarcodeGen = ({ value, width = "100%" }) => {
  if (!value) return null; // 값이 없으면 아무것도 렌더링하지 않음

  return (
    <Container width={width}>
      <BarcodeWrapper>
        <Barcode
          value={value}
          format="CODE128" // 가장 널리 쓰이는 포맷
          width={2} // 바코드 선 굵기
          height={60} // 바코드 높이
          displayValue={true} // 하단에 텍스트 표시 여부
          font="Pretendard" // 폰트 설정
          fontSize={14} // 폰트 크기
          background="transparent" // 배경 투명 (부모 배경 따름)
          lineColor="var(--font)" // 바코드 색상
          margin={0}
        />
      </BarcodeWrapper>
      <Label>Product LOT No.</Label>
    </Container>
  );
};

export default BarcodeGen;

const Container = styled.div`
  width: ${(props) => props.width};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  /* 라벨 느낌의 스타일 */
  background-color: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const BarcodeWrapper = styled.div`
  margin-bottom: 10px;
  
  svg {
    max-width: 100%;
    height: auto;
  }
`;

const Label = styled.p`
  font-size: var(--fontSm);
  color: var(--font2);
  font-weight: var(--normal);
  letter-spacing: 1px;
`;