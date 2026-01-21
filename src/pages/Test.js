import React from 'react';
import styled from 'styled-components';
import { FiX, FiCheckCircle, FiBox, FiTruck, FiActivity, FiLayers } from 'react-icons/fi';

// [MOCK 데이터] 완제품 스캔 데이터
const PRODUCT_DATA = {
  barcode: 'PROD-20250121-BOX005',
  status: 'PASS', // PASS(합격), FAIL(불량), HOLD(보류)
  productName: 'GB80L 자동차 배터리 (Export)',
  modelCode: 'BAT-GB80L-EX',
  
  // 포장 수량
  qty: 1, // 박스/파렛트 단위일 경우 내부 수량 표시
  innerQty: 40, // 1파렛트 = 40개
  unit: 'PLT', // Pallet
  
  // 생산 정보 (Key Point!)
  workOrder: 'WO-20250120-A01', // 작업지시번호
  line: '조립 2라인 (Assembly #2)',
  prodDate: '2025-01-21 10:30:00',
  worker: '박지민 (Shift A)',
  
  // 품질/출하
  customer: '현대자동차 (울산공장)',
  qcInspector: '정품질 (QC-01)',
};

const Test = ({ onClose, data = PRODUCT_DATA }) => {
  
  const getStatusTheme = (status) => {
    switch (status) {
      case 'PASS': return { color: '#059669', bg: '#D1FAE5', icon: <FiCheckCircle /> }; // Green
      case 'FAIL': return { color: '#DC2626', bg: '#FEE2E2', icon: <FiX /> };         // Red
      default: return { color: '#6B7280', bg: '#F3F4F6', icon: <FiActivity /> };
    }
  };

  const theme = getStatusTheme(data.status);

  return (
    <Overlay>
      <ModalContainer>
        {/* 1. 헤더: 품질 상태 강조 (합격/불량) */}
        <Header $bg={theme.bg}>
          <StatusBadge $color={theme.color} $bg="white">
            {theme.icon}
            <span>{data.status === 'PASS' ? 'QC 합격 (Passed)' : '출하 불가 (Hold)'}</span>
          </StatusBadge>
          <CloseButton onClick={onClose}><FiX /></CloseButton>
        </Header>

        <Content>
          {/* 2. 제품 정보 */}
          <TitleSection>
            <SubText>{data.modelCode}</SubText>
            <MainTitle>{data.productName}</MainTitle>
            <SpecText>{data.line}</SpecText>
          </TitleSection>

          {/* 3. 포장 수량 (박스/파렛트 관점) */}
          <QtyBox $color="var(--main)" $bg="var(--bgComplete)">
            <BoxIconWrapper><FiLayers size={24}/></BoxIconWrapper>
            <div>
              <span className="value">{data.qty}</span>
              <span className="unit">{data.unit}</span>
              <span className="sub-value">({data.innerQty} EA)</span>
            </div>
          </QtyBox>

          <Divider />

          {/* 4. 생산 상세 정보 Grid */}
          <InfoGrid>
            <InfoItem>
              <Label>작업지시 (WO)</Label>
              <Value $highlight>{data.workOrder}</Value>
            </InfoItem>
            <InfoItem>
              <Label>고객사</Label>
              <Value>{data.customer}</Value>
            </InfoItem>
            <InfoItem>
              <Label>생산일시</Label>
              <Value>{data.prodDate}</Value>
            </InfoItem>
            <InfoItem>
              <Label>검사자</Label>
              <Value>{data.qcInspector}</Value>
            </InfoItem>
            <InfoItem>
              <Label>작업자</Label>
              <Value>{data.worker}</Value>
            </InfoItem>
            <InfoItem>
              <Label>바코드 ID</Label>
              <Value>{data.barcode}</Value>
            </InfoItem>
          </InfoGrid>
        </Content>

        {/* 5. 액션 버튼 (출하 관련 기능) */}
        <Footer>
          <ActionButton className="secondary">
            <FiBox /> 포장 해제
          </ActionButton>
          <ActionButton className="primary" $bg="var(--main)">
            <FiTruck /> 출하 상차 (Loading)
          </ActionButton>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
};

export default Test;

/* =========================
   Styled Components (자재 모달과 레이아웃 공유, 스타일만 일부 변경)
========================= */

const Overlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
`;

const ModalContainer = styled.div`
  width: 450px;
  background: white; border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden; display: flex; flex-direction: column;
`;

const Header = styled.div`
  padding: 20px 24px; background-color: ${props => props.$bg};
  display: flex; justify-content: space-between; align-items: center;
`;

const StatusBadge = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: ${props => props.$bg}; color: ${props => props.$color};
  padding: 8px 16px; border-radius: 30px;
  font-weight: 700; font-size: 14px;
`;

const CloseButton = styled.button`
  font-size: 24px; color: #666;
  &:hover { color: #000; transform: scale(1.1); transition: 0.2s; }
`;

const Content = styled.div` padding: 24px; `;

const TitleSection = styled.div` text-align: center; margin-bottom: 24px; `;
const SubText = styled.div` font-size: 13px; color: #666; font-family: monospace; `;
const MainTitle = styled.h2` font-size: 20px; font-weight: 700; color: #111; margin: 4px 0; `;
const SpecText = styled.div` font-size: 13px; color: #004dfc; background: #E6EEFF; display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: 600; `;

const QtyBox = styled.div`
  background: ${props => props.$bg}; color: ${props => props.$color};
  border-radius: 12px; padding: 20px;
  display: flex; align-items: center; justify-content: center; gap: 16px;
  margin-bottom: 24px;

  .value { font-size: 36px; font-weight: 800; line-height: 1; }
  .unit { font-size: 16px; font-weight: 600; margin-left: 4px; }
  .sub-value { font-size: 14px; color: #666; margin-left: 8px; font-weight: 500; }
`;

const BoxIconWrapper = styled.div`
  width: 48px; height: 48px; border-radius: 50%; background: white;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const Divider = styled.div` height: 1px; background: #eee; margin-bottom: 24px; `;

const InfoGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 20px 12px; `;
const InfoItem = styled.div` display: flex; flex-direction: column; gap: 4px; `;
const Label = styled.span` font-size: 12px; color: #888; `;
const Value = styled.span`
  font-size: 14px; color: #333;
  font-weight: ${props => props.$highlight ? '700' : '400'};
  color: ${props => props.$highlight ? '#004dfc' : '#333'};
`;

const Footer = styled.div`
  padding: 16px 24px; background: #f8fafc; border-top: 1px solid #eee;
  display: flex; gap: 10px;
`;

const ActionButton = styled.button`
  flex: 1; padding: 14px; border-radius: 8px; font-weight: 600; font-size: 15px;
  display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s;

  &.secondary { background: white; border: 1px solid #ddd; color: #555; &:hover { background: #f1f3f5; } }
  &.primary { background: ${props => props.$bg}; color: white; &:hover { opacity: 0.9; } }
`;