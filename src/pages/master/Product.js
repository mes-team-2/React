import styled from "styled-components";
import { useState, useEffect, useMemo } from "react";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import ProductDetail from "./ProductDetail";
import ProductForm from "./ProductForm";
import Button from "../../components/Button";
import SearchBar from "../../components/SearchBar";
import SearchDate from "../../components/SearchDate";
import { WorkOrderAPI } from "../../api/AxiosAPI";

export default function Product() {
  const [products, setProducts] = useState([]);

  // 검색 및 필터링을 위한 State
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const [drawer, setDrawer] = useState({
    open: false,
    type: null, // detail | create | edit
  });

  const [selected, setSelected] = useState(null);

  // 목록 조회
  const fetchProducts = async () => {
    try {
      const res = await WorkOrderAPI.getProductList();
      setProducts(res.data);
    } catch (err) {
      console.error("제품 목록 로드 실패", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 데이터 필터링 로직 (검색어 + 날짜)
  const filteredData = useMemo(() => {
    return products.filter((item) => {
      // 검색어 필터 (제품코드, 제품명)
      const lowerTerm = searchTerm.toLowerCase();
      const matchText =
        (item.productCode || "").toLowerCase().includes(lowerTerm) ||
        (item.productName || "").toLowerCase().includes(lowerTerm);

      if (!matchText) return false;

      // 날짜 필터 (제품 등록일 기준)
      if (dateRange.start && dateRange.end) {
        const itemDate = new Date(item.createdAt);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        itemDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return itemDate >= startDate && itemDate <= endDate;
      }

      return true;
    });
  }, [products, searchTerm, dateRange]);

  const openDrawer = (type, row = null) => {
    setSelected(row);
    setDrawer({ open: true, type });
  };

  const closeDrawer = () => {
    setDrawer({ open: false, type: null });
    setSelected(null);
  };

  const handleCreate = async (payload) => {
    try {
      await WorkOrderAPI.createProduct(payload);
      alert("제품이 등록되었습니다.");
      closeDrawer();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("제품 등록 실패");
    }
  };

  const handleUpdate = async (formData) => {
    if (!selected) return;
    try {
      await WorkOrderAPI.updateProduct(selected.productId, formData);
      alert("수정되었습니다.");
      closeDrawer();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("수정 실패");
    }
  };

  // 날짜 포맷팅 함수 (yyyy-MM-dd HH:mm)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);

    // 유효하지 않은 날짜인 경우 원본 반환
    if (isNaN(date.getTime())) return dateString;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${minute}`;
  };

  const columns = [
    { key: "productCode", label: "제품 코드", width: 160 },
    { key: "productName", label: "제품명", width: 220 },
    { key: "voltage", label: "전압", width: 80, render: (val) => `${val}V` },

    {
      key: "capacityAh",
      label: "용량",
      width: 100,
      render: (val) => `${val}Ah`,
    },
    { key: "unit", label: "단위", width: 80 },
    {
      key: "createdAt",
      label: "등록일",
      width: 160,
      render: (val) => formatDate(val),
    },
    {
      key: "updatedAt",
      label: "수정일",
      width: 160,
      render: (val) => formatDate(val),
    },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>제품 기준 관리</h2>
      </Header>

      <FilterBar>
        <FilterGroup>
          <SearchDate onChange={(start, end) => setDateRange({ start, end })} />
          <SearchBar
            width="l"
            placeholder="제품코드 / 제품명 검색"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </FilterGroup>

        <Button variant="ok" size="m" onClick={() => openDrawer("create")}>
          + 제품 등록
        </Button>
      </FilterBar>

      <Table
        columns={columns}
        data={filteredData}
        onRowClick={(row) => openDrawer("detail", row)}
        selectable={false}
      />

      {/* [상세 보기용 Drawer]
        - ProductDetail은 SideDrawer를 내장하고 있지 않으므로 여기서 감싸줍니다.
      */}
      {drawer.type === "detail" && (
        <SideDrawer
          open={drawer.open}
          title="제품 기준 상세"
          onClose={closeDrawer}
        >
          {selected && (
            <>
              <ProductDetail product={selected} />
              <DrawerFooter>
                <Button
                  variant="ok"
                  size="m"
                  onClick={() => openDrawer("edit", selected)}
                >
                  수정
                </Button>
                <Button variant="cancel" size="m" onClick={closeDrawer}>
                  닫기
                </Button>
              </DrawerFooter>
            </>
          )}
        </SideDrawer>
      )}

      {drawer.type === "create" && (
        <ProductForm
          open={drawer.open}
          mode="create"
          onSubmit={handleCreate}
          onClose={closeDrawer}
        />
      )}

      {drawer.type === "edit" && selected && (
        <ProductForm
          open={drawer.open}
          mode="edit"
          initialData={selected}
          onSubmit={handleUpdate}
          onClose={closeDrawer}
        />
      )}
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
    font-size: var(--fontXl);
    font-weight: var(--bold);
    color: var(--font);
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const DrawerFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  margin-top: 20px;
  border-top: 1px solid var(--border);
`;
