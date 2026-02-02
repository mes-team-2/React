import styled from "styled-components";
import { useState } from "react";
import Table from "../../components/TableStyle";
import SideDrawer from "../../components/SideDrawer";
import Status from "../../components/Status";
import ProductDetail from "./ProductDetail";
import ProductForm from "./ProductForm";
import Button from "../../components/Button";

/* =========================
   제품 기준 관리
========================= */
export default function Product() {
  const [products, setProducts] = useState([
    {
      productId: 1,
      productCode: "BAT-12V-60",
      productName: "12V 차량용 배터리 60Ah",
      voltage: 12,
      capacityAh: 60,
      type: "완제품",
      active: true,
      updatedAt: "2026-02-01",
    },
  ]);

  const [drawer, setDrawer] = useState({
    open: false,
    type: null, // detail | create | edit
  });

  const [selected, setSelected] = useState(null);

  const openDrawer = (type, row = null) => {
    setSelected(row);
    setDrawer({ open: true, type });
  };

  const closeDrawer = () => {
    setDrawer({ open: false, type: null });
    setSelected(null);
  };

  /* ===== CRUD ===== */

  const handleCreate = (data) => {
    setProducts((prev) => [
      ...prev,
      {
        ...data,
        productId: Date.now(),
        updatedAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    closeDrawer();
  };

  const handleUpdate = (data) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === data.productId
          ? { ...p, ...data, updatedAt: new Date().toISOString().slice(0, 10) }
          : p,
      ),
    );
    closeDrawer();
  };

  const handleInactive = (row) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === row.productId ? { ...p, active: false } : p,
      ),
    );
  };

  const columns = [
    { key: "productCode", label: "제품 코드", width: 160 },
    { key: "productName", label: "제품명", width: 220 },
    { key: "voltage", label: "전압", width: 80 },
    { key: "capacityAh", label: "용량(Ah)", width: 100 },
    {
      key: "active",
      label: "상태",
      width: 120,
      render: (v) => (
        <Status
          type={v ? "success" : "default"}
          label={v ? "사용중" : "중지"}
        />
      ),
    },
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
        width={drawer.type === "detail" ? 720 : 420}
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

/* =========================
   styled
========================= */

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
