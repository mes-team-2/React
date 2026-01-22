import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  FiSearch, FiDownload, FiPrinter, FiBox,
  FiCheckCircle, FiAlertTriangle, FiTruck, FiLayers
} from 'react-icons/fi';

/* =================================================================
   [MOCK DATA] 자재 데이터 (DB: material + material_lot)
================================================================= */
const MATERIAL_DATA = [
  {
    id: 1,
    lot_no: "MAT-260101-121212",
    code: "MAT-AL-05",
    name: "알루미늄 케이스 (S-Type)",
    category: "원자재",
    supplier: "알루코",
    location: "A-01-02",
    current: 4500,
    safe: 1000,
    unit: "EA",
    status: "NORMAL",
    date: "2025-01-22 12:34"
  },
  {
    id: 2,
    lot_no: "MAT-EL-250115-B05",
    code: "MAT-EL-01",
    name: "고순도 전해액 (LFP용)",
    category: "화학물질",
    supplier: "솔브레인",
    location: "C-05-01",
    current: 200,
    safe: 500,
    unit: "KG",
    status: "LOW",
    date: "2025-01-20 12:34"
  },
  {
    id: 3,
    lot_no: "MAT-CU-250122-A01",
    code: "MAT-CU-FOIL",
    name: "구리 포일 (Copper)",
    category: "원자재",
    supplier: "LS엠트론",
    location: "B-02-04",
    current: 5000,
    safe: 1000,
    unit: "ROLL",
    status: "NORMAL",
    date: "2025-01-22 12:34"
  },
  {
    id: 4,
    lot_no: "MAT-PK-250110-C02",
    code: "MAT-BOX-L",
    name: "대형 포장 박스",
    category: "부자재",
    supplier: "태림포장",
    location: "D-01-01",
    current: 0,
    safe: 200,
    unit: "EA",
    status: "EMPTY",
    date: "2025-01-10 12:34"
  },
];

export default function MaterialLot() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  // 필터링
  const filteredList = useMemo(() => {
    return MATERIAL_DATA.filter(item => {
      const matchStatus = activeTab === 'ALL' || item.status === activeTab;
      const matchSearch = item.name.includes(keyword) || item.code.includes(keyword);
      return matchStatus && matchSearch;
    });
  }, [activeTab, keyword]);

  // 상단 통계
  const stats = useMemo(() => {
    return {
      total: MATERIAL_DATA.length,
      normal: MATERIAL_DATA.filter(i => i.status === 'NORMAL').length,
      low: MATERIAL_DATA.filter(i => i.status === 'LOW' || i.status === 'EMPTY').length,
      inbound: 5 // 가상의 입고 예정 건수
    };
  }, []);

  return (
    <Container>
      {/* 1. Header */}
      <Header>
        <Title>자재 재고 관리</Title>
        <BtnGroup>
          <Btn><FiPrinter /> 인쇄</Btn>
          <Btn $primary><FiDownload /> 엑셀 다운로드</Btn>
        </BtnGroup>
      </Header>

      {/* 2. Dashboard Cards */}
      <Cards>
        <Card>
          <div className="icon blue"><FiBox /></div>
          <div className="text">
            <span>전체 LOT</span>
            <strong>{stats.total}</strong>
          </div>
        </Card>
        <Card>
          <div className="icon green"><FiCheckCircle /></div>
          <div className="text">
            <span>생산중(투입)</span>
            <strong>{stats.normal}</strong>
          </div>
        </Card>
        <Card>
          <div className="icon orange"><FiAlertTriangle /></div>
          <div className="text">
            <span>대기중</span>
            <strong className="warn">{stats.low}</strong>
          </div>
        </Card>
        <Card>
          <div className="icon purple"><FiTruck /></div>
          <div className="text">
            <span>불량</span>
            <strong>{stats.inbound}</strong>
          </div>
        </Card>
      </Cards>

      {/* 3. Filter & Search */}
      <Controls>
        <Tabs>
          <Tab $active={activeTab === 'ALL'} onClick={() => setActiveTab('ALL')}>전체</Tab>
          <Tab $active={activeTab === 'NORMAL'} onClick={() => setActiveTab('NORMAL')}>정상</Tab>
          <Tab $active={activeTab === 'LOW'} onClick={() => setActiveTab('LOW')}>부족</Tab>
          <Tab $active={activeTab === 'EMPTY'} onClick={() => setActiveTab('EMPTY')}>품절</Tab>
        </Tabs>
        <Search>
          <FiSearch />
          <input
            placeholder="자재명 또는 코드 검색"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        </Search>
      </Controls>

      {/* 4. List Table */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th width="50">No</th>
              <th width="100">LOT 상태</th>
              <th>LOT 번호</th>
              <th>자재코드</th>
              <th>자재명</th>
              <th>재고(A)</th>
              <th>생산중(B)</th>
              <th>잔여재고(A-B)</th>
              <th width="120">상태변경일시</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>
                  <Badge $status={item.status}>
                    {item.status === 'NORMAL' && '정상'}
                    {item.status === 'LOW' && '부족'}
                    {item.status === 'EMPTY' && '품절'}
                  </Badge>
                </td>
                <td className="code">{item.code}</td>
                <td className="bold">{item.name}</td>
                <td>{item.category}</td>
                <td>{item.supplier}</td>
                <td><Loc><FiLayers /> {item.location}</Loc></td>
                <td className="right">
                  <span className={item.status !== 'NORMAL' ? 'warn-text' : ''}>
                    {item.current.toLocaleString()}
                  </span>
                  <span className="sep">/</span>
                  <span className="safe">{item.safe.toLocaleString()}</span>
                  <small>{item.unit}</small>
                </td>
                <td className="date">{item.date}</td>
              </tr>
            ))}
            {filteredList.length === 0 && (
              <tr><td colSpan="9" className="empty">데이터가 없습니다.</td></tr>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
}

/* =========================
   Styled Components
========================= */
const Container = styled.div`
  display: flex; flex-direction: column; gap: 20px; height: 100%;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
`;
const Title = styled.h2`
  font-size: 20px; font-weight: 700; color: #111;
`;
const BtnGroup = styled.div` display: flex; gap: 8px; `;
const Btn = styled.button`
  display: flex; align-items: center; gap: 6px; padding: 8px 14px;
  border-radius: 6px; font-size: 13px; font-weight: 600;
  background: ${props => props.$primary ? '#004dfc' : 'white'};
  color: ${props => props.$primary ? 'white' : '#555'};
  border: 1px solid ${props => props.$primary ? '#004dfc' : '#ddd'};
  &:hover { opacity: 0.9; }
`;

/* Cards */
const Cards = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
`;
const Card = styled.div`
  background: white; padding: 20px; border-radius: 12px;
  border: 1px solid #e0e0e0; display: flex; align-items: center; gap: 16px;
  
  .icon {
    width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;
    &.blue { background: #e6eeff; color: #004dfc; }
    &.green { background: #e6fffa; color: #00c48c; }
    &.orange { background: #fff7e6; color: #fa8c16; }
    &.purple { background: #f9f0ff; color: #722ed1; }
  }
  .text {
    display: flex; flex-direction: column;
    span { font-size: 13px; color: #888; margin-bottom: 4px; }
    strong { font-size: 24px; font-weight: 700; color: #333; }
    strong.warn { color: #fa8c16; }
  }
`;

/* Controls */
const Controls = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  background: white; padding: 12px 20px; border-radius: 12px; border: 1px solid #e0e0e0;
`;
const Tabs = styled.div` display: flex; gap: 4px; `;
const Tab = styled.button`
  padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600;
  background: ${props => props.$active ? '#e6eeff' : 'transparent'};
  color: ${props => props.$active ? '#004dfc' : '#666'};
  &:hover { background: #f5f5f5; }
`;
const Search = styled.div`
  display: flex; align-items: center; background: #f5f5f5; border-radius: 6px; padding: 0 12px;
  svg { color: #999; }
  input { border: none; background: transparent; padding: 8px; width: 200px; font-size: 13px; }
`;

/* Table */
const TableContainer = styled.div`
  background: white; border-radius: 12px; border: 1px solid #e0e0e0; overflow: hidden; flex: 1;
`;
const Table = styled.table`
  width: 100%; border-collapse: collapse; font-size: 13px;
  th {
    background: #f8f9fa; color: #666; font-weight: 600; padding: 12px 16px; text-align: left;
    border-bottom: 1px solid #e0e0e0;
    &.right { text-align: right; }
  }
  td {
    padding: 14px 16px; border-bottom: 1px solid #f0f0f0; color: #333;
    &.right { text-align: right; }
    &.empty { text-align: center; padding: 40px; color: #999; }
    &.code { font-family: monospace; color: #666; }
    &.bold { font-weight: 600; }
    &.date { color: #888; }
    
    .warn-text { color: #fa8c16; font-weight: 700; }
    .sep { margin: 0 6px; color: #ddd; }
    .safe { color: #999; }
    small { font-size: 11px; color: #999; margin-left: 4px; }
  }
`;

const Badge = styled.span`
  padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;
  ${props => {
    if (props.$status === 'NORMAL') return `background: #e6fffa; color: #00c48c;`;
    if (props.$status === 'LOW') return `background: #fff7e6; color: #fa8c16;`;
    if (props.$status === 'EMPTY') return `background: #fff1f0; color: #f5222d;`;
    return `background: #f5f5f5; color: #666;`;
  }}
`;

const Loc = styled.span`
  display: flex; align-items: center; gap: 4px; color: #666;
  svg { color: #999; }
`;