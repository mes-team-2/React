import styled from "styled-components";
import { useState, useEffect } from "react";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import ProductDetail from "./ProductDetail";
import ProductForm from "./ProductForm";
import Button from "../../components/Button";
import { WorkOrderAPI } from "../../api/AxiosAPI";

export default function Product() {
  const [products, setProducts] = useState([]);

  const [drawer, setDrawer] = useState({
    open: false,
    type: null, // detail | create | edit
  });

  const [selected, setSelected] = useState(null);

  // 1. 목록 조회
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

  const openDrawer = (type, row = null) => {
    setSelected(row);
    setDrawer({ open: true, type });
  };

  const closeDrawer = () => {
    setDrawer({ open: false, type: null });
    setSelected(null);
  };

  /* ===== CRUD ===== */
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

  const columns = [
    { key: "productCode", label: "제품 코드", width: 160 },
    { key: "productName", label: "제품명", width: 220 },
    { key: "voltage", label: "전압", width: 80 },
    { key: "capacityAh", label: "용량(Ah)", width: 100 },
    // [수정] 상태 -> 단위로 변경
    { key: "unit", label: "단위", width: 80 },
    { key: "updatedAt", label: "수정일", width: 120 },
  ];

  return (
    <Wrapper>
      <Header>
        <h2>제품 기준 관리</h2>
        <AddBtn onClick={() => openDrawer("create")}>+ 제품 등록</AddBtn>
      </Header>

      <Table
        columns={columns}
        data={products}
        onRowClick={(row) => openDrawer("detail", row)}
        selectable={false}
      />

      <SideDrawer
        open={drawer.open}
        title={
          drawer.type === "create"
            ? "제품 등록"
            : drawer.type === "edit"
              ? "제품 수정"
              : "제품 기준 상세"
        }
        onClose={closeDrawer}
      >
        {drawer.type === "detail" && selected && (
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

        {drawer.type === "create" && (
          <ProductForm mode="create" onSubmit={handleCreate} />
        )}

        {drawer.type === "edit" && selected && (
          <ProductForm
            mode="edit"
            initialData={selected}
            onSubmit={handleUpdate}
          />
        )}
      </SideDrawer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const AddBtn = styled.button`
  padding: 8px 14px;
  background: var(--main);
  color: white;
  border-radius: 8px;
  font-weight: 600;
`;
const DrawerFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  margin-top: 20px;
  border-top: 1px solid var(--border);
`;
