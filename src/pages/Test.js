import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  FiSearch, FiDownload, FiPrinter, FiCpu,
  FiCheckCircle, FiAlertCircle, FiClock, FiActivity
} from 'react-icons/fi';

/* =================================================================
   [MOCK DATA] DB 구조 기반 가상 데이터
   - production_log + product + machine + defect_log(집계)
================================================================= */
const PRODUCT_LOT_DATA = [
  {
    id: 1001,
    lot_number: "PL-250122-A01",
    product_code: "PROD-GB80L",
    product_name: "GB80L 자동차 배터리",
    machine_name: "조립 1호기",
    worker_name: "김조립",
    start_time: "2025-01-22 08:00",
    end_time: "2025-01-22 12:00",
    plan_qty: 500,    // 계획 수량
    actual_qty: 495,  // 생산 수량 (production_log)
    defect_qty: 5,    // 불량 수량 (defect_log count)
    status: "COMPLETE" // COMPLETE, RUNNING, STOP
  },
  {
    id: 1002,
    lot_number: "PL-250122-B02",
    product_code: "PROD-GB60L",
    product_name: "GB60L 자동차 배터리",
    machine_name: "조립 2호기",
    worker_name: "이생산",
    start_time: "2025-01-22 09:00",
    end_time: "-",
    plan_qty: 300,
    actual_qty: 150,
    defect_qty: 0,
    status: "RUNNING"
  },
  {
    id: 1003,
    lot_number: "PL-250121-A05",
    product_code: "PROD-EV-CELL",
    product_name: "EV 파우치 셀 (Type-C)",
    machine_name: "패키징 3호기",
    worker_name: "박포장",
    start_time: "2025-01-21 14:00",
    end_time: "2025-01-21 18:00",
    plan_qty: 1000,
    actual_qty: 920,
    defect_qty: 80, // 불량 다수 발생
    status: "COMPLETE"
  },
];

export default function Test() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL | RUNNING | COMPLETE

  // --- [Data Logic] 필터링 및 계산 ---
  const filteredData = useMemo(() => {
    return PRODUCT_LOT_DATA.filter(item => {
      const matchesSearch =
        item.lot_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_name.includes(searchTerm) ||
        item.machine_name.includes(searchTerm);

      const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus]);

  // --- [Statistics] 통계 계산 ---
  const stats = useMemo(() => {
    const totalQty = PRODUCT_LOT_DATA.reduce((acc, cur) => acc + cur.actual_qty, 0);
    const totalDefect = PRODUCT_LOT_DATA.reduce((acc, cur) => acc + cur.defect_qty, 0);
    const avgYield = totalQty > 0 ? ((totalQty - totalDefect) / totalQty) * 100 : 0;
    const runningCount = PRODUCT_LOT_DATA.filter(i => i.status === 'RUNNING').length;

    return { totalQty, totalDefect, avgYield: avgYield.toFixed(1), runningCount };
  }, []);

  return (
    <Container>
      <PageHeader>
        <PageTitle>제품 LOT / 생산 이력 조회</PageTitle>
        <ButtonGroup>
          <OutlinedBtn><FiPrinter /> 리포트 출력</OutlinedBtn>
          <PrimaryBtn><FiDownload /> 엑셀 다운로드</PrimaryBtn>
        </ButtonGroup>
      </PageHeader>

      {/* 1. 상단 통계 대시보드 (그래프 포함) */}
      <DashboardGrid>
        {/* 카드 1: 금일 생산 수량 */}
        <StatCard>
          <div className="card-header">
            <span className="title">금일 총 생산량 (Output)</span>
            <FiCheckCircle className="icon blue" />
          </div>
          <div className="card-body">
            <span className="value">{stats.totalQty.toLocaleString()} <small>EA</small></span>
            <div className="sub-text">계획 대비 98.5% 달성</div>
          </div>
          {/* 미니 바 차트 (CSS 구현) */}
          <MiniBarChart>
            <div className="bar-bg">
              <div className="bar-fill blue" style={{ width: '98.5%' }}></div>
            </div>
          </MiniBarChart>
        </StatCard>

        {/* 카드 2: 평균 수율 (Yield) */}
        <StatCard>
          <div className="card-header">
            <span className="title">평균 공정 수율 (Yield)</span>
            <FiActivity className="icon green" />
          </div>
          <div className="card-body">
            <span className="value">{stats.avgYield}%</span>
            <div className="sub-text">불량률 {(100 - stats.avgYield).toFixed(1)}%</div>
          </div>
          {/* 원형 차트 느낌의 프로그레스 */}
          <MiniBarChart>
            <div className="bar-bg">
              <div className="bar-fill green" style={{ width: `${stats.avgYield}%` }}></div>
            </div>
          </MiniBarChart>
        </StatCard>

        {/* 카드 3: 가동 중 설비 */}
        <StatCard onClick={() => setFilterStatus('RUNNING')} $clickable>
          <div className="card-header">
            <span className="title">가동 중인 LOT (Running)</span>
            <FiCpu className="icon orange" />
          </div>
          <div className="card-body">
            <span className="value">{stats.runningCount} <small>Lines</small></span>
            <div className="sub-text">실시간 모니터링 중</div>
          </div>
          <StatusIndicator>
            <span className="dot animate-pulse"></span> 시스템 정상 가동 중
          </StatusIndicator>
        </StatCard>

        {/* 카드 4: 불량 발생 현황 */}
        <StatCard>
          <div className="card-header">
            <span className="title">누적 불량 (Defect)</span>
            <FiAlertCircle className="icon red" />
          </div>
          <div className="card-body">
            <span className="value">{stats.totalDefect} <small>EA</small></span>
            <div className="sub-text">주요 유형: 치수불량</div>
          </div>
          <MiniBarChart>
            <div className="bar-bg">
              <div className="bar-fill red" style={{ width: '15%' }}></div>
            </div>
          </MiniBarChart>
        </StatCard>
      </DashboardGrid>

      {/* 2. 필터 및 검색 */}
      <FilterBar>
        <div className="left">
          <FilterTab $active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')}>전체 이력</FilterTab>
          <FilterTab $active={filterStatus === 'RUNNING'} onClick={() => setFilterStatus('RUNNING')}>생산 중 (WIP)</FilterTab>
          <FilterTab $active={filterStatus === 'COMPLETE'} onClick={() => setFilterStatus('COMPLETE')}>생산 완료</FilterTab>
        </div>
        <SearchBox>
          <FiSearch />
          <input
            placeholder="LOT 번호, 제품명, 설비명 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
      </FilterBar>

      {/* 3. 목록 테이블 */}
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th width="50">No</th>
              <th>진행 상태</th>
              <th>제품 LOT 번호</th>
              <th>제품 정보</th>
              <th>설비 / 작업자</th>
              <th className="center">수율 (Yield)</th>
              <th className="right">생산 / 불량</th>
              <th>생산 시간</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => {
              // 수율 계산 (개별 LOT)
              const yieldRate = item.actual_qty > 0
                ? ((item.actual_qty - item.defect_qty) / item.actual_qty * 100).toFixed(1)
                : 0;
              const isLowYield = yieldRate < 90; // 90% 미만이면 경고

              return (
                <tr key={item.id}>
                  <td>{index + 1}</td>

                  {/* 상태 뱃지 */}
                  <td>
                    <StatusBadge $status={item.status}>
                      {item.status === 'RUNNING' ? '가동중' : '완료'}
                    </StatusBadge>
                  </td>

                  <td className="lot-no">{item.lot_number}</td>

                  <td>
                    <div className="prod-info">
                      <span className="name">{item.product_name}</span>
                      <span className="code">{item.product_code}</span>
                    </div>
                  </td>

                  <td>
                    <div className="machine-info">
                      <span className="machine">{item.machine_name}</span>
                      <span className="worker">{item.worker_name}</span>
                    </div>
                  </td>

                  {/* 수율 그래프 (테이블 내) */}
                  <td className="center">
                    <YieldBox $isLow={isLowYield}>
                      <span className="text">{yieldRate}%</span>
                      <div className="track">
                        <div className="fill" style={{ width: `${yieldRate}%` }}></div>
                      </div>
                    </YieldBox>
                  </td>

                  <td className="right qty-group">
                    <span className="good">{item.actual_qty.toLocaleString()}</span>
                    <span className="divider">/</span>
                    <span className="bad">{item.defect_qty}</span>
                  </td>

                  <td>
                    <div className="time-info">
                      <span className="start"><FiClock size={10} /> {item.start_time.split(' ')[1]} ~</span>
                      <span className="end">{item.end_time === '-' ? '진행중' : item.end_time.split(' ')[1]}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrapper>
    </Container>
  );
}

/* =========================
   Styled Components
========================= */
const Container = styled.div` display: flex; flex-direction: column; gap: 20px; height: 100%; `;
const PageHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; `;
const PageTitle = styled.h2` font-size: 20px; font-weight: 700; color: var(--font); `;
const ButtonGroup = styled.div` display: flex; gap: 8px; `;

const Btn = styled.button` display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; transition: 0.2s; `;
const PrimaryBtn = styled(Btn)` background: var(--main); color: white; &:hover { opacity: 0.9; } `;
const OutlinedBtn = styled(Btn)` background: white; border: 1px solid #ddd; color: #555; &:hover { background: #f8fafc; } `;

/* Dashboard Styles */
const DashboardGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
`;

const StatCard = styled.div`
  background: white; border-radius: 12px; padding: 20px;
  border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  display: flex; flex-direction: column; justify-content: space-between;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); }

  .card-header { 
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
    .title { font-size: 13px; font-weight: 600; color: #64748b; }
    .icon { font-size: 20px; opacity: 0.8; }
    .icon.blue { color: var(--main); }
    .icon.green { color: #22c55e; }
    .icon.orange { color: #f97316; }
    .icon.red { color: #ef4444; }
  }

  .card-body {
    margin-bottom: 12px;
    .value { font-size: 26px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
    small { font-size: 14px; font-weight: 600; color: #94a3b8; margin-left: 4px; }
    .sub-text { font-size: 12px; color: #94a3b8; margin-top: 4px; }
  }
`;

/* CSS-only Mini Charts */
const MiniBarChart = styled.div`
  .bar-bg { width: 100%; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 3px; }
  .blue { background: var(--main); }
  .green { background: #22c55e; }
  .red { background: #ef4444; }
`;

const StatusIndicator = styled.div`
  font-size: 11px; color: #22c55e; font-weight: 600; display: flex; align-items: center; gap: 6px;
  .dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; }
  .animate-pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
`;

/* Filter & Table */
const FilterBar = styled.div`
  display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px 20px; border-radius: 12px; border: 1px solid var(--border);
  .left { display: flex; gap: 4px; }
`;
const FilterTab = styled.button`
  padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;
  background: ${props => props.$active ? 'var(--bgComplete)' : 'transparent'};
  color: ${props => props.$active ? 'var(--main)' : '#64748b'};
  &:hover { background: #f1f5f9; }
`;
const SearchBox = styled.div`
  display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 12px;
  svg { color: #94a3b8; }
  input { border: none; background: transparent; padding: 8px; width: 220px; font-size: 13px; &::placeholder { color: #cbd5e1; } }
`;

const TableWrapper = styled.div` background: white; border-radius: 12px; border: 1px solid var(--border); overflow: hidden; flex: 1; `;
const Table = styled.table`
  width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;
  th { background: #f8fafc; color: #64748b; font-weight: 600; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; &.right { text-align: right; } &.center { text-align: center; } }
  td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #333; vertical-align: middle; &.right { text-align: right; } &.center { text-align: center; } 
       &.lot-no { font-family: monospace; font-weight: 600; color: var(--main); cursor: pointer; &:hover { text-decoration: underline; } } }

  .prod-info { display: flex; flex-direction: column; .name { font-weight: 600; } .code { font-size: 11px; color: #94a3b8; } }
  .machine-info { display: flex; flex-direction: column; .machine { font-weight: 600; } .worker { font-size: 11px; color: #94a3b8; } }
  .time-info { display: flex; flex-direction: column; .start { color: #333; } .end { color: #94a3b8; font-size: 11px; } }
  
  .qty-group { font-family: monospace; font-size: 14px; .good { color: #333; font-weight: 700; } .bad { color: #ef4444; font-weight: 700; } .divider { color: #ddd; margin: 0 4px; } }
`;

/* Custom Table Components */
const StatusBadge = styled.span`
  display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;
  ${props => props.$status === 'RUNNING' ? `background: #dcfce7; color: #166534;` : `background: #f1f5f9; color: #64748b;`}
`;

const YieldBox = styled.div`
  display: flex; flex-direction: column; align-items: center; width: 80px; margin: 0 auto;
  .text { font-size: 12px; font-weight: 700; color: ${props => props.$isLow ? '#ef4444' : '#333'}; margin-bottom: 4px; }
  .track { width: 100%; height: 4px; background: #f1f5f9; border-radius: 2px; }
  .fill { height: 100%; background: ${props => props.$isLow ? '#ef4444' : '#22c55e'}; border-radius: 2px; }
`;