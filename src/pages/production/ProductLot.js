import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { FiLayers, FiCheckCircle, FiActivity } from "react-icons/fi";
import { LuHourglass } from "react-icons/lu";
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

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
      const res = await ProductLotAPI.search({});
      setData(res.data);
    } catch (err) {
      console.error("LOT 목록 조회 실패", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const processedData = useMemo(() => {
    let result = [...data];

    if (dateRange.start && dateRange.end) {
      const startStr = formatDate(dateRange.start);
      const endStr = formatDate(dateRange.end);

      result = result.filter((item) => {
        if (!item.createdAt) return false;
        const itemDate = item.createdAt.substring(0, 10);
        return itemDate >= startStr && itemDate <= endStr;
      });
    }

    if (statusFilter !== "ALL") {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (keyword) {
      const lowerKey = keyword.toLowerCase();
      result = result.filter(
        (item) =>
          (item.lotNo && item.lotNo.toLowerCase().includes(lowerKey)) ||
          (item.productName &&
            item.productName.toLowerCase().includes(lowerKey)) ||
          (item.workOrderNo &&
            item.workOrderNo.toLowerCase().includes(lowerKey)),
      );
    }

    if (sortConfig.key !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, dateRange, statusFilter, keyword, sortConfig]);

  const summaryData = useMemo(() => {
    const total = data.length;
    const run = data.filter((d) => d.status === "IN_PROGRESS").length;
    const ok = data.filter((d) => d.status === "COMPLETED").length;
    const err = data.filter((d) => d.status === "HOLD").length;

    return [
      {
        label: "전체 LOT",
        value: total + " 건",
        icon: <FiLayers />,
        color: "var(--stop)",
      },
      {
        label: "생산 대기",
        value: err + " 건",
        icon: <LuHourglass />,
        color: "var(--waiting)",
      },
      {
        label: "진행중",
        value: run + " 건",
        icon: <FiActivity />,
        color: "var(--run)",
      },
      {
        label: "생산 완료",
        value: ok + " 건",
        icon: <FiCheckCircle />,
        color: "var(--complete)",
      },
    ];
  }, [data]);

  const columns = [
    { key: "lotNo", label: "LOT 번호", width: 160 },
    { key: "productName", label: "제품명", width: 200 },
    { key: "workOrderNo", label: "작업지시번호", width: 140 },
    {
      key: "status",
      label: "작업상태",
      width: 150,
      render: (status) => {
        let statusKey = "DEFAULT";
        if (status === "HOLD") statusKey = "WAIT";
        else if (status === "IN_PROGRESS") statusKey = "RUNNING";
        else if (status === "COMPLETED") statusKey = "COMPLETED";
        return <Status status={statusKey} />;
      },
    },
    {
      key: "currentQty",
      label: "현재수량",
      width: 80,
      render: (val, row) => (row.status === "COMPLETED" ? val : "-"),
    },
    {
      key: "badQty",
      label: "불량",
      width: 60,
      render: (val, row) => (row.status === "COMPLETED" ? val : "-"),
    },
    { key: "createdAt", label: "생성일", width: 150 },
  ];

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice(
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
        <SearchDate
          startDate={dateRange.start}
          endDate={dateRange.end}
          onChange={(start, end) => {
            setDateRange({ start, end });
            setPage(1);
          }}
        />

        <SelectBar
          width="s"
          placeholder="상태 전체"
          options={[
            { value: "ALL", label: "전체 상태" },
            { value: "HOLD", label: "생산 대기" },
            { value: "IN_PROGRESS", label: "진행중" },
            { value: "COMPLETED", label: "생산 완료" },
          ]}
          value={statusFilter}
          onChange={(e) => {
            const val = e.target ? e.target.value : e;
            setStatusFilter(val);
            setPage(1);
          }}
        />

        <SearchBar
          width="l"
          placeholder="LOT 번호 / 제품명 / 작업지시번호 검색"
          value={keyword}
          onChange={(val) => {
            setKeyword(val);
            setPage(1);
          }}
          onSearch={() => {}}
        />
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
  align-items: center;
  margin-top: 20px;
  gap: 20px;
`;
