import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import Table from "../../components/TableStyle";
import Button from "../../components/Button";
import { InventoryAPI } from "../../api/AxiosAPI";

export default function ProductForm({ mode, initialData, onSubmit }) {
  const [product, setProduct] = useState({
    productCode: "",
    productName: "",
    voltage: 12,
    capacityAh: "",
    unit: "EA",
  });

  const [materials, setMaterials] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // 수정 모드 초기값 세팅
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setProduct({
        productCode: initialData.productCode,
        productName: initialData.productName,
        voltage: initialData.voltage,
        capacityAh: initialData.capacityAh,
        unit: initialData.unit || "EA",
      });
    }
  }, [mode, initialData]);

  // 자재 목록 조회
  useEffect(() => {
    if (mode === "create") {
      fetchMaterials();
    }
  }, [mode]);

  const fetchMaterials = async () => {
    try {
      const res = await InventoryAPI.getMaterialList();
      if (res.status === 200) {
        setMaterials(
          res.data.map((m) => ({
            ...m,
            // 테이블 컴포넌트가 id를 필요로 하므로 materialCode를 id로 사용
            id: m.materialCode,
            qty: "0",
          })),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // [핵심 수정 1] materialCode를 기준으로 수량 업데이트 + 자동 선택 로직
  const handleQtyChange = (code, value) => {
    const numValue = Number(value);

    // 1. 수량 상태 업데이트
    setMaterials((prev) =>
      prev.map((m) => (m.materialCode === code ? { ...m, qty: value } : m)),
    );

    // 2. [편의성] 수량이 0보다 크면 자동으로 체크박스 선택
    if (numValue > 0) {
      setSelectedIds((prev) => {
        if (!prev.includes(code)) return [...prev, code];
        return prev;
      });
    }
  };

  const bomItems = useMemo(() => {
    // 체크된 항목 중 수량이 있는 것만 필터링
    return materials
      .filter((m) => selectedIds.includes(m.materialCode) && Number(m.qty) > 0)
      .map((m) => ({
        materialCode: m.materialCode,
        materialName: m.materialName,
        qty: Number(m.qty),
        unit: m.unit || "EA",
      }));
  }, [materials, selectedIds]);

  const handleSubmit = () => {
    if (mode === "create") {
      // BOM 항목이 없어도 경고 없이 제품만 등록되던 문제 방지 (선택사항)
      /* if (bomItems.length === 0) {
         if(!window.confirm("BOM 없이 제품만 등록하시겠습니까?")) return;
      }
      */

      const payload = {
        product: {
          productCode: product.productCode,
          productName: product.productName,
          voltage: Number(product.voltage),
          capacityAh: Number(product.capacityAh),
          unit: product.unit,
        },
        bomItems: bomItems,
      };
      onSubmit(payload);
    } else {
      onSubmit({
        productName: product.productName,
        capacityAh: Number(product.capacityAh),
      });
    }
  };

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
          // [핵심 수정 2] row.no가 아니라 row.materialCode 사용
          onChange={(e) => handleQtyChange(row.materialCode, e.target.value)}
          style={{ width: "80px", padding: "4px" }}
          onClick={(e) => e.stopPropagation()}
          placeholder="0"
        />
      ),
    },
    { key: "unit", label: "단위", width: 80 },
  ];

  return (
    <Wrapper>
      <Section>
        <h4>제품 기본 정보</h4>

        <Field>
          <label>제품 코드</label>
          <input
            name="productCode"
            value={product.productCode}
            onChange={handleProductChange}
            disabled={mode === "edit"}
            placeholder="예: BAT-12V-100AH"
          />
        </Field>

        <Field>
          <label>제품명</label>
          <input
            name="productName"
            value={product.productName}
            onChange={handleProductChange}
            placeholder="예: 고성능 배터리"
          />
        </Field>

        <Row>
          <Field>
            <label>전압(V)</label>
            <input
              type="number"
              name="voltage"
              value={product.voltage}
              onChange={handleProductChange}
              disabled={mode === "edit"}
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

      {mode === "create" && (
        <Section>
          <h4>BOM 레시피 구성 (수량 입력 시 자동 선택)</h4>
          <Table
            columns={columns}
            data={materials}
            selectedIds={selectedIds} // Table 컴포넌트가 ID 배열을 받음
            onSelectChange={setSelectedIds}
          />
        </Section>
      )}

      <Footer>
        <Button variant="ok" size="m" onClick={handleSubmit}>
          {mode === "create" ? "제품 + BOM 등록" : "수정하기"}
        </Button>
      </Footer>
    </Wrapper>
  );
}

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
