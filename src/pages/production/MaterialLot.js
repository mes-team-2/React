import React, { useState } from 'react';
import styled from 'styled-components';
import { QRCodeCanvas } from 'qrcode.react';
import {
  FiPrinter, FiCheckCircle, FiAlertTriangle,
  FiBox, FiActivity, FiSettings, FiFileText, FiX, FiList
} from 'react-icons/fi';

/* =================================================================
   [MOCK DATA] 현재 DB 구조(CSV)에서 가져올 수 있는 데이터
   - Material Master + BOM + Production Log + Defect Log 조합
================================================================= */
const DB_DATA = {
  // [Table: material] - 자재 마스터 정보
  material_info: {
    material_id: 501,
    material_code: "MAT-AL-CASE-05",
    material_name: "알루미늄 케이스 (S-Type)",
    material_type: "Raw Material", // 자재 유형
    unit: "EA",
    safe_qty: 100, // 안전 재고

    // 현재고 (DB에 재고 컬럼이 없다면, 입고-투입 계산값이나 가상의 현재고 사용)
    current_qty: 4500,
  },

  // [Table: bom + product] - 이 자재가 사용되는 제품 정보 (역전개)
  used_in_products: [
    { product_name: "GB80L 배터리", bom_qty: 1 },
    { product_name: "GB60L 배터리", bom_qty: 1 },
  ],

  // [Table: production_log + machine] - 생산 투입 이력 (자재 사용 이력)
  // BOM을 통해 "어떤 생산 로그에 이 자재가 쓰였는지" 추적
  usage_history: [
    { log_id: 101, date: "2025-01-22 09:00", machine: "조립 1호기", product: "GB80L 배터리", used_qty: 500, worker: "김가공" },
    { log_id: 102, date: "2025-01-22 13:00", machine: "조립 2호기", product: "GB60L 배터리", used_qty: 300, worker: "박조립" },
  ],

  // [Table: defect_log] - 공정 중 발생한 불량 (자재 관련 불량일 경우)
  defect_logs: [
    { defect_id: 1, date: "2025-01-22 14:00", type: "자재 변형", qty: 5, machine: "조립 1호기" },
    { defect_id: 2, date: "2025-01-22 16:30", type: "치수 불량", qty: 2, machine: "조립 1호기" }
  ]
};

export default function MaterialLot({ onClose }) {
  const [activeTab, setActiveTab] = useState("INFO"); // INFO | USAGE | DEFECT

  const { material_info, used_in_products, usage_history, defect_logs } = DB_DATA;

  // 재고 상태 판단 (안전재고 기준)
  const stockStatus = material_info.current_qty > material_info.safe_qty ? 'NORMAL' : 'LOW';

  return (
    <Container>
      {/* --- Header --- */}
      <Header>
        <HeaderLeft>
          <Badge $status={stockStatus}>
            {stockStatus === 'NORMAL' ? <FiCheckCircle /> : <FiAlertTriangle />}
            {stockStatus === 'NORMAL' ? '재고 적정' : '재고 부족 (Low Stock)'}
          </Badge>
          <Title>{material_info.material_name}</Title>
          <SubTitle>{material_info.material_code}</SubTitle>
        </HeaderLeft>
        <HeaderRight>
          <ActionBtn><FiPrinter /> 라벨 발행</ActionBtn>
          {onClose && <CloseBtn onClick={onClose}><FiX /></CloseBtn>}
        </HeaderRight>
      </Header>

      <ScrollContent>
        {/* --- Summary Dashboard --- */}
        <SummaryGrid>
          {/* QR (자재 코드) */}
          <SummaryCard className="qr-card">
            <QRCodeCanvas value={material_info.material_code} size={80} />
            <div className="text-col">
              <span>현재 재고 (Current)</span>
              <div className="big-qty">
                {material_info.current_qty.toLocaleString()} <small>{material_info.unit}</small>
              </div>
            </div>
          </SummaryCard>

          {/* BOM Info (사용처) */}
          <SummaryCard>
            <div className="label-row">
              <span>사용 제품 (Used In)</span>
              <FiBox className="icon-bg" />
            </div>
            <ul className="usage-list">
              {used_in_products.map((prod, idx) => (
                <li key={idx}>
                  • {prod.product_name}
                  <small>(소요량: {prod.bom_qty})</small>
                </li>
              ))}
            </ul>
          </SummaryCard>

          {/* Safety Stock */}
          <SummaryCard>
            <div className="label-row">
              <span>안전 재고 (Safe Qty)</span>
              <FiActivity className="icon-bg" />
            </div>
            <div className="stat-value">
              {material_info.safe_qty.toLocaleString()} <small>{material_info.unit}</small>
            </div>
            <div className="stat-desc">최소 유지 수량</div>
          </SummaryCard>
        </SummaryGrid>

        {/* --- Tabs --- */}
        <TabContainer>
          <Tab $active={activeTab === 'INFO'} onClick={() => setActiveTab('INFO')}>기본 정보</Tab>
          <Tab $active={activeTab === 'USAGE'} onClick={() => setActiveTab('USAGE')}>
            생산 투입 이력 <span className="count">{usage_history.length}</span>
          </Tab>
          <Tab $active={activeTab === 'DEFECT'} onClick={() => setActiveTab('DEFECT')}>
            불량 이력 <span className="count">{defect_logs.length}</span>
          </Tab>
        </TabContainer>

        {/* --- Tab Contents --- */}
        <ContentArea>

          {/* 1. 기본 정보 (Material Master) */}
          {activeTab === 'INFO' && (
            <InfoTable>
              <tbody>
                <InfoRow>
                  <th>자재 코드</th>
                  <td>{material_info.material_code}</td>
                  <th>자재명</th>
                  <td className="highlight">{material_info.material_name}</td>
                </InfoRow>
                <InfoRow>
                  <th>자재 유형</th>
                  <td>{material_info.material_type}</td>
                  <th>단위 (Unit)</th>
                  <td>{material_info.unit}</td>
                </InfoRow>
                <InfoRow>
                  <th>안전 재고</th>
                  <td style={{ color: 'var(--error)', fontWeight: 'bold' }}>
                    {material_info.safe_qty} {material_info.unit}
                  </td>
                  <th>관리 상태</th>
                  <td><span style={{ color: 'var(--run)' }}>● 사용 가능 (Active)</span></td>
                </InfoRow>
              </tbody>
            </InfoTable>
          )}

          {/* 2. 생산 투입 이력 (Production Log 연동) */}
          {activeTab === 'USAGE' && (
            <UsageTable>
              <thead>
                <tr>
                  <th>투입 일시</th>
                  <th>생산 설비</th>
                  <th>생산 제품</th>
                  <th>투입 수량</th>
                  <th>작업자</th>
                </tr>
              </thead>
              <tbody>
                {usage_history.map((log) => (
                  <tr key={log.log_id}>
                    <td>{log.date}</td>
                    <td>{log.machine}</td>
                    <td>{log.product}</td>
                    <td className="qty">-{log.used_qty}</td>
                    <td>{log.worker}</td>
                  </tr>
                ))}
              </tbody>
            </UsageTable>
          )}

          {/* 3. 불량 이력 (Defect Log) */}
          {activeTab === 'DEFECT' && (
            <DefectTable>
              <thead>
                <tr>
                  <th>발생 일시</th>
                  <th>불량 유형</th>
                  <th>불량 수량</th>
                  <th>관련 설비</th>
                  <th>투입 제품 코드</th>
                  <th>투입 제품명</th>
                  <th>투입 제품 LOT</th>
                </tr>
              </thead>
              <tbody>
                {defect_logs.length > 0 ? (
                  defect_logs.map((log) => (
                    <tr key={log.defect_id}>
                      <td>{log.date}</td>
                      <td><span className="tag">{log.type}</span></td>
                      <td className="qty">-{log.qty}</td>
                      <td>{log.machine}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="empty">불량 이력이 없습니다.</td></tr>
                )}
              </tbody>
            </DefectTable>
          )}

        </ContentArea>
      </ScrollContent>
    </Container>
  );
}

/* =========================
   Styled Components
========================= */
const Container = styled.div`
  display: flex; flex-direction: column; height: 100%;
  background: #f8fafc; border-radius: 8px; overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 900px; margin: 0 auto;
`;

/* Header */
const Header = styled.div`
  padding: 24px; background: white; border-bottom: 1px solid #eee;
  display: flex; justify-content: space-between; align-items: flex-start;
`;
const HeaderLeft = styled.div` display: flex; flex-direction: column; gap: 6px; `;
const HeaderRight = styled.div` display: flex; gap: 8px; `;

const Badge = styled.span`
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 4px; width: fit-content;
  background: ${props => props.$status === 'NORMAL' ? 'var(--bgRun)' : 'var(--bgWaiting)'};
  color: ${props => props.$status === 'NORMAL' ? 'var(--run)' : 'var(--waiting)'};
`;
const Title = styled.h2` font-size: 22px; font-weight: 800; color: var(--font); margin: 4px 0; letter-spacing: -0.5px; `;
const SubTitle = styled.div` font-size: 14px; color: var(--font2); `;

const ActionBtn = styled.button`
  display: flex; align-items: center; gap: 6px; padding: 8px 14px;
  background: white; border: 1px solid #ddd; border-radius: 6px;
  font-size: 13px; font-weight: 600; color: #555;
  &:hover { background: #f1f3f5; }
`;
const CloseBtn = styled.button`
  padding: 8px; color: #999; font-size: 20px;
  &:hover { color: #333; }
`;

/* Scroll Content */
const ScrollContent = styled.div` flex: 1; overflow-y: auto; padding: 24px; `;

/* Summary Dashboard */
const SummaryGrid = styled.div`
  display: grid; grid-template-columns: 1.2fr 1.5fr 1fr; gap: 16px; margin-bottom: 24px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const SummaryCard = styled.div`
  background: white; padding: 20px; border-radius: 12px;
  border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02); position: relative;

  &.qr-card { 
    flex-direction: row; align-items: center; gap: 16px; justify-content: flex-start;
    .text-col { display: flex; flex-direction: column; }
    .big-qty { font-size: 24px; font-weight: 800; color: var(--main); line-height: 1.2; }
    small { font-size: 14px; font-weight: 600; color: #888; margin-left: 2px; }
  }

  .label-row { 
    display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 8px; font-weight: 600;
    .icon-bg { font-size: 18px; opacity: 0.5; }
  }
  
  .usage-list {
    list-style: none; padding: 0; margin: 0; font-size: 13px; color: #333;
    li { margin-bottom: 4px; display: flex; justify-content: space-between; }
    small { color: #888; }
  }

  .stat-value { font-size: 24px; font-weight: 800; color: #333; }
  .stat-desc { font-size: 12px; color: #999; margin-top: 4px; }
`;

/* Tabs */
const TabContainer = styled.div`
  display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 0;
`;
const Tab = styled.div`
  padding: 12px 20px; font-size: 14px; font-weight: 600; cursor: pointer;
  color: ${props => props.$active ? 'var(--main)' : '#888'};
  border-bottom: 2px solid ${props => props.$active ? 'var(--main)' : 'transparent'};
  display: flex; align-items: center; gap: 6px;
  
  .count { 
    background: #f1f5f9; color: #64748b; font-size: 10px; padding: 2px 6px; border-radius: 10px; 
    ${props => props.$active && `background: var(--bgRun); color: var(--run);`}
  }
  &:hover { color: var(--main); }
`;

/* Content Area */
const ContentArea = styled.div`
  background: white; padding: 24px; border-radius: 0 0 12px 12px;
  border: 1px solid #e2e8f0; border-top: none; min-height: 300px;
`;

/* Table Styles */
const InfoTable = styled.table`
  width: 100%; border-collapse: collapse; font-size: 14px;
  th { text-align: left; color: #888; font-weight: 500; padding: 12px 0; width: 120px; vertical-align: top; }
  td { color: #333; padding: 12px 0; font-weight: 500; }
  .highlight { color: var(--main); font-weight: 700; }
  tr:not(:last-child) { border-bottom: 1px solid #f1f5f9; }
`;
const InfoRow = styled.tr``;

const UsageTable = styled.table`
  width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;
  th { background: #f8fafc; color: #64748b; font-weight: 600; padding: 10px; border-bottom: 1px solid #e2e8f0; }
  td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; color: #333; }
  .qty { font-weight: 700; color: #333; }
`;

const DefectTable = styled.table`
  width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;
  th { background: #f8fafc; color: #64748b; font-weight: 600; padding: 10px; border-bottom: 1px solid #e2e8f0; }
  td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; color: #333; }
  .tag { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700; }
  .qty { font-weight: 700; color: #ef4444; }
  .empty { text-align: center; color: #999; padding: 30px; }
`;