import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  IoArrowForwardCircleOutline,
  IoArrowBackCircleOutline,
} from "react-icons/io5";
import { FiEdit, } from "react-icons/fi";
import TableStyle from '../../components/TableStyle';
import SearchBar from '../../components/SearchBar';
import SearchDate from '../../components/SearchDate';
import SummaryCard from '../../components/SummaryCard';
import Status from '../../components/Status';
import Pagination from '../../components/Pagination';

const Shipment = () => {
  // 상태 관리
  const [historyData, setHistoryData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'tx_time', direction: 'desc' });

  // 검색 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDateRange, setSearchDateRange] = useState({ start: null, end: null });
  const [txTypeFilter, setTxTypeFilter] = useState("ALL"); // ALL, IN, OUT

  // 페이지네이션 상태 추가
  const [page, setPage] = useState(1);
  const itemsPerPage = 20; // 페이지당 20개

  // 초기 데이터 로드 (DB 구조 기반 시뮬레이션)
  useEffect(() => {
    const dummyData = [
      {
        id: 101,
        tx_time: '2026-01-28 14:30:00',
        tx_type: 'PRODUCTION_IN', // 입고 (생산)
        status_key: 'in',
        product_code: 'BAT-12V-100A',
        product_name: '리튬이온 배터리 (100Ah)',
        qty: 500,
        unit: 'EA',
        location: 'A-101',
        note: 'WO-260128-05'
      },
      {
        id: 102,
        tx_time: '2026-01-28 16:00:00',
        tx_type: 'SHIPMENT_OUT', // 출고 (출하)
        status_key: 'out',
        product_code: 'BAT-12V-100A',
        product_name: '리튬이온 배터리 (100Ah)',
        qty: -200,
        unit: 'EA',
        location: '현대모비스', // 출고처
        note: 'SH-260128-01'
      },
      {
        id: 103,
        tx_time: '2026-01-27 09:15:00',
        tx_type: 'PRODUCTION_IN',
        status_key: 'in',
        product_code: 'BAT-12V-120A',
        product_name: '리튬이온 배터리 (120Ah)',
        qty: 300,
        unit: 'EA',
        location: 'B-202',
        note: 'WO-260127-02'
      },
      {
        id: 104,
        tx_time: '2026-01-26 15:20:00',
        tx_type: 'ADJUSTMENT', // 재고 조정
        status_key: 'out',
        product_code: 'BAT-12V-200A',
        product_name: '산업용 배터리 (200Ah)',
        qty: -2,
        unit: 'EA',
        location: 'A-105',
        note: '정기 재고실사 차이 반영'
      },
      // ... 페이지네이션 확인을 위한 더미 데이터 복제
      ...Array.from({ length: 20 }).map((_, i) => ({
        id: 200 + i,
        tx_time: `2026-01-${20 - (i % 20)} 10:00:00`,
        tx_type: i % 2 === 0 ? 'PRODUCTION_IN' : 'SHIPMENT_OUT',
        status_key: i % 2 === 0 ? 'in' : 'out',
        product_code: 'BAT-12V-100A',
        product_name: '리튬이온 배터리 (100Ah)',
        qty: i % 2 === 0 ? 100 : -50,
        unit: 'EA',
        location: i % 2 === 0 ? 'A-101' : '출하장',
        note: '-'
      })),
    ];
    setHistoryData(dummyData);
  }, []);

  // 필터링 로직
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
        item.note.toLowerCase().includes(lower) ||
        item.location.toLowerCase().includes(lower)
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

  // 현재 페이지 데이터 슬라이싱
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, page]);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  //  Summary 통계 계산 (총 건수, 입고, 출고, 재고조정)
  const summary = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    let adjustmentQty = 0;
    let totalCount = filteredData.length;

    filteredData.forEach(item => {
      if (item.tx_type === 'ADJUSTMENT') {
        adjustmentQty += item.qty;
      } else if (item.qty > 0) {
        totalIn += item.qty;
      } else {
        totalOut += Math.abs(item.qty);
      }
    });

    return { totalCount, totalIn, totalOut, adjustmentQty };
  }, [filteredData]);

  // 정렬 핸들러
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // 검색 (페이지 리셋 포함) 핸들러
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleDateSearch = (start, end) => {
    setSearchDateRange({ start, end });
    setPage(1);
  };

  // 테이블 컬럼 정의
  const columns = useMemo(() => [
    { key: 'tx_time', label: '일시', width: 150 },
    {
      key: 'status_key',
      label: '구분',
      width: 150,
      render: (val, row) => {
        return <Status status={val} />;
      }
    },
    {
      key: 'product_code',
      label: '제품코드',
      width: 130,

    },
    { key: 'product_name', label: '제품명', width: 180 },
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
    {
      key: 'unit',
      label: '단위',
      width: 60,
    },
    { key: 'location', label: '위치/출고처', width: 120 },
    {
      key: 'note',
      label: '비고',
      width: 140,
    },
  ], []);



  return (
    <Wrapper>
      <Header>
        <h2>제품 입출고 이력 조회</h2>
      </Header>

      <SummaryGrid>
        <SummaryCard
          icon={<FiEdit />}
          label="총 조회 건수"
          value={`${summary.totalCount.toLocaleString()} 건`}
          color="var(--font)"
        />
        <SummaryCard
          icon={<IoArrowBackCircleOutline />}
          label="총 입고 수량"
          value={`${summary.totalIn.toLocaleString()}`}
          color="var(--run)"
        />
        <SummaryCard
          icon={<IoArrowForwardCircleOutline />}
          label="총 출고 수량"
          value={`${summary.totalOut.toLocaleString()}`}
          color="var(--error)"
        />
        <SummaryCard
          icon={<IoArrowForwardCircleOutline />}
          label="폐기"
          value={`${summary.adjustmentQty.toLocaleString()}`}
          color="var(--waiting)"
        />
      </SummaryGrid>

      {/* 검색 필터 */}
      <FilterBar>
        <SearchDate
          width="m"
          onChange={(start, end) => setSearchDateRange({ start, end })}
        />

        <SearchBar
          width="l"
          placeholder="제품코드, 명, 위치, 비고 검색"
          onSearch={(val) => setSearchTerm(val)}
        />
      </FilterBar>

      <TableContainer>
        <TableStyle
          data={paginatedData}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable={false}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </TableContainer>
    </Wrapper>
  );
};

export default Shipment;


const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  h2 {
    font-size: var(--fontXl);
    font-weight: var(--bold);
    color: var(--font);
    margin: 0;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TableContainer = styled.div`
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;


const QtyText = styled.span`
  font-weight: var(--bold);
  color: ${props => props.$isPositive ? 'var(--main)' : 'var(--error)'};
`;

