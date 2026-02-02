import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import Button from "../../components/Button";
import { InventoryAPI } from "../../api/AxiosAPI";

/* =========================
   제품 + BOM 등록 폼
========================= */
export default function ProductForm({ mode, initialData, onSubmit }) {
  /* =========================
     제품 기본 정보
  ========================= */
  const [product, setProduct] = useState({
    productCode: "",
    productName: "",
    voltage: 12,
    capacityAh: "",
    type: "완제품",
    active: true,
  });

  /* =========================
     자재 목록 & BOM
  ========================= */
  const [materials, setMaterials] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  /* =========================
     자재 조회
  ========================= */
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const res = await InventoryAPI.getMaterialList();
    if (res.status === 200) {
      // BOM용 기본 qty = 0
      setMaterials(
        res.data.map((m) => ({
          ...m,
          qty: "0",
        })),
      );
    }
  };

  /* =========================
     입력 처리
  ========================= */
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleQtyChange = (id, value) => {
    setMaterials((prev) =>
      prev.map((m) => (m.no === id ? { ...m, qty: value } : m)),
    );
  };

  /* =========================
     BOM 데이터 생성
  ========================= */
  const bomItems = useMemo(() => {
    return materials
      .filter((m) => selectedIds.includes(m.no) && Number(m.qty) > 0)
      .map((m) => ({
        materialCode: m.materialCode,
        materialName: m.materialName,
        qty: Number(m.qty),
        unit: m.unit || "EA",
      }));
  }, [materials, selectedIds]);

  /* =========================
     저장
  ========================= */
  const handleSubmit = () => {
    if (mode === "create") {
      onSubmit({
        product,
        bomItems,
      });
    } else {
      onSubmit({
        ...product,
      });
    }
  };

  /* =========================
     테이블 컬럼
  ========================= */
  const columns = [
    { key: "materialCode", label: "자재 코드", width: 160 },
    { key: "materialName", label: "자재명", width: 200 },
    {
      key: "qty",
      label: "소요량",
      width: 120,
      render: (_, row) => (
        <input
          type="number"
          min={0}
          value={row.qty}
          onChange={(e) => handleQtyChange(row.no, e.target.value)}
          style={{ width: "80px" }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  return (
    <Wrapper>
      {/* ===== 제품 정보 ===== */}
      <Section>
        <h4>제품 기본 정보</h4>

        <Field>
          <label>제품 코드</label>
          <input
            name="productCode"
            value={product.productCode}
            onChange={handleProductChange}
          />
        </Field>

        <Field>
          <label>제품명</label>
          <input
            name="productName"
            value={product.productName}
            onChange={handleProductChange}
          />
        </Field>

        <Row>
          <Field>
            <label>전압(V)</label>
            <input
              type="number"
              name="voltage"
              value={product.voltage}
              disabled
            />
          </Field>
          <Field>
            <label>용량(Ah)</label>
            <input
              type="number"
              name="capacityAh"
              value={product.capacityAh}
              onChange={handleProductChange}
            />
          </Field>
        </Row>
      </Section>

      {/* ===== BOM 구성 (제품 등록 시에만) ===== */}
      {mode === "create" && (
        <Section>
          <h4>BOM 레시피 구성</h4>

          <Table
            columns={columns}
            data={materials}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
          />
        </Section>
      )}

      {/* ===== 저장 ===== */}
      <Footer>
        <Button variant="ok" size="m" onClick={handleSubmit}>
          {mode === "create" ? "제품 + BOM 등록" : "수정하기"}
        </Button>
      </Footer>
    </Wrapper>
  );
}

/* =========================
   styled
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;

  h4 {
    font-size: 14px;
    font-weight: 600;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;

  label {
    font-size: 12px;
    opacity: 0.7;
  }

  input {
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid var(--border);
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
`;
