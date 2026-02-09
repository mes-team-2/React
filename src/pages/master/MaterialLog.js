import styled from "styled-components";
import { useEffect, useMemo, useState, useRef } from "react";
import TableStyle from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SideDrawer from "../../components/SideDrawer";
import SummaryCard from "../../components/SummaryCard";
import MaterialLogDetail from "./MaterialLogDetail";
import SearchDate from "../../components/SearchDate";
import Status from "../../components/Status";
import Pagination from "../../components/Pagination";
import SelectBar from "../../components/SelectBar";
import {
  IoArrowForwardCircleOutline,
  IoArrowBackCircleOutline,
} from "react-icons/io5";

import { FiArchive } from "react-icons/fi";
import { InventoryAPI2 } from "../../api/AxiosAPI2";

export default function MaterialLog() {
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [typeFilter, setTypeFilter] = useState("ALL");
  const workerMapRef = useRef({});

  const WORKERS = [
    "우민규",
    "테스터",
    "이현수",
    "양찬종",
    "김하린",
    "이준호",
    "박서준",
    "최지우",
    "정유진",
    "강동원",
    "한소희",
  ];

  const getWorkerByJob = (jobKey) => {
    if (!jobKey) return "-";

    if (!workerMapRef.current[jobKey]) {
      const idx = Object.keys(workerMapRef.current).length % WORKERS.length;
      workerMapRef.current[jobKey] = WORKERS[idx];
    }

    return workerMapRef.current[jobKey];
  };

  const formatDateTime = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const formatDateParam = (d) => {
    if (!d) return null;
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const convertTypeForServer = (type) => {
    if (type === "IN") return "INBOUND";
    if (type === "USE") return "CONSUME";
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await InventoryAPI2.getMaterialTxList({
          page,
          keyword,
          type: convertTypeForServer(typeFilter),
          ...(dateRange.start && {
            startDate: formatDateParam(dateRange.start),
          }),
          ...(dateRange.end && { endDate: formatDateParam(dateRange.end) }),
        });
        const data = res.data;

        setRows(
          data.content.map((item) => {
            const jobKey = item.productLotNo || item.materialNo || item.id;

            return {
              id: item.id,
              occurredAt: item.txTime,
              type:
                item.txType?.trim().toUpperCase() === "INBOUND" ? "IN" : "USE",
              materialName: item.materialName,
              materialLotNo: item.materialNo,
              productLotNo: item.productLotNo,
              qty: Number(item.qty),
              unit: item.unit,
              materialCode: "-",
              operator: getWorkerByJob(jobKey), // ⭐ 핵심
            };
          }),
        );

        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, keyword, typeFilter, dateRange]);

  const [totalSummary, setTotalSummary] = useState({
    inQty: 0,
    outUseQty: 0,
    rate: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = {
          type: convertTypeForServer(typeFilter),
          keyword: keyword || "",
        };

        if (dateRange.start)
          params.startDate = formatDateParam(dateRange.start);
        if (dateRange.end) params.endDate = formatDateParam(dateRange.end);

        const res = await InventoryAPI2.getMaterialTxSummary(params);
        if (res && res.data) {
          setTotalSummary(res.data);
        }
      } catch (e) {
        console.error("Summary Load Error:", e);
      }
    };

    fetchSummary();
  }, [keyword, typeFilter, dateRange]);

  const LOG_TYPE_OPTIONS = [
    { value: "ALL", label: "전체 구분" },
    { value: "IN", label: "자재입고" },
    { value: "USE", label: "생산투입" },
  ];

  const sortedRows = useMemo(() => {
    let sortableItems = [...rows];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue !== "number") {
          aValue = String(aValue);
          bValue = String(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [rows, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleDateChange = (start, end) => {
    setDateRange({ start, end });
    setPage(0);
  };

  const onRowClick = (row) => {
    setSelected(row.id);
    setDrawerOpen(true);
  };

  const columns = [
    {
      key: "occurredAt",
      label: "일시",
      width: 150,
      render: (val) => formatDateTime(val),
    },
    {
      key: "type",
      label: "구분",
      width: 100,
      render: (value) => {
        const statusKey = value === "IN" ? "MATIN" : "MATOUT";
        return <Status status={statusKey} type="basic" />;
      },
    },
    { key: "materialName", label: "자재명", width: 130 },
    // [New] 제품 LOT (자재 LOT 왼쪽)
    {
      key: "productLotNo",
      label: "제품 LOT",
      width: 150,
      render: (val, row) => (row.type === "IN" ? "-" : val || "-"),
    },
    { key: "materialLotNo", label: "자재 LOT 번호", width: 150 },
    {
      key: "qty",
      label: "이동수량",
      width: 90,
      render: (val) => (
        <QtyText $isPositive={val > 0}>
          {val > 0 ? `+${val.toLocaleString()}` : val.toLocaleString()}
        </QtyText>
      ),
    },
    { key: "unit", label: "단위", width: 60 },
    { key: "operator", label: "작업자", width: 90 },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>자재 입출고 이력 조회</h2>
      </Header>

      <SummaryGrid>
        <SummaryCard
          icon={<IoArrowBackCircleOutline />}
          label="입고된 자재 수량"
          value={totalSummary.inQty.toLocaleString()}
          color="var(--run)"
        />
        <SummaryCard
          icon={<IoArrowForwardCircleOutline />}
          label="생산 투입"
          value={totalSummary.outUseQty.toLocaleString()}
          color="var(--error)"
        />
        <SummaryCard
          icon={<FiArchive />}
          label="입출고 비율 (투입/입고)"
          value={`${totalSummary.rate}%`}
          color="var(--main)"
        />
      </SummaryGrid>

      <FilterBar>
        <SearchDate
          width="m"
          onChange={handleDateChange}
          placeholder="일자 검색"
        />
        <SelectBar
          width="140px"
          options={LOG_TYPE_OPTIONS}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(0);
          }}
          placeholder="구분 선택"
        />
        <SearchBar
          width="l"
          placeholder="자재명 / LOT 검색"
          onChange={setKeyword}
          onSearch={(val) => {
            setKeyword(val);
            setPage(0);
          }}
        />
      </FilterBar>

      <TableWrap>
        <TableStyle
          columns={columns}
          data={sortedRows}
          selectable={false}
          onRowClick={onRowClick}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        <Pagination
          page={page + 1}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p - 1)}
        />
      </TableWrap>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selected && <MaterialLogDetail id={selected} />}
      </SideDrawer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  h2 {
    font-size: var(--fontHd);
    font-weight: var(--bold);
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`;

const FilterBar = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const QtyText = styled.span`
  font-weight: var(--bold);
  color: ${(props) => (props.$isPositive ? "var(--main)" : "var(--error)")};
`;
