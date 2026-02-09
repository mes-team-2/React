import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
  IoArrowForwardCircleOutline,
  IoArrowBackCircleOutline,
} from "react-icons/io5";
import { FiEdit } from "react-icons/fi";
import TableStyle from "../../components/TableStyle";
import SearchBar from "../../components/SearchBar";
import SearchDate from "../../components/SearchDate";
import SummaryCard from "../../components/SummaryCard";
import Status from "../../components/Status";
import Pagination from "../../components/Pagination";
import SelectBar from "../../components/SelectBar";
import Button from "../../components/Button";
import ShipmentDrawer from "./ShipmentDrawer";
import { InventoryAPI2 } from "../../api/AxiosAPI2";
import { ShipmentAPI } from "../../api/AxiosAPI";

// 날짜 포맷 함수
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

const Shipment = () => {
  const [sortConfig, setSortConfig] = useState({
    key: "tx_time",
    direction: "desc",
  });
  const [selectedRow, setSelectedRow] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchDateRange, setSearchDateRange] = useState({
    start: null,
    end: null,
  });
  const [txTypeFilter, setTxTypeFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shipmentData, setShipmentData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);

  const [expandedMap, setExpandedMap] = useState({});

  // 🔥 제품별 누적 출고 수량 계산
  const totalOutByProduct = useMemo(() => {
    return shipmentData.reduce((acc, sh) => {
      const lotNo = sh.lotNo ?? sh.lot;
      if (!acc[lotNo]) acc[lotNo] = 0;
      if (sh.qty < 0) acc[lotNo] += Math.abs(sh.qty);
      return acc;
    }, {});
  }, [shipmentData]);

  const toggleExpand = (lotNo) => {
    setExpandedMap((prev) => ({
      ...prev,
      [lotNo]: !prev[lotNo],
    }));
  };

  const STATUS_OPTIONS = [
    { value: "ALL", label: "전체 구분" },
    { value: "IN", label: "생산입고" },
    { value: "OUT", label: "출고" },
  ];

  const fetchInventory = async () => {
    const res = await InventoryAPI2.getFgLotInventory();
    setInventoryData(res.data);
  };
  useEffect(() => {
    console.log("inventory row example:", inventoryData[0]);
  }, [inventoryData]);

  useEffect(() => {
    fetchInventory();
    fetchShipmentHistory();
  }, []);

  const mergedData = useMemo(() => {
    const map = {};

    // 1️⃣ 재고 기준행
    inventoryData.forEach((inv) => {
      map[inv.lotNo] = {
        base: {
          ...inv,
          lotNo: inv.lotNo,
          productName: inv.productName,
          qty: inv.stockQty,
          rowType: "BASE",
          status_key: "in",
          tx_time: inv.updatedAt ?? null,
          initialQty: inv.stockQty + (totalOutByProduct[inv.lotNo] ?? 0),
        },
        shipments: [],
      };
    });

    // 2️⃣ 출고 이력 붙이기
    shipmentData.forEach((sh) => {
      const lotNo = sh.lotNo ?? sh.lot;
      if (!lotNo) return;

      if (map[lotNo]) {
        map[lotNo].shipments.push({
          ...sh,
          rowType: "SHIPMENT",
          status_key: "out",
        });
      }
    });

    // 3️⃣ 기준행 → 출고행 순서로 평탄화
    return Object.values(map).flatMap((g) => {
      const lotNo = g.base.lotNo;
      const expanded = expandedMap[lotNo];

      return expanded ? [g.base, ...g.shipments] : [g.base];
    });
  }, [inventoryData, shipmentData, expandedMap]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return mergedData.slice(startIndex, startIndex + itemsPerPage);
  }, [mergedData, page]);

  const totalPages = Math.ceil(mergedData.length / itemsPerPage);

  const summary = useMemo(() => {
    let totalOut = 0;

    //출고 합계 (shipmentData 기준)
    shipmentData.forEach((sh) => {
      if (sh.qty < 0) {
        totalOut += Math.abs(sh.qty);
      }
    });

    //현재 재고 합계 (inventoryData 기준)
    const totalStock = inventoryData.reduce(
      (sum, inv) => sum + inv.stockQty,
      0,
    );

    //총 입고 = 재고 + 출고
    const totalIn = totalStock + totalOut;

    return {
      totalCount: shipmentData.length,
      totalIn,
      totalOut,
      adjustmentQty: 0,
    };
  }, [shipmentData, inventoryData]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const columns = useMemo(
    () => [
      {
        key: "tx_time",
        label: "일시",
        width: 150,
        render: (val) => formatDate(val),
      },
      {
        key: "status_key",
        label: "구분",
        width: 150,
        render: (val) => <Status status={val} />,
      },
      { key: "code", label: "제품코드", width: 130 },
      { key: "lotNo", label: "LOT 번호", width: 130 },
      {
        key: "productName",
        label: "제품명",
        render: (val, row) => {
          if (row.rowType === "BASE") {
            const lotNo = row.lotNo;

            return (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(lotNo);
                  }}
                >
                  {expandedMap[lotNo] ? "▼" : "▶"}
                </span>
                <span>{val}</span>
              </span>
            );
          }

          // 출고행
          return (
            <span style={{ paddingLeft: 24, color: "#666" }}>↳ {val}</span>
          );
        },
      },
      {
        key: "qty",
        label: "수량",
        render: (val, row) => {
          const qty = Number(val ?? 0);

          return (
            <QtyText $isPositive={qty > 0}>
              {qty > 0 ? `+${qty.toLocaleString()}` : qty.toLocaleString()}
            </QtyText>
          );
        },
      },
      { key: "unit", label: "단위", width: 60 },
    ],
    [expandedMap],
  );

  const fetchShipmentHistory = async () => {
    const params = {};
    if (searchDateRange.start)
      params.start = searchDateRange.start.toISOString();
    if (searchDateRange.end) params.end = searchDateRange.end.toISOString();

    const res = await ShipmentAPI.getList(params);
    console.log("shipmentData example:", res.data[0]);
    setShipmentData(res.data);
  };

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
      </SummaryGrid>
      <FilterBar>
        <SearchDate
          width="m"
          onChange={(start, end) => {
            setSearchDateRange({ start, end });
            setPage(1);
          }}
        />
        <SelectBar
          width="s"
          options={STATUS_OPTIONS}
          value={txTypeFilter}
          onChange={(e) => {
            setTxTypeFilter(e.target.value);
            setPage(1);
          }}
          placeholder="구분 선택"
        />
        <SearchBar
          width="l"
          placeholder="제품코드, 명 검색"
          onSearch={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
        />
      </FilterBar>
      <TableContainer>
        <TableStyle
          data={paginatedData}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable={false}
          getRowKey={(row) =>
            row.rowType === "BASE"
              ? `BASE-${row.lotNo}`
              : `SHIP-${row.id ?? row.tx_time}`
          }
          onRowClick={(row) => {
            if (row.rowType === "SHIPMENT") return;
            setSelectedRow(row);
            setDrawerOpen(true);
          }}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </TableContainer>

      <ShipmentDrawer
        open={drawerOpen}
        baseItem={selectedRow}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => {
          fetchInventory();
          fetchShipmentHistory();
          setDrawerOpen(false);
        }}
        shipmentHistory={
          selectedRow
            ? shipmentData.filter((sh) => sh.lotNo === selectedRow.lotNo)
            : []
        }
      />
    </Wrapper>
  );
};

export default Shipment;

/* ===== styles ===== */

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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`;

const FilterBar = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
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
  color: ${(props) => (props.$isPositive ? "var(--main)" : "var(--error)")};
`;
