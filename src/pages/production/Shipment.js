import styled from "styled-components";
import { useMemo, useState } from "react";
import SummaryCard from "../../components/SummaryCard";
import SearchBar from "../../components/SearchBar";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import ShipmentDetail from "./ShipmentDetail";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import {
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPackage,
} from "react-icons/fi";

const STATUS = {
  READY: "출하대기",
  SHIPPING: "출하중",
  DONE: "출하완료",
  HOLD: "보류",
};

const STATUS_COLOR = {
  READY: "var(--waiting)",
  SHIPPING: "var(--main)",
  DONE: "var(--run)",
  HOLD: "var(--error)",
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeShipments() {
  const rows = [];
  let id = 1;
  const customers = ["현대모비스", "LG에너지솔루션", "삼성SDI", "SK온"];
  const products = [
    { code: "BAT-12V-60Ah", name: "자동차 납축전지 12V 60Ah" },
    { code: "BAT-12V-80Ah", name: "자동차 납축전지 12V 80Ah" },
  ];

  for (let d = 12; d >= 0; d--) {
    const day = new Date();
    day.setDate(day.getDate() - d);
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(day.getDate()).padStart(2, "0")}`;

    const cnt = rand(4, 10);
    for (let i = 0; i < cnt; i++) {
      const p = products[rand(0, products.length - 1)];
      const stKeys = Object.keys(STATUS);
      const st = stKeys[rand(0, stKeys.length - 1)];

      const qty = rand(50, 300);
      const shippedQty =
        st === "DONE" ? qty : st === "SHIPPING" ? rand(1, qty - 1) : 0;

      const orderNo = `SO-202601-${String(rand(1, 99)).padStart(3, "0")}`;
      const shipmentNo = `SHIP-202601-${String(id).padStart(4, "0")}`;

      rows.push({
        id: id++,
        planDate: dateStr,
        shipmentNo,
        orderNo,
        customer: customers[rand(0, customers.length - 1)],
        productCode: p.code,
        productName: p.name,
        qty,
        shippedQty,
        status: st,
        carrier: ["CJ대한통운", "로젠", "한진", "자체"][rand(0, 3)],
        trackingNo:
          st === "DONE" || st === "SHIPPING"
            ? `${rand(1000, 9999)}-${rand(1000, 9999)}-${rand(1000, 9999)}`
            : "-",
        palletCount: Math.max(1, Math.floor(qty / 80)),
        note: st === "HOLD" ? "거래처 요청 보류" : "",
      });
    }
  }

  return rows;
}

export default function Shipment() {
  const [rows] = useState(() => makeShipments());

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const filtered = useMemo(() => {
    let data = rows;
    if (statusFilter !== "ALL")
      data = data.filter((r) => r.status === statusFilter);

    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      data = data.filter(
        (r) =>
          r.shipmentNo.toLowerCase().includes(k) ||
          r.orderNo.toLowerCase().includes(k) ||
          r.customer.toLowerCase().includes(k) ||
          r.productCode.toLowerCase().includes(k) ||
          r.productName.toLowerCase().includes(k) ||
          (r.trackingNo || "").toLowerCase().includes(k),
      );
    }
    return data;
  }, [rows, keyword, statusFilter]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const ready = filtered.filter((r) => r.status === "READY").length;
    const shipping = filtered.filter((r) => r.status === "SHIPPING").length;
    const done = filtered.filter((r) => r.status === "DONE").length;
    const hold = filtered.filter((r) => r.status === "HOLD").length;

    const planQty = filtered.reduce((a, b) => a + b.qty, 0);
    const shippedQty = filtered.reduce((a, b) => a + b.shippedQty, 0);
    const fillRate =
      planQty === 0 ? 0 : Math.round((shippedQty / planQty) * 100);

    return {
      total,
      ready,
      shipping,
      done,
      hold,
      planQty,
      shippedQty,
      fillRate,
    };
  }, [filtered]);

  const dailyChart = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      const day = r.planDate.slice(5, 10);
      if (!map[day]) map[day] = { day, plan: 0, shipped: 0 };
      map[day].plan += r.qty;
      map[day].shipped += r.shippedQty;
    });
    return Object.values(map);
  }, [filtered]);

  const statusBar = useMemo(() => {
    const obj = { READY: 0, SHIPPING: 0, DONE: 0, HOLD: 0 };
    filtered.forEach((r) => (obj[r.status] += 1));
    return Object.entries(obj).map(([k, v]) => ({
      name: STATUS[k],
      count: v,
      key: k,
    }));
  }, [filtered]);

  const columns = [
    { key: "shipmentNo", label: "출하번호", width: 150 },
    { key: "customer", label: "거래처", width: 140 },
    { key: "productCode", label: "제품코드", width: 140 },
    { key: "shippedQty", label: "출하수량", width: 90 },
    {
      key: "status",
      label: "상태",
      width: 110,
      render: (v) => STATUS[v],
    },
  ];

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const sorted = useMemo(() => {
    if (!sortConfig.key) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (typeof av === "string")
        return sortConfig.direction === "asc"
          ? av.localeCompare(bv, "ko", { numeric: true })
          : bv.localeCompare(av, "ko", { numeric: true });
      return sortConfig.direction === "asc" ? av - bv : bv - av;
    });
  }, [filtered, sortConfig]);

  const onRowClick = (row) => {
    setSelected(row);
    setDrawerOpen(true);
  };

  return (
    <Wrapper>
      <Header>
        <h2>제품 출하 관리</h2>
      </Header>

      <SummaryGrid>
        <SummaryCard
          icon={<FiPackage />}
          label="출하 건수"
          value={summary.total.toLocaleString()}
          color="var(--main)"
        />
        <SummaryCard
          icon={<FiClock />}
          label="출하대기"
          value={summary.ready.toLocaleString()}
          color="var(--waiting)"
        />
        <SummaryCard
          icon={<FiTruck />}
          label="출하중"
          value={summary.shipping.toLocaleString()}
          color="var(--main)"
        />
        <SummaryCard
          icon={<FiCheckCircle />}
          label="출하완료"
          value={summary.done.toLocaleString()}
          color="var(--run)"
        />
        <SummaryCard
          icon={<FiXCircle />}
          label="보류"
          value={summary.hold.toLocaleString()}
          color="var(--error)"
        />
      </SummaryGrid>

      <ChartGrid>
        <ChartCard>
          <h4>일자별 출하(계획 vs 실적)</h4>
          <ChartBox>
            <ResponsiveContainer>
              <LineChart data={dailyChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  dataKey="plan"
                  stroke="var(--main)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="shipped"
                  stroke="var(--run)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </ChartCard>

        <ChartCard>
          <h4>상태 분포</h4>
          <ChartBox>
            <ResponsiveContainer>
              <BarChart data={statusBar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--main)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </ChartCard>
      </ChartGrid>

      <FilterBar>
        <SearchWrap>
          <SearchBar
            value={keyword}
            onChange={setKeyword}
            placeholder="출하번호/주문번호/거래처/제품/운송장 검색"
          />
        </SearchWrap>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">전체 상태</option>
          {Object.keys(STATUS).map((k) => (
            <option key={k} value={k}>
              {STATUS[k]}
            </option>
          ))}
        </Select>
      </FilterBar>

      <TableWrap>
        <Table
          columns={columns}
          data={sorted}
          sortConfig={sortConfig}
          onSort={handleSort}
          selectable={false}
          onRowClick={onRowClick}
          rowStyle={(row) => ({
            color: STATUS_COLOR[row.status] || "inherit",
          })}
        />
      </TableWrap>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <ShipmentDetail row={selected} />
      </SideDrawer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Header = styled.div`
  h2 {
    font-size: 22px;
    font-weight: 700;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

  h4 {
    font-size: 14px;
    margin: 0 0 10px 0;
  }
`;

const ChartBox = styled.div`
  height: 260px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SearchWrap = styled.div`
  flex: 1;
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: white;
  font-size: 13px;
  min-width: 160px;
`;

const TableWrap = styled.div`
  background: white;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
`;
