import React, { useState } from 'react';
import styled from 'styled-components';
import BarcodeGen from '../components/BarcodeGen'; // 경로 확인 필요

const Test = () => {
  const [productName, setProductName] = useState("Galaxy S25 Case");
  const [lotNumber, setLotNumber] = useState(""); // 초기엔 비어있음
  const [isProduced, setIsProduced] = useState(false);

  // 생산 완료 시 LOT 번호 생성 함수 (예시)
  const handleProductionComplete = () => {
    // 예: 날짜 + 랜덤코드 조합 (20251027-A01)
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomCode = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const newLot = `${date}-PROD-${randomCode}`;

    setLotNumber(newLot);
    setIsProduced(true);
    alert(`생산이 완료되었습니다.\nLOT 번호 발행: ${newLot}`);
  };

  return (
    <PageContainer>
      <Title>생산 및 바코드 발행 테스트</Title>

      {/* 1. 생산 제어 패널 */}
      <ControlPanel>
        <InfoItem>
          <span>생산 품목:</span>
          <strong>{productName}</strong>
        </InfoItem>

        <ProduceButton onClick={handleProductionComplete}>
          생산 완료 및 LOT 발행
        </ProduceButton>
      </ControlPanel>

      {/* 2. 바코드 출력 영역 (LOT 번호가 있을 때만 표시) */}
      {isProduced && lotNumber && (
        <ResultSection>
          <h3>🖨️ 발행된 바코드 라벨</h3>
          <div style={{ width: '300px' }}>
            <BarcodeGen value={lotNumber} />
          </div>
          <PrintMsg>※ 이 바코드를 클릭하여 인쇄하거나 스캔할 수 있습니다.</PrintMsg>
        </ResultSection>
      )}

    </PageContainer>
  );
};

export default Test;

/* 스타일 컴포넌트 */
const PageContainer = styled.div`
  padding: 40px;
  background-color: var(--background);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const Title = styled.h1`
  font-size: var(--font2XL);
  font-weight: var(--bold);
  color: var(--font);
`;

const ControlPanel = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
`;

const InfoItem = styled.div`
  font-size: var(--fontLg);
  color: var(--font);
  display: flex;
  gap: 10px;
  
  strong {
    color: var(--main);
    font-weight: var(--bold);
  }
`;

const ProduceButton = styled.button`
  background-color: var(--main);
  color: white;
  font-size: var(--fontMd);
  font-weight: var(--bold);
  padding: 12px 24px;
  border-radius: 8px;
  width: 100%;
  transition: 0.2s;

  &:hover {
    background-color: #2563eb; /* 좀 더 진한 파란색 */
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ResultSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  animation: fadeIn 0.5s ease-in-out;

  h3 {
    font-size: var(--fontLg);
    color: var(--font);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const PrintMsg = styled.p`
  font-size: var(--fontSm);
  color: var(--font2);
  margin-top: 10px;
`;