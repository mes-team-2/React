import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter
} from 'lucide-react';


import TableStyle from '../components/TableStyle';
import SearchBar from '../components/SearchBar';
import SearchDate from '../components/SearchDate';
import SummaryCard from '../components/SummaryCard';

const Test = () => {
  // 1. 상태 관리
  const [historyData, setHistoryData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'tx_time', direction: 'desc' });

  // 검색 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDateRange, setSearchDateRange] = useState({ start: null, end: null });
  const [txTypeFilter, setTxTypeFilter] = useState("ALL"); // ALL, IN, OUT

  // 2. 초기 데이터 로드 (DB 구조 기반 시뮬레이션)
  // production_log(생산입고)와 shipment(출하) 데이터를 합친 뷰(View) 형태라고 가정
  useEffect(() => {
    const dummyData = [
      {
        id: 101,
        tx_time: '2026-01-28 14:30:00',
        tx_type: 'PRODUCTION_IN', // 생산입고
        product_code: 'BAT-12V-100A',
        product_name: '리튬이온 배터리 (100Ah)',
        lot_no: 'LOT-260128-01',
        qty: 500,
        unit: 'EA',
        location: 'A-101', // 입고 위치
        ref_doc: 'WO-260128-05', // 작업지시 번호
        worker: '김생산'
      },
      {
        id: 102,
        tx_time: '2026-01-28 16:00:00',
        tx_type: 'SHIPMENT_OUT', // 출하
        product_code: 'BAT-12V-100A',
        product_name: '리튬이온 배터리 (100Ah)',
        lot_no: 'LOT-260120-05',
        qty: -200, // 출고는 음수 처리
        unit: 'EA',
        location: '출하장', // 출고 위치
        ref_doc: 'SH-260128-01', // 출하 번호
        worker: '이물류'
      },
      {
        id: 103,
        tx_time: '2026-01-27 09:15:00',
        tx_type: 'PRODUCTION_IN',
        product_code: 'BAT-12V-120A',
        product_name: '리튬이온 배터리 (120Ah)',
        lot_no: 'LOT-260127-02',
        qty: 300,
        unit: 'EA',
        location: 'B-202',
        ref_doc: 'WO-260127-02',
        worker: '박조립'
      },
      {
        id: 104,
        tx_time: '2026-01-27 11:00:00',
        tx_type: 'RETURN_IN', // 반품 입고 (가정)
        product_code: 'BAT-12V-100A',
        product_name: '리튬이온 배터리 (100Ah)',
        lot_no: 'LOT-260120-99',
        qty: 10,
        unit: 'EA',
        location: 'R-001',
        ref_doc: 'RT-260127-01',
        worker: '최품질'
      },
      {
        id: 105,
        tx_time: '2026-01-26 15:20:00',
        tx_type: 'ADJUSTMENT', // 재고 조정 (손망실 등)
        product_code: 'BAT-12V-200A',
        product_name: '산업용 배터리 (200Ah)',
        lot_no: 'LOT-260126-11',
        qty: -2,
        unit: 'EA',
        location: 'A-105',
        ref_doc: '-',
        worker: '관리자'
      },
    ];
    setHistoryData(dummyData);
  }, []);

  // 3. 필터링 로직 (날짜, 검색어, 입출고 타입)
  const filteredData = useMemo(() => {
    let data = [...historyData];

    // 날짜 필터
    if (searchDateRange.start && searchDateRange.end) {
      const start = new Date(searchDateRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(searchDateRange.end);
      end.setHours(23, 59, 59, 999);

      data = data.filter(item => {
        const itemTime = new Date(item.tx_time);
        return itemTime >= start && itemTime <= end;
      });
    }

    // 텍스트 검색
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(item =>
        item.product_code.toLowerCase().includes(lower) ||
        item.product_name.toLowerCase().includes(lower) ||
        item.lot_no.toLowerCase().includes(lower) ||
        item.ref_doc.toLowerCase().includes(lower)
      );
    }

    // 입출고 타입 필터
    if (txTypeFilter !== "ALL") {
      if (txTypeFilter === "IN") {
        data = data.filter(item => item.qty > 0);
      } else if (txTypeFilter === "OUT") {
        data = data.filter(item => item.qty < 0);
      }
    }

    // 정렬
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [historyData, searchTerm, searchDateRange, txTypeFilter, sortConfig]);

  // 4. Summary 통계 계산
  const summary = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    let totalCount = filteredData.length;

    filteredData.forEach(item => {
      if (item.qty > 0) totalIn += item.qty;
      else totalOut += Math.abs(item.qty);
    });

    return { totalIn, totalOut, totalCount };
  }, [filteredData]);

  // 5. 구분값 뱃지 렌더러
  const renderTxType = (type) => {
    switch (type) {
      case 'PRODUCTION_IN': return <Badge $type="IN">생산입고</Badge>;
      case 'SHIPMENT_OUT': return <Badge $type="OUT">제품출하</Badge>;
      case 'RETURN_IN': return <Badge $type="RETURN">반품입고</Badge>;
      case 'ADJUSTMENT': return <Badge $type="ADJUST">재고조정</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  // 6. 테이블 컬럼 정의
  const columns = [
    { key: 'tx_time', label: '처리일시', width: 150 },
    {
      key: 'tx_type',
      label: '구분',
      width: 100,
      render: (val) => renderTxType(val)
    },
    {
      key: 'product_code',
      label: '제품코드',
      width: 130,
      render: (val) => <CodeText>{val}</CodeText>
    },
    { key: 'product_name', label: '제품명', width: 180 },
    {
      key: 'lot_no',
      label: 'LOT NO',
      width: 140,
      render: (val) => <CodeText>{val}</CodeText>
    },
    {
      key: 'qty',
      label: '수량',
      width: 90,
      render: (val) => (
        <QtyText $isPositive={val > 0}>
          {val > 0 ? `+${val.toLocaleString()}` : val.toLocaleString()}
        </QtyText>
      )
    },
    { key: 'unit', label: '단위', width: 60, render: (val) => <SubText>{val}</SubText> },
    { key: 'location', label: '위치', width: 100 },
    { key: 'ref_doc', label: '참조문서', width: 140, render: (val) => <SubText>{val}</SubText> },
    { key: 'worker', label: '작업자', width: 80 },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>제품 입출고 이력 조회</h2>
      </Header>

      {/* 요약 카드 */}
      <SummaryContainer>
        <SummaryCard
          icon={<History />}
          label="조회 건수"
          value={`${summary.totalCount.toLocaleString()} 건`}
          color="var(--font)"
        />
        <SummaryCard
          icon={<ArrowUpCircle />}
          label="총 입고 수량"
          value={`${summary.totalIn.toLocaleString()}`}
          color="var(--run)"
        />
        <SummaryCard
          icon={<ArrowDownCircle />}
          label="총 출고 수량"
          value={`${summary.totalOut.toLocaleString()}`}
          color="var(--error)"
        />
      </SummaryContainer>

      {/* 검색 필터 */}
      <FilterBar>
        <FilterGroup>
          <FilterLabel><Filter size={14} /> 구분</FilterLabel>
          <StyledSelect
            value={txTypeFilter}
            onChange={(e) => setTxTypeFilter(e.target.value)}
          >
            <option value="ALL">전체</option>
            <option value="IN">입고 (Inbound)</option>
            <option value="OUT">출고 (Outbound)</option>
          </StyledSelect>
        </FilterGroup>

        <SearchDate
          width="m"
          onChange={(start, end) => setSearchDateRange({ start, end })}
        />

        <SearchBar
          width="l"
          placeholder="제품코드, 명, LOT, 참조문서"
          onSearch={(val) => setSearchTerm(val)}
        />
      </FilterBar>

      {/* 데이터 테이블 */}
      <TableContainer>
        <TableStyle
          data={filteredData}
          columns={columns}
          sortConfig={sortConfig}
          onSort={(key) => {
            let direction = 'asc';
            if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
            setSortConfig({ key, direction });
          }}
          selectable={false} // 이력은 보통 선택해서 삭제하지 않으므로 false
        />
      </TableContainer>
    </Wrapper>
  );
};

export default Test;

// ==========================================
// 🎨 Styled Components
// ==========================================

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: var(--background);
  min-height: 100vh;
`;

const Header = styled.div`
  h2 {
    font-size: var(--fontXl);
    font-weight: var(--bold);
    color: var(--font);
    margin: 0;
  }
`;

const SummaryContainer = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: flex-end; /* 라벨과 높이 맞춤 */
  gap: 12px;
  background-color: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FilterLabel = styled.label`
  font-size: var(--fontXs);
  font-weight: var(--bold);
  color: var(--font2);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StyledSelect = styled.select`
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: var(--fontSm);
  color: var(--font);
  background-color: var(--background);
  min-width: 140px;
  cursor: pointer;

  &:focus {
    outline: 2px solid var(--main);
    border-color: transparent;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
`;

// [Badge Style] 입출고 유형에 따른 뱃지
const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: var(--bold);
  
  /* Type별 색상 처리 */
  background-color: ${props =>
    props.$type === 'IN' ? 'var(--bgRun)' :
      props.$type === 'OUT' ? 'var(--bgError)' :
        props.$type === 'RETURN' ? 'var(--bgWaiting)' :
          'var(--bgStop)'
  };
  
  color: ${props =>
    props.$type === 'IN' ? 'var(--run)' :
      props.$type === 'OUT' ? 'var(--error)' :
        props.$type === 'RETURN' ? 'var(--waiting)' :
          'var(--font2)'
  };
`;

const CodeText = styled.span`
  font-family: monospace;
  font-weight: var(--medium);
  color: var(--main);
`;

const QtyText = styled.span`
  font-weight: var(--bold);
  color: ${props => props.$isPositive ? 'var(--run)' : 'var(--error)'};
`;

const SubText = styled.span`
  color: var(--font2);
  font-size: 13px;
`;