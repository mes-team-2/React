import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import {
  FiLayers,
  FiCheckCircle,
  FiActivity,
  FiAlertTriangle,
} from "react-icons/fi";
import TableStyle from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SearchDate from "../../components/SearchDate";
import Pagination from "../../components/Pagination";
import Status from "../../components/Status";
import SummaryCard from "../../components/SummaryCard";
import SideDrawer from "../../components/SideDrawer";
import LotDetail from "./LotDetail";
import SelectBar from "../../components/SelectBar";
import { ProductLotAPI } from "../../api/AxiosAPI";

export default function ProductLot() {
  const [data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);

  const loadData = async () => {
    try {
      const params = {
        keyword: keyword || null,
        startDate: dateRange.start || null,
        endDate: dateRange.end || null,
        status: statusFilter === "ALL" ? null : statusFilter,
      };
      const res = await ProductLotAPI.search(params);
      setData(res.data);
    } catch (err) {
      console.error("LOT 목록 조회 실패", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange, statusFilter]);

  const summaryData = useMemo(() => {
    const total = data.length;
    const run = data.filter((d) => d.status === "IN_PROGRESS").length;
    const ok = data.filter((d) => d.status === "COMPLETED").length;
    const err = data.filter((d) => d.status === "DEFECTIVE").length;

    return [
      {
        label: "전체 LOT",
        value: total + " 건",
        icon: <FiLayers />,
        color: "var(--main)",
      },
      {
        label: "생산 진행",
        value: run + " 건",
        icon: <FiActivity />,
        color: "var(--run)",
      },
      {
        label: "생산 완료",
        value: ok + " 건",
        icon: <FiCheckCircle />,
        color: "#4CAF50",
      },
      {
        label: "불량 발생",
        value: err + " 건",
        icon: <FiAlertTriangle />,
        color: "var(--error)",
      },
    ];
  }, [data]);

  const columns = [
    { key: "lotNo", label: "LOT 번호", width: 160 },
    { key: "productName", label: "제품명", width: 200 },
    { key: "workOrderNo", label: "작업지시번호", width: 140 },
    {
      key: "currentQty",
      label: "현재수량",
      width: 80,
      render: (val, row) => {
        // [수정] 완료 상태가 아니면 '-'
        return row.status === "COMPLETED" ? val : "-";
      },
    },
    {
      key: "badQty",
      label: "불량",
      width: 60,
      render: (val, row) => {
        // [수정] 완료 상태가 아니면 '-'
        return row.status === "COMPLETED" ? val : "-";
      },
    },
    { key: "createdAt", label: "생성일", width: 150 },
  ];

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const handleRowClick = (row) => {
    setSelectedLot(row);
    setIsDrawerOpen(true);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <Wrapper>
      <Header>
        <h2>제품 LOT 관리</h2>
      </Header>

      <SummaryGrid>
        {summaryData.map((item, idx) => (
          <SummaryCard
            key={idx}
            icon={item.icon}
            label={item.label}
            value={item.value}
            color={item.color}
          />
        ))}
      </SummaryGrid>

      <FilterBar>
        <div style={{ display: "flex", gap: "10px" }}>
          <SelectBar
            width="140px"
            placeholder="상태 전체"
            options={[
              { value: "ALL", label: "전체 상태" },
              { value: "LOT_RUN", label: "생산 진행" },
              { value: "LOT_OK", label: "생산 완료" },
              { value: "LOT_ERR", label: "불량 발생" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <SearchDate onChange={(start, end) => setDateRange({ start, end })} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <SearchBar
            width="300px"
            placeholder="LOT 번호, 제품명, 작업지시번호 검색"
            value={keyword}
            onChange={setKeyword}
            onSearch={loadData}
          />
        </div>
      </FilterBar>

      <TableStyle
        columns={columns}
        data={paginatedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={handleRowClick}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <SideDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="LOT 상세 정보"
      >
        <LotDetail lot={selectedLot} />
      </SideDrawer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 40px;
`;
const Header = styled.div`
  h2 {
    font-size: var(--fontHd);
    font-weight: var(--bold);
  }
`;
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
`;
const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;
