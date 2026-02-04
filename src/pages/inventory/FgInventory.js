import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { AlertTriangle } from "lucide-react";
import { FiCheckCircle } from "react-icons/fi";
import { AiFillSafetyCertificate } from "react-icons/ai";
import SideDrawer from "../../components/SideDrawer";
import FgInventoryDetail from "./FgInventoryDetail";
import { InventoryAPI2 } from "../../api/AxiosAPI2";

import TableStyle from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SearchDate from "../../components/SearchDate";
import Status from "../../components/Status";
import SummaryCard from "../../components/SummaryCard";
import SelectBar from "../../components/SelectBar";

// 날짜 포맷 함수 (yyyy-MM-dd HH:mm)
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

// 날짜 params용
const toDateParam = (date) => {
  if (!date) return null;

  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

const getSafeQty = (name) => {
  switch (name) {
    case "12V 소형 배터리":
      return 100;
    case "12V 중형 배터리":
      return 120;
    case "12V 대형 배터리":
      return 50;
    default:
      return 30; // 기본 안전재고
  }
};

const FgInventory = () => {
  // 상태 관리
  const [inventoryData, setInventoryData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // 체크박스 선택된 ID들
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null }); // 정렬 설정

  // 상태 필터 State
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 검색 필터 상태관리
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDateRange, setSearchDateRange] = useState({
    start: null,
    end: null,
  });

  // 사이드 드로어 상태 관리
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // SelectBar 옵션 정의
  const STATUS_OPTIONS = [
    { value: "ALL", label: "전체 상태" },
    { value: "SAFE", label: "안전" },
    { value: "CAUTION", label: "주의" },
    { value: "DANGER", label: "경고(품절)" },
  ];

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await InventoryAPI2.getFgInventory({
          keyword: searchTerm || null,
          startDate: toDateParam(searchDateRange.start),
          endDate: toDateParam(searchDateRange.end),
        });

        const mapped = response.data.map((item, idx) => ({
          id: idx + 1,
          p_code: item.productCode,
          p_name: item.productName,
          unit: item.unit,
          qty: item.stockQty,
          safe_qty: getSafeQty(item.productName),
          date: item.updatedAt,
        }));

        setInventoryData(mapped);
      } catch (error) {
        console.error("재고 조회 실패", error);
      }
    };

    fetchInventory();
  }, [searchTerm, searchDateRange]);

  // 초기 데이터
  // useEffect(() => {
  //   const dummyData = [
  //     { id: 1, p_code: 'BAT-12V-100A', p_name: '리튬이온 배터리 (100Ah)', lot: 'LOT260120-01', qty: 450, safe_qty: 100, unit: 'EA', loc: 'A-101', date: '2026-01-28 10:30' },
  //     { id: 2, p_code: 'BAT-12V-120A', p_name: '리튬이온 배터리 (120Ah)', lot: 'LOT260120-05', qty: 80, safe_qty: 100, unit: 'EA', loc: 'B-202', date: '2026-01-28 11:20' },
  //     { id: 3, p_code: 'BAT-12V-100A', p_name: '리튬이온 배터리 (100Ah)', lot: 'LOT260121-02', qty: 300, safe_qty: 150, unit: 'EA', loc: 'A-103', date: '2026-01-28 14:15' },
  //     { id: 4, p_code: 'BAT-12V-080A', p_name: '납축전지 (80Ah)', lot: 'LOT260122-01', qty: 5, safe_qty: 50, unit: 'SET', loc: 'C-001', date: '2026-01-27 09:00' },
  //     { id: 5, p_code: 'BAT-12V-200A', p_name: '산업용 배터리 (200Ah)', lot: 'LOT260123-11', qty: 20, safe_qty: 30, unit: 'EA', loc: 'A-105', date: '2026-01-26 16:45' },
  //   ];
  //   setInventoryData(dummyData);
  // }, []);

  // 헬퍼 함수
  // 현재 재고가 0보다 작으면 위험 (DANGER)
  // 현재 재고가 안전재고보다 적으면 주의 (CAUTION)
  // 그 외 안전 (SAFE)
  const getStockStatus = (currentQty, safeQty) => {
    if (currentQty < 0) return "DANGER";
    if (currentQty < safeQty) return "CAUTION";
    return "SAFE";
  };

  // 필터링 및 정렬 로직
  const filteredData = useMemo(() => {
    let data = [...inventoryData];

    // 1. 날짜 검색
    if (searchDateRange.start && searchDateRange.end) {
      data = data.filter((item) => {
        const itemDate = new Date(item.date);
        const start = new Date(searchDateRange.start);
        start.setHours(0, 0, 0, 0);

        const end = new Date(searchDateRange.end);
        end.setHours(23, 59, 59, 999);

        return itemDate >= start && itemDate <= end;
      });
    }

    // 2. 텍스트 검색
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          item.p_code.toLowerCase().includes(lowerTerm) ||
          item.p_name.toLowerCase().includes(lowerTerm),
      );
    }

    // 3. [추가] 상태 필터링
    if (statusFilter !== "ALL") {
      data = data.filter((item) => {
        const currentStatus = getStockStatus(item.qty, item.safe_qty);
        return currentStatus === statusFilter;
      });
    }

    // 4. 정렬
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [inventoryData, searchTerm, searchDateRange, sortConfig, statusFilter]);

  // Summary 데이터 계산 (필터링된 데이터 기준)
  const summaryMetrics = useMemo(() => {
    let safeCount = 0;
    let cautionCount = 0;
    let dangerCount = 0;

    filteredData.forEach((item) => {
      const status = getStockStatus(item.qty, item.safe_qty);
      if (status === "SAFE") safeCount++;
      else if (status === "CAUTION") cautionCount++;
      else if (status === "DANGER") dangerCount++;
    });

    return { safeCount, cautionCount, dangerCount };
  }, [filteredData]);

  // 테이블 컬럼 정의
  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "No",
        width: 60,
      },
      {
        key: "p_code",
        label: "제품코드",
        width: 150,
      },
      { key: "p_name", label: "제품명", width: 250 },
      {
        key: "unit",
        label: "단위",
        width: 80,
      },
      {
        key: "safe_qty",
        label: "안전 재고",
        width: 120,
        render: (val) => val.toLocaleString(),
      },
      {
        key: "qty",
        label: "현재 재고",
        width: 120,
      },
      {
        key: "stock_status",
        label: "재고 상태",
        width: 150,
        render: (_, row) => (
          <Status status={getStockStatus(row.qty, row.safe_qty)} />
        ),
      },
      {
        key: "date",
        label: "최종 입고일",
        width: 150,
        render: (val) => formatDate(val),
      },
    ],
    [],
  );

  // 이벤트 핸들러
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 이벤트 핸들러: 검색어 상태 업데이트
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // 이벤트 핸들러: 날짜 상태 업데이트
  const handleDateSearch = (start, end) => {
    setSearchDateRange({ start, end });
  };

  const handleRowClick = (row) => {
    const detailData = {
      productName: row.p_name,
      productCode: row.p_code,
      stockQty: row.qty,
      safeQty: row.safe_qty,
      status: row.status,
      lot: row.lot,
      loc: row.loc,
    };
    setSelectedDetail(detailData);
    setIsDrawerOpen(true);
  };

  // 사이드 드로워 닫기 핸들러
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedDetail(null);
  };

  return (
    <Wrapper>
      <Header>
        <h2>제품 재고 조회</h2>
      </Header>

      <Summary>
        {/* SAFE: 안전 재고 이상 */}
        <SummaryCard
          icon={<AiFillSafetyCertificate />}
          label="안전 (적정 재고)"
          value={`${summaryMetrics.safeCount} 건`}
          color="var(--run)"
        />
        {/* CAUTION: 안전 재고 미만 */}
        <SummaryCard
          icon={<FiCheckCircle />}
          label="주의 (재고 부족)"
          value={`${summaryMetrics.cautionCount} 건`}
          color="var(--waiting)"
        />
        {/* DANGER: 0 미만 */}
        <SummaryCard
          icon={<AlertTriangle />}
          label="위험 (재고 부족)"
          value={`${summaryMetrics.dangerCount} 건`}
          color="var(--error)"
        />
      </Summary>

      <FilterBar>
        <SearchDate width="m" onChange={handleDateSearch} />
        <SelectBar
          width="140px"
          placeholder="상태 선택"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
        <SearchBar
          width="l"
          placeholder="제품코드, 제품명 입력"
          onSearch={handleSearch}
          onChange={(val) => {}}
        />
      </FilterBar>

      <TableStyle
        data={filteredData}
        columns={columns}
        selectable={false}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={handleRowClick}
      />

      <SideDrawer open={isDrawerOpen} onClose={handleCloseDrawer}>
        <FgInventoryDetail inventory={selectedDetail} />
      </SideDrawer>
    </Wrapper>
  );
};

export default FgInventory;

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
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
`;

const Summary = styled.footer`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`;
